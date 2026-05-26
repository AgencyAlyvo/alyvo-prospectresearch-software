<template>
  <div
    id="sidebar-left"
    class="fixed z-10 flex w-[260px] flex-col items-center justify-start overflow-hidden p-4 text-white"
    style="
      height: calc(100vh - 36px);
      background: linear-gradient(180deg, #0b1433 0%, #050917 100%);
      border-right: 1px solid #2f3d67;
    "
  >
    <nav class="flex h-full w-full flex-col">
      <div class="flex h-full w-full flex-col items-center justify-between">
        <!-- Liens principaux de navigation. -->
        <div class="grid w-full gap-2">
          <RouterLink
            v-for="link in startLinks"
            :key="link.name"
            :to="link.to"
            class="flex h-[44px] items-center gap-x-3 rounded-md px-3 text-sm transition-colors duration-150"
            :class="
              isActive(link.to)
                ? 'bg-[#9a65d5] text-white'
                : 'text-[#9ba3bd] hover:bg-[rgba(154,101,213,0.12)] hover:text-white'
            "
          >
            <!-- Icône Nuxt UI du lien de navigation. -->
            <UIcon :name="link.icon" class="h-[18px] w-[18px] shrink-0" />

            <span class="truncate font-medium">{{ link.name }}</span>
          </RouterLink>
        </div>

        <!-- Liens de bas de sidebar. -->
        <div class="grid w-full gap-2">
          <RouterLink
            v-for="link in bottomLinks"
            :key="link.name"
            :to="link.to"
            class="flex h-[44px] items-center gap-x-3 rounded-md px-3 text-sm transition-colors duration-150"
            :class="
              isActive(link.to)
                ? 'bg-[#9a65d5] text-white'
                : 'text-[#9ba3bd] hover:bg-[rgba(154,101,213,0.12)] hover:text-white'
            "
          >
            <UIcon :name="link.icon" class="h-[18px] w-[18px] shrink-0" />

            <span class="truncate font-medium">{{ link.name }}</span>
          </RouterLink>
        </div>
      </div>
    </nav>
  </div>
</template>

<script lang="ts" setup>
/**
 * Type d'un lien de navigation avec son icône Nuxt UI.
 */
type NavLink = {
  name: string
  icon: string
  to: string
}

// Liens principaux affichés en haut de la sidebar.
const startLinks: NavLink[] = [
  { name: 'Tableau de bord LinkedIn', icon: 'i-heroicons-squares-2x2', to: '/home' },
  { name: 'Objectif LinkedIn semaine', icon: 'i-heroicons-calendar', to: '/home/linkedin/weekly' },
  { name: 'Tous les prospects Linkedin', icon: 'i-heroicons-users', to: '/home/linkedin/all' },
  { name: 'Pipeline LinkedIn', icon: 'i-heroicons-view-columns', to: '/home/linkedin/pipeline' },
  { name: 'Rendez-vous appels', icon: 'i-heroicons-phone', to: '/home/linkedin/calls' },
  { name: 'Relances LinkedIn', icon: 'i-heroicons-bell', to: '/home/tasks' },
  { name: 'Parametres LinkedIn', icon: 'i-heroicons-cog-6-tooth', to: '/home/settings' },
]

// Aucun lien de bas pour l'instant.
const bottomLinks: NavLink[] = []

/**
 * Vérifie si la route courante correspond exactement au lien.
 * @param {string} to - Chemin de la route à comparer avec la route active.
 * @returns {boolean} Vrai si la route courante correspond au chemin donné.
 */
const isActive: (to: string) => boolean = (to: string): boolean => {
  const path: string = useRoute().path

  if (to === '/home') {
    return path === '/home'
  }

  return path.startsWith(to)
}
</script>
