<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AnnualReviewData } from '@/types/github'
import { MessageSquare, Hash, FileText, Sparkles } from 'lucide-vue-next'

const props = defineProps<{
  data: AnnualReviewData
}>()

const isVisible = ref(false)

const insights = computed(() => props.data.commitInsights)

// Top 15 words for word cloud
const topWords = computed(() => insights.value?.wordFrequency.slice(0, 15) || [])

// Max count for sizing
const maxCount = computed(() => Math.max(...topWords.value.map(w => w.count), 1))

// Top 6 commit types
const topTypes = computed(() => insights.value?.commitTypes.slice(0, 6) || [])
const totalTypes = computed(() => topTypes.value.reduce((sum, t) => sum + t.count, 0))

// Animated values
const animatedTotal = ref(0)
const animatedAvgLength = ref(0)

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

// Generate font size based on count
function getWordSize(count: number): string {
  const ratio = count / maxCount.value
  const size = 12 + ratio * 28 // 12px to 40px
  return `${size}px`
}

// Generate random position offset for word cloud effect
function getWordStyle(index: number, count: number) {
  const ratio = count / maxCount.value
  const hue = 120 + (1 - ratio) * 60 // Green to yellow
  const saturation = 50 + ratio * 30
  const lightness = 45 + ratio * 20
  return {
    fontSize: getWordSize(count),
    color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    opacity: 0.6 + ratio * 0.4,
    transitionDelay: `${index * 50}ms`
  }
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
    if (insights.value) {
      animateValue(0, insights.value.totalCommitMessages, 1200, (val) => { animatedTotal.value = val })
      animateValue(0, insights.value.averageMessageLength, 1000, (val) => { animatedAvgLength.value = val })
    }
  }, 100)
})
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center px-4 py-2 overflow-hidden">
    <!-- Title -->
    <div
      class="text-center mb-3 transition-all duration-700"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'"
    >
      <div class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#161b22] border border-[#30363d] mb-2">
        <MessageSquare class="w-5 h-5 text-[#58a6ff]" />
      </div>
      <h1 class="text-2xl font-bold text-white">Commit Insights</h1>
      <p class="text-[#8b949e] text-xs">What you've been working on</p>
    </div>

    <div v-if="insights" class="w-full max-w-4xl">
      <!-- Word Cloud -->
      <div
        class="glass rounded-xl p-4 mb-3 transition-all duration-700"
        :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
        :style="{ transitionDelay: '200ms' }"
      >
        <div class="flex items-center gap-2 mb-3">
          <Hash class="w-4 h-4 text-[#238636]" />
          <span class="text-xs text-[#8b949e]">Most Used Words</span>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 min-h-[100px]">
          <span
            v-for="(word, index) in topWords"
            :key="word.word"
            class="font-semibold transition-all duration-500 hover:scale-110 cursor-default"
            :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
            :style="getWordStyle(index, word.count)"
            :title="`${word.word}: ${word.count} times`"
          >
            {{ word.word }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-3">
        <!-- Commit Types -->
        <div
          class="glass rounded-xl p-4 transition-all duration-700"
          :class="isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'"
          :style="{ transitionDelay: '400ms' }"
        >
          <div class="flex items-center gap-2 mb-3">
            <FileText class="w-4 h-4 text-[#8957e5]" />
            <span class="text-xs text-[#8b949e]">Commit Types</span>
          </div>

          <div class="space-y-2">
            <div
              v-for="(type, index) in topTypes"
              :key="type.type"
              class="transition-all duration-500"
              :class="isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'"
              :style="{ transitionDelay: `${500 + index * 80}ms` }"
            >
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-white font-medium">{{ type.type }}</span>
                <span class="text-[#8b949e]">{{ type.count }}</span>
              </div>
              <div class="h-1.5 bg-[#0d1117] rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :style="{
                    backgroundColor: type.color,
                    width: `${(type.count / totalTypes) * 100}%`,
                    boxShadow: `0 0 8px ${type.color}50`
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div
          class="glass rounded-xl p-4 transition-all duration-700"
          :class="isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'"
          :style="{ transitionDelay: '400ms' }"
        >
          <div class="flex items-center gap-2 mb-3">
            <Sparkles class="w-4 h-4 text-[#e3b341]" />
            <span class="text-xs text-[#8b949e]">Stats</span>
          </div>

          <div class="space-y-3">
            <div class="text-center p-2 rounded-lg bg-[#0d1117]/50">
              <p class="text-2xl font-bold text-white">{{ animatedTotal }}</p>
              <p class="text-[#8b949e] text-xs">Commits Analyzed</p>
            </div>

            <div class="text-center p-2 rounded-lg bg-[#0d1117]/50">
              <p class="text-2xl font-bold text-[#58a6ff]">{{ animatedAvgLength }}</p>
              <p class="text-[#8b949e] text-xs">Avg. Message Length</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Words List -->
      <div
        class="glass rounded-xl p-3 transition-all duration-700"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
        :style="{ transitionDelay: '600ms' }"
      >
        <div class="flex flex-wrap gap-2 justify-center">
          <span
            v-for="(word, index) in topWords.slice(0, 10)"
            :key="word.word"
            class="px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105"
            :class="isVisible ? 'opacity-100' : 'opacity-0'"
            :style="{
              backgroundColor: `hsl(${120 + index * 12}, 40%, 20%)`,
              color: `hsl(${120 + index * 12}, 60%, 70%)`,
              transitionDelay: `${700 + index * 50}ms`
            }"
          >
            {{ word.word }}
            <span class="ml-1 opacity-60">{{ word.count }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="text-center text-[#8b949e]">
      <p>No commit data available</p>
    </div>
  </div>
</template>
