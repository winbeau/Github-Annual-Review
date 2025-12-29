import { Octokit } from '@octokit/rest'
import type {
  GitHubUser,
  AnnualReviewData,
  LanguageStat,
  ContributionCalendar,
  GraphQLContributionsResponse,
  MonthlyContribution,
  Repository,
  CommitInsights,
  WordFrequency,
  CommitType
} from '@/types/github'

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql'

export class GitHubService {
  private octokit: Octokit
  private token: string

  constructor(token: string) {
    this.token = token
    this.octokit = new Octokit({ auth: token })
  }

  /**
   * Get authenticated user profile
   */
  async getUser(): Promise<GitHubUser> {
    const { data } = await this.octokit.users.getAuthenticated()
    return data as GitHubUser
  }

  /**
   * Execute GraphQL query
   */
  private async graphql<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(GITHUB_GRAPHQL_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'GraphQL error')
    }

    return result.data
  }

  /**
   * Get contribution data for a specific year
   */
  async getContributions(username: string, year: number): Promise<GraphQLContributionsResponse> {
    const from = `${year}-01-01T00:00:00Z`
    const to = `${year}-12-31T23:59:59Z`

    const query = `
      query($username: String!, $from: DateTime!, $to: DateTime!, $since: GitTimestamp!, $until: GitTimestamp!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                  color
                  contributionLevel
                }
              }
            }
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            totalRepositoryContributions
            restrictedContributionsCount
          }
          repositories(first: 100, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: OWNER) {
            nodes {
              name
              description
              url
              stargazerCount
              forkCount
              primaryLanguage {
                name
                color
              }
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    name
                    color
                  }
                }
              }
              defaultBranchRef {
                target {
                  ... on Commit {
                    history(since: $since, until: $until) {
                      totalCount
                    }
                  }
                }
              }
            }
          }
          followers {
            totalCount
          }
        }
      }
    `

    return this.graphql<GraphQLContributionsResponse>(query, { username, from, to, since: from, until: to })
  }

  /**
   * Calculate language statistics from repositories
   */
  private calculateLanguageStats(data: GraphQLContributionsResponse): LanguageStat[] {
    const languageMap = new Map<string, { size: number; color: string }>()

    for (const repo of data.user.repositories.nodes) {
      for (const edge of repo.languages.edges) {
        const existing = languageMap.get(edge.node.name)
        if (existing) {
          existing.size += edge.size
        } else {
          languageMap.set(edge.node.name, {
            size: edge.size,
            color: edge.node.color || '#8b949e'
          })
        }
      }
    }

    const totalSize = Array.from(languageMap.values()).reduce((sum, lang) => sum + lang.size, 0)

    const languages: LanguageStat[] = Array.from(languageMap.entries())
      .map(([name, { size, color }]) => ({
        name,
        size,
        color,
        percentage: totalSize > 0 ? (size / totalSize) * 100 : 0
      }))
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)

    return languages
  }

  /**
   * Find the busiest day in the year
   */
  private findBusiestDay(calendar: ContributionCalendar): { date: string; contributions: number } | null {
    let busiestDay: { date: string; contributions: number } | null = null

    for (const week of calendar.weeks) {
      for (const day of week.contributionDays) {
        if (!busiestDay || day.contributionCount > busiestDay.contributions) {
          busiestDay = {
            date: day.date,
            contributions: day.contributionCount
          }
        }
      }
    }

    return busiestDay
  }

  /**
   * Find the most active repository in the year
   */
  private findMostActiveRepo(data: GraphQLContributionsResponse): Repository | null {
    let mostActive: { repo: Repository; commits: number } | null = null

    for (const repo of data.user.repositories.nodes) {
      const commits = repo.defaultBranchRef?.target?.history?.totalCount || 0

      if (!mostActive || commits > mostActive.commits) {
        mostActive = {
          repo: {
            id: 0,
            name: repo.name,
            full_name: repo.name,
            description: repo.description,
            html_url: repo.url,
            stargazers_count: repo.stargazerCount,
            forks_count: repo.forkCount,
            language: repo.primaryLanguage?.name || null,
            topics: [],
            created_at: '',
            updated_at: '',
            pushed_at: ''
          },
          commits
        }
      }
    }

    return mostActive?.repo || null
  }

  /**
   * Calculate total stars received
   */
  private calculateTotalStars(data: GraphQLContributionsResponse): number {
    return data.user.repositories.nodes.reduce((sum, repo) => sum + repo.stargazerCount, 0)
  }

  /**
   * Calculate monthly contributions
   */
  private calculateMonthlyContributions(calendar: ContributionCalendar): MonthlyContribution[] {
    const monthlyData = new Map<string, MonthlyContribution>()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    // Initialize all months
    months.forEach(month => {
      monthlyData.set(month, { month, commits: 0, prs: 0, issues: 0 })
    })

    // Aggregate contributions by month
    for (const week of calendar.weeks) {
      for (const day of week.contributionDays) {
        const date = new Date(day.date)
        const monthName = months[date.getMonth()]
        const data = monthlyData.get(monthName)!
        data.commits += day.contributionCount
      }
    }

    return Array.from(monthlyData.values())
  }

  /**
   * Get commit messages from repositories
   */
  async getCommitMessages(username: string, year: number): Promise<string[]> {
    const from = `${year}-01-01T00:00:00Z`
    const to = `${year}-12-31T23:59:59Z`

    const query = `
      query($username: String!, $since: GitTimestamp!, $until: GitTimestamp!) {
        user(login: $username) {
          repositories(first: 30, orderBy: {field: PUSHED_AT, direction: DESC}, ownerAffiliations: OWNER) {
            nodes {
              name
              defaultBranchRef {
                target {
                  ... on Commit {
                    history(first: 100, since: $since, until: $until) {
                      nodes {
                        message
                        committedDate
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    interface CommitHistoryResponse {
      user: {
        repositories: {
          nodes: {
            name: string
            defaultBranchRef: {
              target: {
                history: {
                  nodes: {
                    message: string
                    committedDate: string
                  }[]
                }
              }
            } | null
          }[]
        }
      }
    }

    const data = await this.graphql<CommitHistoryResponse>(query, { username, since: from, until: to })
    const messages: string[] = []

    for (const repo of data.user.repositories.nodes) {
      const commits = repo.defaultBranchRef?.target?.history?.nodes || []
      for (const commit of commits) {
        if (commit.message) {
          messages.push(commit.message)
        }
      }
    }

    return messages
  }

  /**
   * Analyze commit messages for insights
   */
  private analyzeCommitMessages(messages: string[]): CommitInsights {
    // Common words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
      'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
      'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
      'than', 'too', 'very', 'just', 'into', 'over', 'after', 'before', 'between',
      'through', 'during', 'above', 'below', 'up', 'down', 'out', 'off', 'about', 'if'
    ])

    // Count word frequency
    const wordCount = new Map<string, number>()
    let totalWords = 0
    let totalLength = 0
    let longestMessage = ''

    for (const message of messages) {
      // Get first line only (commit title)
      const title = message.split('\n')[0]
      totalLength += title.length

      if (title.length > longestMessage.length) {
        longestMessage = title
      }

      // Extract words
      const words = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word))

      for (const word of words) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1)
        totalWords++
      }
    }

    // Get top words
    const wordFrequency: WordFrequency[] = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([word, count]) => ({
        word,
        count,
        percentage: totalWords > 0 ? (count / totalWords) * 100 : 0
      }))

    // Detect commit types based on conventional commits
    const commitTypePatterns: { pattern: RegExp; type: string; color: string }[] = [
      { pattern: /^feat/i, type: 'Feature', color: '#238636' },
      { pattern: /^fix/i, type: 'Fix', color: '#f85149' },
      { pattern: /^docs/i, type: 'Docs', color: '#58a6ff' },
      { pattern: /^style/i, type: 'Style', color: '#f778ba' },
      { pattern: /^refactor/i, type: 'Refactor', color: '#8957e5' },
      { pattern: /^test/i, type: 'Test', color: '#e3b341' },
      { pattern: /^chore/i, type: 'Chore', color: '#8b949e' },
      { pattern: /^(add|create|implement)/i, type: 'Add', color: '#238636' },
      { pattern: /^(update|change|modify)/i, type: 'Update', color: '#58a6ff' },
      { pattern: /^(remove|delete)/i, type: 'Remove', color: '#f85149' },
      { pattern: /^(merge|pull)/i, type: 'Merge', color: '#8957e5' },
      { pattern: /^(init|initial)/i, type: 'Init', color: '#39d353' },
    ]

    const typeCounts = new Map<string, { count: number; color: string }>()
    let otherCount = 0

    for (const message of messages) {
      const title = message.split('\n')[0]
      let matched = false

      for (const { pattern, type, color } of commitTypePatterns) {
        if (pattern.test(title)) {
          const existing = typeCounts.get(type) || { count: 0, color }
          existing.count++
          typeCounts.set(type, existing)
          matched = true
          break
        }
      }

      if (!matched) {
        otherCount++
      }
    }

    // Add "Other" category if there are uncategorized commits
    if (otherCount > 0) {
      typeCounts.set('Other', { count: otherCount, color: '#484f58' })
    }

    const commitTypes: CommitType[] = Array.from(typeCounts.entries())
      .map(([type, { count, color }]) => ({ type, count, color }))
      .sort((a, b) => b.count - a.count)

    return {
      totalCommitMessages: messages.length,
      wordFrequency,
      commitTypes,
      averageMessageLength: messages.length > 0 ? Math.round(totalLength / messages.length) : 0,
      longestMessage: longestMessage.slice(0, 100),
      mostActiveHour: 0,
      commitsByHour: new Array(24).fill(0)
    }
  }

  /**
   * Get complete annual review data
   */
  async getAnnualReview(year: number = new Date().getFullYear()): Promise<AnnualReviewData> {
    // Get user profile
    const user = await this.getUser()

    // Get contribution data
    const contributionData = await this.getContributions(user.login, year)
    const { contributionsCollection } = contributionData.user

    // Calculate statistics
    const topLanguages = this.calculateLanguageStats(contributionData)
    const busiestDay = this.findBusiestDay(contributionsCollection.contributionCalendar)
    const mostActiveRepo = this.findMostActiveRepo(contributionData)
    const totalStars = this.calculateTotalStars(contributionData)
    const monthlyContributions = this.calculateMonthlyContributions(contributionsCollection.contributionCalendar)

    // Build repositories list
    const repositories: Repository[] = contributionData.user.repositories.nodes.map(repo => ({
      id: 0,
      name: repo.name,
      full_name: repo.name,
      description: repo.description,
      html_url: repo.url,
      stargazers_count: repo.stargazerCount,
      forks_count: repo.forkCount,
      language: repo.primaryLanguage?.name || null,
      topics: [],
      created_at: '',
      updated_at: '',
      pushed_at: ''
    }))

    // Get commit insights
    let commitInsights: CommitInsights | null = null
    try {
      const commitMessages = await this.getCommitMessages(user.login, year)
      commitInsights = this.analyzeCommitMessages(commitMessages)
    } catch (e) {
      console.warn('Failed to get commit insights:', e)
    }

    return {
      year,
      user,
      totalCommits: contributionsCollection.totalCommitContributions,
      totalPRs: contributionsCollection.totalPullRequestContributions,
      totalIssues: contributionsCollection.totalIssueContributions,
      totalStars,
      newFollowers: contributionData.user.followers.totalCount,
      mostActiveRepo,
      topLanguages,
      busiestDay,
      contributionCalendar: contributionsCollection.contributionCalendar,
      repositories,
      monthlyContributions,
      commitInsights
    }
  }

  /**
   * Validate token by attempting to get user
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getUser()
      return true
    } catch {
      return false
    }
  }
}

// Factory function to create service instance
export function createGitHubService(token: string): GitHubService {
  return new GitHubService(token)
}
