<template>
  <div class="subscriptions-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Nos Abonnements</h1>
        <p>Découvrez nos formules d'abonnement pour accéder à notre flotte de véhicules de luxe</p>
      </div>
    </section>
    
    <section class="subscriptions-section">
      <div class="container">
        <!-- Affichage du chargement -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Chargement des abonnements...</p>
        </div>
        
        <!-- Affichage des erreurs -->
        <div v-else-if="error" class="error-container">
          <div class="error-message">
            <h2>Erreur</h2>
            <p>{{ error }}</p>
            <button @click="loadSubscriptions()" class="btn-retry">Réessayer</button>
          </div>
        </div>
        
        <!-- Affichage des abonnements -->
        <div v-else class="subscriptions-grid">
          <div v-for="subscription in subscriptions" :key="subscription.id" class="subscription-card">
            <div class="subscription-header" :class="subscription.name.toLowerCase()">
              <h3>{{ subscription.name }}</h3>
              <div class="subscription-price">
                {{ subscription.price }}€ <span class="price-period">/ mois</span>
              </div>
            </div>
            
            <div class="subscription-content">
              <div class="subscription-feature">
                <h4>Véhicules accessibles</h4>
                <p>{{ subscription.vehicleAccess }}</p>
              </div>
              
              <div class="subscription-feature">
                <h4>Jours de location par mois</h4>
                <p class="days-count">{{ subscription.daysPerMonth }} jours</p>
              </div>
              
              <div class="subscription-feature">
                <h4>Services inclus</h4>
                <ul class="services-list">
                  <li v-for="(service, index) in subscription.services" :key="index" :class="{ 'included': service.included }">
                    <i :class="service.included ? 'pi pi-check' : 'pi pi-times'"></i>
                    {{ service.name }}
                  </li>
                </ul>
              </div>
              
              <button class="btn-subscribe" @click="subscribe(subscription)">S'abonner</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <section class="subscription-faq">
      <div class="container">
        <h2>Questions fréquentes</h2>
        
        <div class="faq-item">
          <h3>Comment fonctionne l'abonnement ?</h3>
          <p>Notre service d'abonnement vous permet d'accéder à notre flotte de véhicules de luxe pour un prix mensuel fixe. Choisissez le niveau qui correspond à vos besoins et profitez de nos véhicules premium.</p>
        </div>
        
        <div class="faq-item">
          <h3>Puis-je changer de véhicule pendant mon abonnement ?</h3>
          <p>Oui, vous pouvez changer de véhicule autant de fois que vous le souhaitez dans la limite des jours inclus dans votre abonnement et des véhicules disponibles dans votre niveau d'abonnement.</p>
        </div>
        
        <div class="faq-item">
          <h3>Comment sont calculés les jours de location ?</h3>
          <p>Les jours de location sont comptabilisés par tranche de 24 heures à partir du moment où vous prenez possession du véhicule. Vous pouvez utiliser vos jours de manière consécutive ou les répartir sur le mois.</p>
        </div>
        
        <div class="faq-item">
          <h3>Puis-je accéder à des véhicules de niveau supérieur ?</h3>
          <p>Non, chaque abonnement vous donne accès uniquement aux véhicules de son niveau et des niveaux inférieurs. Pour accéder à des véhicules de niveau supérieur, vous devez souscrire à un abonnement plus élevé.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllCars } from '@/services/carService'
import { getSubscriptions } from '@/services/subscriptionService'

export default {
  name: 'SubscriptionsView',
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const error = ref(null)
    const subscriptions = ref([])
    const cars = ref([])
    
    // Charger les abonnements et les voitures
    const loadSubscriptions = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Charger les voitures pour les exemples
        cars.value = await getAllCars()
        
        // Charger les abonnements depuis la base de données
        const subscriptionData = await getSubscriptions()
        
        if (!subscriptionData || subscriptionData.length === 0) {
          throw new Error('Aucun abonnement disponible')
        }
        
        // Ajouter des exemples de voitures à chaque abonnement
        subscriptions.value = subscriptionData.map(subscription => {
          const categoryIds = []
          
          // Déterminer les catégories accessibles en fonction du niveau
          for (let i = 1; i <= subscription.level; i++) {
            categoryIds.push(i)
          }
          
          // Filtrer les voitures par catégorie
          const accessibleCars = cars.value.filter(car => 
            car.category && categoryIds.includes(car.category.id)
          )
          
          // Sélectionner jusqu'à 3 voitures comme exemples
          const exampleCars = accessibleCars
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
          
          return {
            ...subscription,
            exampleCars
          }
        })
        
        console.log('Abonnements chargés avec succès:', subscriptions.value.length)
        loading.value = false
      } catch (err) {
        console.error('Erreur lors du chargement des abonnements:', err)
        error.value = 'Une erreur est survenue lors du chargement des données. Veuillez réessayer plus tard.'
        loading.value = false
      }
    }
    
    // Fonction pour s'abonner
    const subscribe = (subscription) => {
      // Rediriger vers la page de paiement ou de confirmation
      router.push(`/subscriptions/${subscription.id}/checkout`)
    }
    
    onMounted(() => {
      loadSubscriptions()
    })
    
    return {
      loading,
      error,
      subscriptions,
      loadSubscriptions,
      subscribe
    }
  }
}
</script>

<style lang="scss" scoped>
.subscriptions-page {
  min-height: 100vh;
}

.hero-section {
  background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('@/assets/images/subscription_hero.jpg');
  background-size: cover;
  background-position: center;
  height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  
  .hero-content {
    max-width: 800px;
    padding: 0 2rem;
    
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: white;
    }
    
    p {
      font-size: 1.2rem;
      opacity: 0.9;
    }
  }
}

.subscriptions-section {
  padding: 4rem 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  
  .subscriptions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .subscription-card {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s, box-shadow 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    &.featured {
      transform: scale(1.05);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
      
      .subscription-header {
        background: linear-gradient(135deg, #1a1a1a, #333);
      }
    }
    
    .subscription-header {
      padding: 2rem;
      color: white;
      text-align: center;
      
      &.starter {
        background: linear-gradient(135deg, #607d8b, #455a64);
      }
      
      &.urban {
        background: linear-gradient(135deg, #43a047, #2e7d32);
      }
      
      &.executive {
        background: linear-gradient(135deg, #1e88e5, #1565c0);
      }
      
      &.prestige {
        background: linear-gradient(135deg, #8e24aa, #6a1b9a);
      }
      
      &.elite {
        background: linear-gradient(135deg, #f9a825, #f57f17);
      }
      
      &.signature {
        background: linear-gradient(135deg, #d32f2f, #b71c1c);
      }
      
      h3 {
        font-size: 1.8rem;
        margin-bottom: 1rem;
      }
      
      .subscription-price {
        font-size: 2.2rem;
        font-weight: 700;
        
        .price-period {
          font-size: 1rem;
          font-weight: 400;
          opacity: 0.8;
        }
      }
    }
    
    .subscription-content {
      padding: 2rem;
      
      .subscription-feature {
        margin-bottom: 2rem;
        
        h4 {
          font-size: 1.2rem;
          margin-bottom: 0.75rem;
          color: #333;
        }
        
        .days-count {
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
        }
        
        .vehicle-examples {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          
          .vehicle-example {
            display: flex;
            flex-direction: column;
            align-items: center;
            
            img {
              width: 80px;
              height: 60px;
              object-fit: cover;
              border-radius: 4px;
              margin-bottom: 0.5rem;
            }
            
            span {
              font-size: 0.8rem;
              text-align: center;
            }
          }
        }
      }
      
      .services-list {
        list-style: none;
        padding: 0;
        
        li {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          color: #666;
          
          i {
            margin-right: 0.5rem;
            font-size: 1rem;
          }
          
          &.included {
            color: #333;
            font-weight: 500;
            
            i {
              color: #43a047;
            }
          }
          
          &:not(.included) {
            opacity: 0.7;
            
            i {
              color: #d32f2f;
            }
          }
        }
      }
      
      .btn-subscribe {
        width: 100%;
        padding: 1rem;
        background-color: #1a1a1a;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1.1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
        
        &:hover {
          background-color: #333;
        }
      }
    }
  }
}

.subscription-faq {
  background-color: #f9f9f9;
  padding: 4rem 0;
  
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  
  h2 {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }
  
  .faq-item {
    margin-bottom: 2rem;
    
    h3 {
      font-size: 1.3rem;
      margin-bottom: 0.75rem;
      color: #333;
    }
    
    p {
      color: #666;
      line-height: 1.6;
    }
  }
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #1a1a1a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    text-align: center;
    
    h2 {
      color: #d32f2f;
      margin-bottom: 0.5rem;
    }
    
    p {
      margin-bottom: 1rem;
    }
    
    .btn-retry {
      padding: 0.75rem 1.5rem;
      background-color: #1a1a1a;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #333;
      }
    }
  }
}
</style>
