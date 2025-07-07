<template>
  <div id="app">
    <header v-if="showHeader">
      <Navbar />
    </header>
    <main>
      <Toast position="top-right" />
      <router-view />
    </main>
    <footer v-if="showFooter">
      <Footer />
    </footer>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Navbar from './components/layout/Navbar.vue'
import Footer from './components/layout/Footer.vue'
import Toast from 'primevue/toast'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer,
    Toast
  },
  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    
    // Vérifier l'authentification au chargement de l'application
    authStore.checkAuth()
    
    // Déterminer si l'en-tête et le pied de page doivent être affichés
    const showHeader = computed(() => !route.meta.hideHeader)
    const showFooter = computed(() => !route.meta.hideFooter)
    
    return {
      showHeader,
      showFooter
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Poppins', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  
  main {
    flex: 1;
    padding: 20px;
  }
}
</style>
