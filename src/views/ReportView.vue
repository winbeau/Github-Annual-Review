<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGitHubStore } from '@/stores/github'
import { LogOut, Share2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-vue-next'

// Report Pages
import OverviewPage from '@/components/report/OverviewPage.vue'
import LanguagesPage from '@/components/report/LanguagesPage.vue'
import ContributionsPage from '@/components/report/ContributionsPage.vue'
import CommitInsightsPage from '@/components/report/CommitInsightsPage.vue'
import SocialPage from '@/components/report/SocialPage.vue'

const store = useGitHubStore()
const router = useRouter()

const currentPage = ref(0)
const isTransitioning = ref(false)
const direction = ref<'next' | 'prev'>('next')

const pages = [
  { name: 'Overview', component: OverviewPage },
  { name: 'Languages', component: LanguagesPage },
  { name: 'Contributions', component: ContributionsPage },
  { name: 'Insights', component: CommitInsightsPage },
  { name: 'Social', component: SocialPage }
]

const currentComponent = computed(() => pages[currentPage.value].component)

function nextPage() {
  if (currentPage.value < pages.length - 1 && !isTransitioning.value) {
    direction.value = 'next'
    isTransitioning.value = true
    currentPage.value++
    setTimeout(() => { isTransitioning.value = false }, 600)
  }
}

function prevPage() {
  if (currentPage.value > 0 && !isTransitioning.value) {
    direction.value = 'prev'
    isTransitioning.value = true
    currentPage.value--
    setTimeout(() => { isTransitioning.value = false }, 600)
  }
}

function goToPage(index: number) {
  if (index !== currentPage.value && !isTransitioning.value) {
    direction.value = index > currentPage.value ? 'next' : 'prev'
    isTransitioning.value = true
    currentPage.value = index
    setTimeout(() => { isTransitioning.value = false }, 600)
  }
}

function handleLogout() {
  store.clearToken()
  router.push('/')
}

async function handleShare() {
  alert('Share functionality coming soon!')
}

// Keyboard navigation
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault()
    nextPage()
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevPage()
  }
}

// Touch/Swipe support
let touchStartX = 0
function handleTouchStart(e: TouchEvent) {
  touchStartX = e.touches[0].clientX
}

function handleTouchEnd(e: TouchEvent) {
  const touchEndX = e.changedTouches[0].clientX
  const diff = touchStartX - touchEndX
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextPage()
    else prevPage()
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)

  // Set page title
  document.title = store.pageTitle

  if (!store.hasReviewData) {
    await store.fetchAnnualReview()
  }
})

// Watch for page title changes
watch(() => store.pageTitle, (newTitle) => {
  document.title = newTitle
})
</script>

<template>
  <div
    class="h-screen flex flex-col overflow-hidden"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Header -->
    <header class="flex-shrink-0 glass border-b border-[#30363d] z-50">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 class="text-lg font-bold">
          <span class="gradient-text">GitHub</span>
          <span class="text-white"> {{ store.displayYear }}</span>
        </h1>

        <div class="flex items-center gap-3">
          <!-- Page Indicator -->
          <div class="flex items-center gap-2">
            <button
              v-for="(page, index) in pages"
              :key="page.name"
              @click="goToPage(index)"
              class="relative h-2 rounded-full transition-all duration-300"
              :class="currentPage === index ? 'w-8 bg-[#238636]' : 'w-2 bg-[#30363d] hover:bg-[#484f58]'"
            >
              <span
                v-if="currentPage === index"
                class="absolute inset-0 rounded-full bg-[#238636] animate-pulse"
              ></span>
            </button>
          </div>

          <button
            @click="handleShare"
            class="p-2 rounded-lg hover:bg-[#30363d] transition-colors"
            title="Share"
          >
            <Share2 class="w-5 h-5 text-[#8b949e]" />
          </button>

          <button
            @click="handleLogout"
            class="p-2 rounded-lg hover:bg-[#30363d] transition-colors"
            title="Logout"
          >
            <LogOut class="w-5 h-5 text-[#8b949e]" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative overflow-hidden">
      <!-- Loading State -->
      <div v-if="store.loading.isLoading" class="absolute inset-0 flex flex-col items-center justify-center">
        <div class="relative">
          <div class="w-20 h-20 border-4 border-[#30363d] rounded-full"></div>
          <div
            class="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-[#238636] rounded-full animate-spin"
          ></div>
        </div>
        <p class="text-[#8b949e] text-lg mt-6">{{ store.loading.message }}</p>
        <div class="w-48 h-1 bg-[#161b22] rounded-full mt-4 overflow-hidden">
          <div
            class="h-full bg-gradient-to-r from-[#238636] to-[#39d353] transition-all duration-300"
            :style="{ width: `${store.loading.progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="store.error" class="absolute inset-0 flex flex-col items-center justify-center px-4">
        <p class="text-red-400 text-lg mb-4">{{ store.error }}</p>
        <button
          @click="store.fetchAnnualReview()"
          class="bg-[#238636] hover:bg-[#2ea043] text-white font-semibold py-2 px-6 rounded-lg"
        >
          Retry
        </button>
      </div>

      <!-- Report Content -->
      <div v-else-if="store.annualReview" class="h-full">
        <Transition
          :name="direction === 'next' ? 'slide-left' : 'slide-right'"
          mode="out-in"
        >
          <component
            :is="currentComponent"
            :key="currentPage"
            :data="store.annualReview"
          />
        </Transition>
      </div>
    </main>

    <!-- Navigation Footer -->
    <footer v-if="!store.loading.isLoading && store.annualReview" class="flex-shrink-0 glass border-t border-[#30363d]">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          @click="prevPage"
          :disabled="currentPage === 0"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft class="w-5 h-5" />
          <span class="hidden sm:inline">{{ currentPage > 0 ? pages[currentPage - 1].name : 'Previous' }}</span>
        </button>

        <div class="text-[#8b949e] text-sm">
          <span class="text-white font-bold text-lg">{{ currentPage + 1 }}</span>
          <span class="mx-1">/</span>
          <span>{{ pages.length }}</span>
        </div>

        <button
          @click="nextPage"
          :disabled="currentPage === pages.length - 1"
          class="flex items-center gap-2 px-4 py-2 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <span class="hidden sm:inline">{{ currentPage < pages.length - 1 ? pages[currentPage + 1].name : 'Next' }}</span>
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Slide transitions */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.95);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-100px) scale(0.95);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-100px) scale(0.95);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.95);
}
</style>
