import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Pages
import Home from '../views/Home.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'
import ResetPassword from '../views/auth/ResetPassword.vue'
import Dashboard from '../views/Dashboard.vue'
import Profile from '../views/Profile.vue'
import NotFound from '../views/NotFound.vue'
import About from '../views/About.vue'
import Contact from '../views/Contact.vue'
import TermsOfService from '../views/TermsOfService.vue'
import PrivacyPolicy from '../views/PrivacyPolicy.vue'
import FAQ from '../views/FAQ.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: 'Accueil' }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { title: 'Connexion', guest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { title: 'Inscription', guest: true }
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPassword,
    meta: { title: 'Mot de passe oublié', guest: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPassword,
    meta: { title: 'Réinitialiser le mot de passe', guest: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { title: 'Tableau de bord', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { title: 'Mon Profil', requiresAuth: true }
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: { title: 'À propos' }
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact,
    meta: { title: 'Contact' }
  },
  {
    path: '/terms-of-service',
    name: 'terms-of-service',
    component: TermsOfService,
    meta: { title: 'Conditions générales' }
  },
  {
    path: '/privacy-policy',
    name: 'privacy-policy',
    component: PrivacyPolicy,
    meta: { title: 'Politique de confidentialité' }
  },
  {
    path: '/faq',
    name: 'faq',
    component: FAQ,
    meta: { title: 'FAQ' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { title: 'Page non trouvée' }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // Mise à jour du titre de la page
  document.title = to.meta.title ? `${to.meta.title} | Turismo` : 'Turismo'
  
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isAuthenticated
  
  // Rediriger vers la page de connexion si l'authentification est requise
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } 
  // Rediriger vers le tableau de bord si l'utilisateur est déjà connecté
  else if (to.meta.guest && isLoggedIn) {
    next({ name: 'dashboard' })
  } 
  else {
    next()
  }
})

export default router
