import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GitHubUser, AnnualReviewData, LoadingState } from '@/types/github'
import { createGitHubService, GitHubService } from '@/services/github'

const TOKEN_STORAGE_KEY = 'github_token'

export const useGitHubStore = defineStore('github', () => {
  // State
  const token = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEY))
  const user = ref<GitHubUser | null>(null)
  const annualReview = ref<AnnualReviewData | null>(null)
  const reviewYear = ref<number>(new Date().getFullYear())
  const loading = ref<LoadingState>({
    isLoading: false,
    message: '',
    progress: 0
  })
  const error = ref<string | null>(null)

  // GitHub service instance
  let githubService: GitHubService | null = null

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const hasReviewData = computed(() => !!annualReview.value)
  const displayYear = computed(() => (annualReview.value?.year ?? reviewYear.value).toString())
  const pageTitle = computed(() => {
    const login = user.value?.login ?? annualReview.value?.user.login
    return login ? `${login} - ${reviewYear.value}` : 'GitHub Annual Review'
  })

  // Actions
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken)
    githubService = createGitHubService(newToken)
  }

  function clearToken() {
    token.value = null
    user.value = null
    annualReview.value = null
    reviewYear.value = new Date().getFullYear()
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    githubService = null
  }

  function setLoading(isLoading: boolean, message: string = '', progress: number = 0) {
    loading.value = { isLoading, message, progress }
  }

  function setError(errorMessage: string | null) {
    error.value = errorMessage
  }

  async function validateAndSetToken(newToken: string): Promise<boolean> {
    setLoading(true, 'Validating token...', 10)
    setError(null)

    try {
      const service = createGitHubService(newToken)
      const isValid = await service.validateToken()

      if (isValid) {
        setToken(newToken)
        setLoading(true, 'Fetching user profile...', 30)
        user.value = await service.getUser()
        reviewYear.value = new Date().getFullYear()
        setLoading(false)
        return true
      } else {
        setError('Invalid token. Please check and try again.')
        setLoading(false)
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate token')
      setLoading(false)
      return false
    }
  }

  async function fetchAnnualReview(year?: number): Promise<void> {
    const targetYear = year ?? reviewYear.value
    if (!token.value) {
      setError('No token available')
      return
    }

    setLoading(true, 'Initializing...', 0)
    setError(null)

    try {
      if (!githubService) {
        githubService = createGitHubService(token.value)
      }

      setLoading(true, 'Fetching your GitHub data...', 20)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        if (loading.value.progress < 80) {
          loading.value.progress += 10
        }
      }, 500)

      setLoading(true, 'Analyzing contributions...', 40)
      const reviewData = await githubService.getAnnualReview(targetYear)

      clearInterval(progressInterval)

      setLoading(true, 'Processing statistics...', 90)
      annualReview.value = reviewData
      user.value = reviewData.user
      reviewYear.value = reviewData.year

      setLoading(true, 'Complete!', 100)

      setTimeout(() => {
        setLoading(false)
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch annual review')
      setLoading(false)
    }
  }

  // Initialize service if token exists
  if (token.value) {
    githubService = createGitHubService(token.value)
  }

  return {
    // State
    token,
    user,
    annualReview,
    reviewYear,
    loading,
    error,
    // Computed
    isAuthenticated,
    hasReviewData,
    displayYear,
    pageTitle,
    // Actions
    setToken,
    clearToken,
    setLoading,
    setError,
    validateAndSetToken,
    fetchAnnualReview
  }
})
