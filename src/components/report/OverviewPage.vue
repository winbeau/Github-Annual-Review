<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AnnualReviewData } from '@/types/github'
import { GitCommit, GitPullRequest, CircleDot, Star, Calendar, TrendingUp, ExternalLink } from 'lucide-vue-next'

const props = defineProps<{
  data: AnnualReviewData
}>()

const isVisible = ref(false)

const stats = computed(() => [
  { icon: GitCommit, label: 'Commits', value: props.data.totalCommits, color: '#238636' },
  { icon: GitPullRequest, label: 'Pull Requests', value: props.data.totalPRs, color: '#8957e5' },
  { icon: CircleDot, label: 'Issues', value: props.data.totalIssues, color: '#f85149' },
  { icon: Star, label: 'Stars', value: props.data.totalStars, color: '#e3b341' }
])

const formattedBusiestDay = computed(() => {
  if (!props.data.busiestDay) return null
  const date = new Date(props.data.busiestDay.date)
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    contributions: props.data.busiestDay.contributions
  }
})

// Animated counter
const animatedValues = ref<number[]>([0, 0, 0, 0])
const animatedTotal = ref(0)

function animateValue(start: number, end: number, duration: number, callback: (val: number) => void) {
  const startTime = performance.now()
  function update(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    callback(Math.floor(start + (end - start) * eased))
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
    // Animate stat counters
    stats.value.forEach((stat, i) => {
      setTimeout(() => {
        animateValue(0, stat.value, 1500, (val) => { animatedValues.value[i] = val })
      }, i * 100)
    })
    // Animate total
    setTimeout(() => {
      animateValue(0, props.data.contributionCalendar?.totalContributions || 0, 2000, (val) => { animatedTotal.value = val })
    }, 400)
  }, 100)
})
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center px-4 py-6">
    <!-- User Header -->
    <div
      class="text-center mb-4 transition duration-700"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'"
    >
      <div class="relative inline-block">
        <img
          :src="data.user.avatar_url"
          :alt="data.user.login"
          class="w-16 h-16 rounded-full border-2 border-[#238636]"
        />
        <div class="absolute inset-0 rounded-full border-2 border-[#238636] animate-ping opacity-30"></div>
      </div>
      <h2 class="text-xl font-bold text-white mt-2">{{ data.user.name || data.user.login }}</h2>
      <p class="text-[#8b949e] text-sm">@{{ data.user.login }}</p>
    </div>

    <!-- Year Title -->
    <div
      class="text-center mb-6 transition duration-700 delay-150"
      :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
    >
      <h1 class="text-6xl md:text-8xl font-black">
        <span class="gradient-text">{{ data.year }}</span>
      </h1>
      <p class="text-lg text-[#8b949e] mt-1">Your Year in Code</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-4 gap-3 w-full max-w-2xl mb-6">
      <div
        v-for="(stat, index) in stats"
        :key="stat.label"
        class="glass rounded-xl p-3 text-center transition duration-500 hover:scale-[1.03]"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: `${300 + index * 100}ms` }"
      >
        <component
          :is="stat.icon"
          class="w-6 h-6 mx-auto mb-1"
          :style="{ color: stat.color }"
        />
        <div class="text-2xl font-bold text-white">
          {{ animatedValues[index].toLocaleString() }}
        </div>
        <div class="text-[#8b949e] text-xs">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Highlight Cards -->
    <div class="grid grid-cols-2 gap-3 w-full max-w-2xl mb-4">
      <!-- Most Active Repo -->
      <a
        v-if="data.mostActiveRepo"
        :href="data.mostActiveRepo.html_url"
        target="_blank"
        rel="noopener noreferrer"
        class="glass rounded-xl p-4 transition duration-500 block hover:scale-[1.03] cursor-pointer group"
        :class="isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'"
        :style="{ transitionDelay: '700ms' }"
      >
        <div class="flex items-center gap-2 mb-2">
          <TrendingUp class="w-4 h-4 text-[#238636]" />
          <span class="text-xs text-[#8b949e]">Most Active Repo</span>
          <ExternalLink class="w-3 h-3 text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
        </div>
        <p class="text-lg font-bold text-[#58a6ff] truncate">{{ data.mostActiveRepo.name }}</p>
        <div class="flex items-center gap-2 mt-1 text-xs text-[#8b949e]">
          <span v-if="data.mostActiveRepo.language" class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-[#238636]"></span>
            {{ data.mostActiveRepo.language }}
          </span>
          <span class="flex items-center gap-1">
            <Star class="w-3 h-3" />
            {{ data.mostActiveRepo.stargazers_count }}
          </span>
        </div>
      </a>

      <!-- Busiest Day -->
      <div
        v-if="formattedBusiestDay"
        class="glass rounded-xl p-4 transition duration-500"
        :class="isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'"
        :style="{ transitionDelay: '800ms' }"
      >
        <div class="flex items-center gap-2 mb-2">
          <Calendar class="w-4 h-4 text-[#f778ba]" />
          <span class="text-xs text-[#8b949e]">Busiest Day</span>
        </div>
        <p class="text-2xl font-bold text-white">{{ formattedBusiestDay.contributions }}</p>
        <p class="text-sm text-[#58a6ff]">{{ formattedBusiestDay.date }}</p>
      </div>
    </div>

    <!-- Total Contributions -->
    <div
      class="glass rounded-2xl px-8 py-4 text-center transition duration-700"
      :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
      :style="{ transitionDelay: '900ms' }"
    >
      <p class="text-[#8b949e] text-sm mb-1">Total Contributions</p>
      <p class="text-4xl font-black gradient-text">
        {{ animatedTotal.toLocaleString() }}
      </p>
    </div>
  </div>
</template>
