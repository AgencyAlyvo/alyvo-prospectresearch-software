<template>
  <div
    id="sidebar-left"
    class="fixed z-10 flex flex-col items-center justify-start overflow-hidden p-4 text-white transition-all duration-300"
    :class="menuIsExpanded ? 'w-[240px]' : 'w-[64px]'"
    style="height: calc(100vh - 36px); background: linear-gradient(180deg, #0b1433 0%, #050917 100%); border-right: 1px solid #2f3d67"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <nav class="flex h-full w-full flex-col">
      <div class="flex h-full w-full flex-col items-center justify-between">
        <!-- Liens principaux de navigation. -->
        <div class="grid w-full gap-2">
          <RouterLink
            v-for="link in startLinks"
            :key="link.name"
            :to="link.to"
            class="flex h-[44px] items-center gap-x-3 rounded-md text-sm transition-colors duration-150"
            :class="[
              isActive(link.to)
                ? 'bg-[#9a65d5] text-white'
                : 'text-[#9ba3bd] hover:bg-[rgba(154,101,213,0.12)] hover:text-white',
              menuIsExpanded ? 'px-3' : 'w-[44px] justify-center',
            ]"
          >
            <!-- Icône SVG inline du lien. -->
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              :stroke="isActive(link.to) ? '#fff' : 'currentColor'"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="shrink-0"
              v-html="link.iconPath"
            />
            <span v-if="menuIsExpanded" class="truncate font-medium">{{ link.name }}</span>
          </RouterLink>
        </div>

        <!-- Liens de bas de sidebar. -->
        <div class="grid w-full gap-2">
          <RouterLink
            v-for="link in bottomLinks"
            :key="link.name"
            :to="link.to"
            class="flex h-[44px] items-center gap-x-3 rounded-md text-sm transition-colors duration-150"
            :class="[
              isActive(link.to)
                ? 'bg-[#9a65d5] text-white'
                : 'text-[#9ba3bd] hover:bg-[rgba(154,101,213,0.12)] hover:text-white',
              menuIsExpanded ? 'px-3' : 'w-[44px] justify-center',
            ]"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              :stroke="isActive(link.to) ? '#fff' : 'currentColor'"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="shrink-0"
              v-html="link.iconPath"
            />
            <span v-if="menuIsExpanded" class="truncate font-medium">{{ link.name }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'

// Type d'un lien de navigation avec son icône SVG inline.
type NavLink = {
  name: string
  iconPath: string
  to: string
}

// Liens principaux affichés en haut de la sidebar.
const startLinks: NavLink[] = [
  {
    name: 'Tableau de bord',
    iconPath: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    to: '/home',
  },
  {
    name: 'Prospects',
    iconPath: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    to: '/home/prospects',
  },
  {
    name: 'Campagnes',
    iconPath: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12 19.79 19.79 0 0 1 1 3.18 2 2 0 0 1 2.96 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>',
    to: '/home/campaigns',
  },
  {
    name: 'Analytiques',
    iconPath: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    to: '/home/analytics',
  },
]

// Aucun lien de bas pour l'instant.
const bottomLinks: NavLink[] = []

// État d'expansion de la sidebar selon la largeur de la fenêtre et le survol.
const menuIsExpanded: Ref<boolean> = ref(window.innerWidth >= 1280)
const isHovered: Ref<boolean> = ref(false)

// Vérifie si la route courante correspond exactement au lien.
const isActive: (to: string) => boolean = (to: string): boolean => useRoute().path === to

// Met à jour l'état d'expansion selon la largeur et le survol.
const updateSidebarState: () => void = (): void => {
  menuIsExpanded.value = window.innerWidth >= 1280 || isHovered.value
}

const onMouseEnter: () => void = (): void => {
  isHovered.value = true
  updateSidebarState()
}

const onMouseLeave: () => void = (): void => {
  isHovered.value = false
  updateSidebarState()
}

onMounted((): void => {
  updateSidebarState()
  window.addEventListener('resize', updateSidebarState)
})

onUnmounted((): void => {
  window.removeEventListener('resize', updateSidebarState)
})
</script>
