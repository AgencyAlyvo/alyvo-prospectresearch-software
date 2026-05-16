<template>
  <div class="flex h-screen flex-col bg-[#0f172a] text-slate-200">
    <!-- Barre de fenêtre Tauri avec le logo Alyvo centré. -->
    <WindowBar>
      <img class="h-5 select-none" src="/logo-alyvo.png" alt="Alyvo" draggable="false" />
    </WindowBar>

    <main class="flex h-full flex-1 overflow-hidden">
      <SideBarLeft />

      <!-- Zone de contenu centrale, marges ajustées selon la largeur de la fenêtre. -->
      <div
        class="flex-grow overflow-x-hidden overflow-y-auto transition-all duration-300 px-10 py-10"
        :class="{
          'mr-[64px] ml-[64px]': windowWidth < 1280,
          'mr-[64px] ml-[240px]': windowWidth >= 1280 && windowWidth < 1536,
          'mr-[240px] ml-[240px]': windowWidth >= 1536,
        }"
      >
        <slot />
      </div>

      <SideBarRight />
    </main>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'

import SideBarLeft from '#src-nuxt/app/components/navigations/SideBarLeft.vue'
import SideBarRight from '#src-nuxt/app/components/navigations/SideBarRight.vue'

// Largeur courante de la fenêtre pour adapter les marges du contenu central.
const windowWidth: Ref<number> = ref(window.innerWidth)

/**
 * Gère le redimensionnement de la fenêtre.
 */
const handleResize: () => void = (): void => {
  windowWidth.value = window.innerWidth
}

onMounted((): void => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', handleResize)
})

onUnmounted((): void => {
  window.removeEventListener('resize', handleResize)
})
</script>
