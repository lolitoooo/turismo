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
import Subscriptions from '../views/Subscriptions.vue'
import PaymentSuccess from '../views/PaymentSuccess.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: 'Accueil' }
  },
  {
    path: '/cars',
    name: 'cars',
    component: () => import('../views/Cars.vue'),
    meta: { title: 'Nos Véhicules', requiresAuth: true }
  },
  {
    path: '/cars/:id',
    name: 'car-detail',
    component: () => import('../views/CarDetail.vue'),
    meta: { title: 'Détail du véhicule', requiresAuth: true },
    props: true
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
    path: '/subscriptions',
    name: 'subscriptions',
    component: Subscriptions,
    meta: { title: 'Nos Abonnements', requiresAuth: true }
  },
  {
    path: '/subscriptions/:id/checkout',
    name: 'subscription-checkout',
    component: () => import('../views/SubscriptionCheckout.vue'),
    meta: { title: 'Finaliser votre abonnement', requiresAuth: true },
    props: true
  },
  {
    path: '/payment/success',
    name: 'payment-success',
    component: PaymentSuccess,
    meta: { title: 'Paiement confirmé', requiresAuth: true }
  },
  // Routes administratives
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/admin/AdminDashboard.vue'),
    meta: { title: 'Dashboard Admin', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'admin-users',
    component: () => import('../views/admin/UserManagement.vue'),
    meta: { title: 'Gestion des Utilisateurs', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/subscriptions',
    name: 'admin-subscriptions',
    component: () => import('../views/admin/SubscriptionManagement.vue'),
    meta: { title: 'Gestion des Abonnements', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/reservations',
    name: 'admin-reservations',
    component: () => import('../views/admin/ReservationManagement.vue'),
    meta: { title: 'Gestion des Réservations', requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/cars',
    name: 'admin-cars',
    component: () => import('../views/admin/CarManagement.vue'),
    meta: { title: 'Gestion des Véhicules', requiresAuth: true, requiresAdmin: true }
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
router.beforeEach(async (to, from, next) => {
  // Mise à jour du titre de la page
  document.title = to.meta.title ? `${to.meta.title} | Turismo` : 'Turismo'
  
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isAuthenticated
  
  // Si l'utilisateur est connecté mais que les informations utilisateur ne sont pas chargées
  if (isLoggedIn && !authStore.user) {
    try {
      // Charger les informations utilisateur
      await authStore.fetchCurrentUser()
      console.log('Utilisateur chargé:', authStore.user)
      console.log('Rôle:', authStore.user?.role?.name)
      console.log('Est admin:', authStore.isAdmin)
    } catch (error) {
      console.error('Erreur lors du chargement du profil utilisateur:', error)
    }
  }
  
  // Rediriger vers la page de connexion si l'authentification est requise
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  } 
  
  // Vérifier si la route nécessite un rôle admin
  if (to.meta.requiresAdmin) {
    console.log('Route nécessitant des droits admin')
    console.log('Est admin:', authStore.isAdmin)
    
    if (!authStore.isAdmin) {
      console.log('Accès refusé: l\'utilisateur n\'est pas admin')
      next({ name: 'dashboard' })
      return
    }
  }
  
  // Rediriger vers le tableau de bord si l'utilisateur est déjà connecté
  if (to.meta.guest && isLoggedIn) {
    next({ name: 'dashboard' })
    return
  } 
  
  next()
})

export default router
