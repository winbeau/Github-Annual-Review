<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AnnualReviewData } from '@/types/github'
import { Code2 } from 'lucide-vue-next'

const props = defineProps<{
  data: AnnualReviewData
}>()

const isVisible = ref(false)
const topLanguages = computed(() => props.data.topLanguages.slice(0, 6))

// Animated percentages
const animatedPercentages = ref<number[]>(new Array(6).fill(0))

function animateValue(start: number, end: number, duration: number, callback: (val: number) => void) {
  const startTime = performance.now()
  function update(currentTime: number) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    callback(start + (end - start) * eased)
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
    topLanguages.value.forEach((lang, i) => {
      setTimeout(() => {
        animateValue(0, lang.percentage, 1200, (val) => { animatedPercentages.value[i] = val })
      }, 300 + i * 100)
    })
  }, 100)
})
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center px-4 py-6">
    <!-- Title -->
    <div
      class="text-center mb-6 transition duration-700"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'"
    >
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#161b22] border border-[#30363d] mb-3">
        <Code2 class="w-6 h-6 text-[#58a6ff]" />
      </div>
      <h1 class="text-3xl font-bold text-white">Languages</h1>
      <p class="text-[#8b949e] text-sm">Your coding palette in {{ data.year }}</p>
    </div>

    <div class="flex flex-col lg:flex-row items-center gap-8 w-full max-w-4xl">
      <!-- Donut Chart -->
      <div
        class="relative w-48 h-48 flex-shrink-0 transition duration-700"
        :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'"
        :style="{ transitionDelay: '200ms' }"
      >
        <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
          <!-- Background circle -->
          <circle cx="50" cy="50" r="40" fill="none" stroke="#161b22" stroke-width="12" />
          <!-- Language segments -->
          <circle
            v-for="(lang, index) in topLanguages"
            :key="lang.name"
            cx="50"
            cy="50"
            r="40"
            fill="none"
            :stroke="lang.color"
            stroke-width="12"
            :stroke-dasharray="`${animatedPercentages[index] * 2.51} 251`"
            :stroke-dashoffset="-topLanguages.slice(0, index).reduce((sum, l, i) => sum + animatedPercentages[i] * 2.51, 0)"
            class="transition-all duration-1000"
            :style="{ filter: `drop-shadow(0 0 4px ${lang.color}40)` }"
          />
        </svg>
        <!-- Center text -->
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-bold text-white">{{ topLanguages.length }}</span>
          <span class="text-[#8b949e] text-xs">Languages</span>
        </div>
      </div>

      <!-- Language List -->
      <div class="flex-1 w-full space-y-2">
        <div
          v-for="(lang, index) in topLanguages"
          :key="lang.name"
          class="glass rounded-lg p-3 transition duration-500 hover:scale-[1.02] hover-card"
          :class="isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'"
          :style="{ transitionDelay: `${400 + index * 80}ms` }"
        >
          <div class="flex items-center justify-between mb-1.5">
            <div class="flex items-center gap-2">
              <span
                class="w-3 h-3 rounded-full ring-2 ring-offset-1 ring-offset-[#0d1117]"
                :style="{ backgroundColor: lang.color, ringColor: lang.color + '60' }"
              ></span>
              <span class="text-white font-medium text-sm">{{ lang.name }}</span>
            </div>
            <span class="text-[#8b949e] text-sm font-mono">{{ animatedPercentages[index].toFixed(1) }}%</span>
          </div>
          <div class="h-1.5 bg-[#0d1117] rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-1000"
              :style="{
                backgroundColor: lang.color,
                width: `${animatedPercentages[index]}%`,
                boxShadow: `0 0 10px ${lang.color}60`
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Language Highlight -->
    <div
      v-if="topLanguages[0]"
      class="mt-6 glass rounded-2xl px-6 py-4 text-center transition duration-700"
      :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'"
      :style="{ transitionDelay: '900ms' }"
    >
      <p class="text-[#8b949e] text-xs mb-2">Your Top Language</p>
      <div class="flex items-center justify-center gap-2">
        <span
          class="w-4 h-4 rounded-full"
          :style="{ backgroundColor: topLanguages[0].color, boxShadow: `0 0 12px ${topLanguages[0].color}` }"
        ></span>
        <span class="text-2xl font-bold text-white">{{ topLanguages[0].name }}</span>
      </div>
    </div>
  </div>
</template>
