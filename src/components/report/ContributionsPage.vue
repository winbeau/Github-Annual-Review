<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { AnnualReviewData } from '@/types/github'
import { Activity, Flame, Zap } from 'lucide-vue-next'

const props = defineProps<{
  data: AnnualReviewData
}>()

const isVisible = ref(false)

const contributionLevelMap: Record<string, number> = {
  'NONE': 0,
  'FIRST_QUARTILE': 1,
  'SECOND_QUARTILE': 2,
  'THIRD_QUARTILE': 3,
  'FOURTH_QUARTILE': 4
}

// Calculate streak
const longestStreak = computed(() => {
  if (!props.data.contributionCalendar) return 0
  let maxStreak = 0
  let currentStreak = 0
  for (const week of props.data.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else {
        currentStreak = 0
      }
    }
  }
  return maxStreak
})

// Monthly data
const monthlyData = computed(() => props.data.monthlyContributions)
const maxMonthly = computed(() => Math.max(...monthlyData.value.map(m => m.commits), 1))

// Animated values
const animatedStreak = ref(0)
const animatedTotal = ref(0)
const animatedBars = ref<number[]>(new Array(12).fill(0))

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

// Get color intensity for bar
function getBarColor(value: number, max: number): string {
  const intensity = value / max
  if (intensity > 0.8) return 'from-[#39d353] to-[#26a641]'
  if (intensity > 0.6) return 'from-[#26a641] to-[#006d32]'
  if (intensity > 0.4) return 'from-[#006d32] to-[#0e4429]'
  if (intensity > 0.2) return 'from-[#0e4429] to-[#161b22]'
  return 'from-[#0e4429] to-[#161b22]'
}

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
    animateValue(0, longestStreak.value, 1500, (val) => { animatedStreak.value = val })
    animateValue(0, props.data.contributionCalendar?.totalContributions || 0, 1500, (val) => { animatedTotal.value = val })
    monthlyData.value.forEach((month, i) => {
      setTimeout(() => {
        animateValue(0, month.commits, 1000, (val) => { animatedBars.value[i] = val })
      }, 300 + i * 80)
    })
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
        <Activity class="w-5 h-5 text-[#238636]" />
      </div>
      <h1 class="text-2xl font-bold text-white">Contributions</h1>
    </div>

    <!-- Full Year Contribution Graph -->
    <div
      class="glass rounded-xl p-3 w-full max-w-4xl mb-3 transition-all duration-700"
      :class="isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'"
      :style="{ transitionDelay: '200ms' }"
    >
      <div class="overflow-x-auto">
        <div class="flex gap-[3px] min-w-[720px]">
          <template v-for="(week, weekIndex) in data.contributionCalendar?.weeks" :key="weekIndex">
            <div class="flex flex-col gap-[3px]">
              <div
                v-for="(day, dayIndex) in week.contributionDays"
                :key="dayIndex"
                class="w-[10px] h-[10px] rounded-sm transition-all duration-500 hover:scale-150 hover:z-10 cursor-pointer"
                :class="`contrib-${contributionLevelMap[day.contributionLevel]}`"
                :style="{
                  transitionDelay: `${Math.min(weekIndex * 10, 500)}ms`,
                  opacity: isVisible ? 1 : 0
                }"
                :title="`${day.date}: ${day.contributionCount} contributions`"
              ></div>
            </div>
          </template>
        </div>
      </div>
      <!-- Legend -->
      <div class="flex items-center justify-between mt-2 text-[10px] text-[#8b949e]">
        <span>{{ data.year }} Full Year</span>
        <div class="flex items-center gap-1">
          <span>Less</span>
          <div class="w-[10px] h-[10px] rounded-sm contrib-0"></div>
          <div class="w-[10px] h-[10px] rounded-sm contrib-1"></div>
          <div class="w-[10px] h-[10px] rounded-sm contrib-2"></div>
          <div class="w-[10px] h-[10px] rounded-sm contrib-3"></div>
          <div class="w-[10px] h-[10px] rounded-sm contrib-4"></div>
          <span>More</span>
        </div>
      </div>
    </div>

    <!-- Monthly Activity Chart - Enhanced -->
    <div
      class="glass rounded-xl p-4 w-full max-w-3xl mb-3 transition-all duration-700"
      :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'"
      :style="{ transitionDelay: '400ms' }"
    >
      <div class="text-xs text-[#8b949e] mb-3 flex items-center justify-between">
        <span>Monthly Activity</span>
        <span class="text-[#238636]">{{ animatedTotal.toLocaleString() }} total</span>
      </div>

      <div class="relative">
        <!-- Grid lines -->
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div class="border-b border-[#30363d]/30 h-0"></div>
          <div class="border-b border-[#30363d]/30 h-0"></div>
          <div class="border-b border-[#30363d]/30 h-0"></div>
        </div>

        <!-- Bars -->
        <div class="flex items-end justify-between gap-2 h-28 relative">
          <div
            v-for="(month, index) in monthlyData"
            :key="month.month"
            class="flex-1 flex flex-col items-center group"
          >
            <!-- Value tooltip -->
            <div
              class="text-[10px] text-[#8b949e] mb-1 opacity-0 group-hover:opacity-100 transition-opacity font-mono"
            >
              {{ animatedBars[index] }}
            </div>

            <!-- Bar container -->
            <div class="w-full h-20 flex items-end justify-center">
              <div
                class="w-full max-w-[28px] rounded-t-md transition-all duration-700 relative overflow-hidden"
                :class="`bg-gradient-to-t ${getBarColor(animatedBars[index], maxMonthly)}`"
                :style="{
                  height: `${Math.max((animatedBars[index] / maxMonthly) * 100, animatedBars[index] > 0 ? 8 : 0)}%`,
                }"
              >
                <!-- Shine effect -->
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"
                ></div>
                <!-- Glow -->
                <div
                  class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  :style="{ boxShadow: 'inset 0 0 20px rgba(57, 211, 83, 0.3)' }"
                ></div>
              </div>
            </div>

            <!-- Month label -->
            <span
              class="text-[10px] text-[#8b949e] mt-1 group-hover:text-white transition-colors"
            >
              {{ month.month.slice(0, 3) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="grid grid-cols-2 gap-3 w-full max-w-md">
      <div
        class="glass rounded-xl p-3 text-center transition-all duration-500 group hover:scale-105"
        :class="isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'"
        :style="{ transitionDelay: '600ms' }"
      >
        <div class="relative inline-block">
          <Flame class="w-7 h-7 text-orange-500 mx-auto mb-1" />
          <div class="absolute inset-0 blur-lg bg-orange-500/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <p class="text-2xl font-bold text-white">{{ animatedStreak }}</p>
        <p class="text-[#8b949e] text-xs">Day Streak</p>
      </div>

      <div
        class="glass rounded-xl p-3 text-center transition-all duration-500 group hover:scale-105"
        :class="isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'"
        :style="{ transitionDelay: '700ms' }"
      >
        <div class="relative inline-block">
          <Zap class="w-7 h-7 text-[#e3b341] mx-auto mb-1" />
          <div class="absolute inset-0 blur-lg bg-[#e3b341]/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <p class="text-2xl font-bold text-white">{{ animatedTotal.toLocaleString() }}</p>
        <p class="text-[#8b949e] text-xs">Total</p>
      </div>
    </div>
  </div>
</template>
