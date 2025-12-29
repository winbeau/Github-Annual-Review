<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AnnualReviewData } from '@/types/github'
import { Users, Star, GitFork, Trophy, Sparkles, ExternalLink } from 'lucide-vue-next'

const props = defineProps<{
  data: AnnualReviewData
}>()

const isVisible = ref(false)

// Top repositories
const topRepos = computed(() =>
  [...props.data.repositories]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3)
)

// Total forks
const totalForks = computed(() =>
  props.data.repositories.reduce((sum, repo) => sum + repo.forks_count, 0)
)

// Animated values
const animatedFollowers = ref(0)
const animatedStars = ref(0)
const animatedForks = ref(0)

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
    animateValue(0, props.data.newFollowers, 1200, (val) => { animatedFollowers.value = val })
    animateValue(0, props.data.totalStars, 1200, (val) => { animatedStars.value = val })
    animateValue(0, totalForks.value, 1200, (val) => { animatedForks.value = val })
  }, 100)
})

const medalColors = ['#e3b341', '#8b949e', '#cd7f32']
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center px-4 py-4">
    <!-- Title -->
    <div
      class="text-center mb-4 transition duration-700"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'"
    >
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#161b22] border border-[#30363d] mb-2">
        <Users class="w-6 h-6 text-[#f778ba]" />
      </div>
      <h1 class="text-3xl font-bold text-white">Social</h1>
      <p class="text-[#8b949e] text-sm">Your community impact</p>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-3 gap-3 w-full max-w-lg mb-5">
      <div
        class="glass rounded-xl p-3 text-center transition duration-500"
        :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
        :style="{ transitionDelay: '200ms' }"
      >
        <Users class="w-6 h-6 text-[#58a6ff] mx-auto mb-1" />
        <p class="text-2xl font-bold text-white">{{ animatedFollowers.toLocaleString() }}</p>
        <p class="text-[#8b949e] text-xs">Followers</p>
      </div>

      <div
        class="glass rounded-xl p-3 text-center transition duration-500"
        :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
        :style="{ transitionDelay: '300ms' }"
      >
        <Star class="w-6 h-6 text-[#e3b341] mx-auto mb-1" />
        <p class="text-2xl font-bold text-white">{{ animatedStars.toLocaleString() }}</p>
        <p class="text-[#8b949e] text-xs">Stars</p>
      </div>

      <div
        class="glass rounded-xl p-3 text-center transition duration-500"
        :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
        :style="{ transitionDelay: '400ms' }"
      >
        <GitFork class="w-6 h-6 text-[#8957e5] mx-auto mb-1" />
        <p class="text-2xl font-bold text-white">{{ animatedForks.toLocaleString() }}</p>
        <p class="text-[#8b949e] text-xs">Forks</p>
      </div>
    </div>

    <!-- Top Repositories -->
    <div
      class="glass rounded-xl p-4 w-full max-w-lg mb-5 transition duration-700"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      :style="{ transitionDelay: '500ms' }"
    >
      <div class="flex items-center gap-2 mb-3">
        <Trophy class="w-4 h-4 text-[#e3b341]" />
        <span class="text-sm font-semibold text-white">Top Repositories</span>
      </div>

      <div class="space-y-2">
        <a
          v-for="(repo, index) in topRepos"
          :key="repo.name"
          :href="repo.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 p-2 rounded-lg bg-transparent hover:bg-transparent transition duration-300 group cursor-pointer hover:scale-[1.03]"
          :class="isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'"
          :style="{ transitionDelay: `${600 + index * 100}ms` }"
        >
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            :style="{ backgroundColor: medalColors[index] + '30', color: medalColors[index] }"
          >
            {{ index + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1">
              <p class="text-sm font-medium text-[#58a6ff] truncate">{{ repo.name }}</p>
              <ExternalLink class="w-3 h-3 text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            <div class="flex items-center gap-3 text-xs text-[#8b949e]">
              <span v-if="repo.language" class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-[#238636]"></span>
                {{ repo.language }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1 text-[#e3b341]">
            <Star class="w-3 h-3" />
            <span class="text-xs">{{ repo.stargazers_count }}</span>
          </div>
        </a>
      </div>
    </div>

    <!-- Thank You -->
    <div
      class="glass rounded-2xl px-6 py-4 text-center transition duration-700"
      :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
      :style="{ transitionDelay: '900ms' }"
    >
      <div class="flex items-center justify-center gap-2 mb-2">
        <Sparkles class="w-5 h-5 text-[#e3b341]" />
        <span class="text-[#8b949e] text-sm">Amazing</span>
        <Sparkles class="w-5 h-5 text-[#e3b341]" />
      </div>
      <p class="text-4xl font-black gradient-text">{{ data.year }}</p>
      <p class="text-[#8b949e] text-xs mt-1">Keep coding! 🚀</p>
    </div>
  </div>
</template>
