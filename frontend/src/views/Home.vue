<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Drive Turismo</h1>
        <p class="hero-subtitle">Location de voitures d'exception</p>
        <div class="hero-cta">
          <router-link to="/cars" class="btn-primary">Découvrir nos véhicules</router-link>
        </div>
      </div>
    </section>
    
    <!-- Search Filters -->
    <section class="search-section">
      <div class="search-container">
        <div class="search-tabs">
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'type' }"
            @click="activeTab = 'type'"
          >
            Trier par
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'vehicle' }"
            @click="activeTab = 'vehicle'"
          >
            Type de voiture
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'engine' }"
            @click="activeTab = 'engine'"
          >
            Motorisation
          </button>
          <button 
            class="tab-button" 
            :class="{ active: activeTab === 'brand' }"
            @click="activeTab = 'brand'"
          >
            Marques
          </button>
        </div>
        
        <div class="category-filters">
          <button 
            class="category-button"
            :class="{ active: selectedCategory === 'all' }"
            @click="selectedCategory = 'all'"
          >
            All
          </button>
          <button 
            v-for="i in 6" 
            :key="i"
            class="category-button"
            :class="{ active: selectedCategory === `cat${i < 10 ? '0' + i : i}` }"
            @click="selectedCategory = `cat${i < 10 ? '0' + i : i}`"
          >
            Cat {{ i < 10 ? '0' + i : i }}
          </button>
        </div>
      </div>
    </section>
    
    <!-- Featured Cars -->
    <section class="cars-section">
      <div class="cars-container">
        <div class="cars-grid">
          <div class="car-card-placeholder" v-for="i in 4" :key="i">
            <div class="car-image-placeholder"></div>
            <div class="car-info-placeholder">
              <div class="car-title-placeholder"></div>
              <div class="car-specs-placeholder">
                <div class="car-spec-placeholder"></div>
                <div class="car-spec-placeholder"></div>
              </div>
              <div class="car-price-placeholder"></div>
            </div>
          </div>
        </div>
        
        <div class="no-cars-message">
          <p>Aucun véhicule disponible pour le moment.</p>
          <p>Revenez bientôt pour découvrir notre sélection de voitures de luxe.</p>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="features-section">
      <div class="features-container">
        <h2 class="section-title">Pourquoi choisir Drive Turismo ?</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <h3 class="feature-title">Véhicules d'exception</h3>
            <p class="feature-description">
              Notre flotte comprend uniquement des voitures de luxe et de sport soigneusement sélectionnées.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-shield"></i>
            </div>
            <h3 class="feature-title">Assurance complète</h3>
            <p class="feature-description">
              Tous nos véhicules sont couverts par une assurance tous risques pour votre tranquillité.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-map-marker"></i>
            </div>
            <h3 class="feature-title">Livraison à domicile</h3>
            <p class="feature-description">
              Nous livrons votre véhicule à l'adresse de votre choix, partout en France.
            </p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="pi pi-clock"></i>
            </div>
            <h3 class="feature-title">Service 24/7</h3>
            <p class="feature-description">
              Notre équipe est disponible à tout moment pour répondre à vos besoins.
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Call to Action -->
    <section class="cta-section">
      <div class="cta-container">
        <h2 class="cta-title">Prêt à prendre la route ?</h2>
        <p class="cta-description">
          Inscrivez-vous dès maintenant et réservez votre voiture de rêve en quelques clics.
        </p>
        <div class="cta-buttons">
          <router-link to="/register" class="btn-primary">S'inscrire</router-link>
          <router-link to="/cars" class="btn-secondary">Voir les véhicules</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'HomeView',
  setup() {
    const activeTab = ref('type')
    const selectedCategory = ref('all')
    
    return {
      activeTab,
      selectedCategory
    }
  }
}
</script>

<style lang="scss" scoped>
.home-container {
  min-height: 100vh;
}

// Hero Section
.hero-section {
  height: 70vh;
  min-height: 500px;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), linear-gradient(45deg, #1a1a1a, #333);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  
  .hero-content {
    max-width: 800px;
    padding: 0 2rem;
  }
  
  .hero-title {
    font-family: 'Playfair Display', serif;
    font-size: 4rem;
    font-weight: 700;
    margin-bottom: 1rem;
    
    @media (max-width: 768px) {
      font-size: 3rem;
    }
  }
  
  .hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 2rem;
    
    @media (max-width: 768px) {
      font-size: 1.25rem;
    }
  }
  
  .hero-cta {
    .btn-primary {
      display: inline-block;
      background-color: #fff;
      color: #1a1a1a;
      font-size: 1.1rem;
      font-weight: 500;
      padding: 0.75rem 2rem;
      border-radius: 4px;
      text-decoration: none;
      transition: all 0.3s;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.9);
        transform: translateY(-2px);
      }
    }
  }
}

// Search Section
.search-section {
  background-color: #f8f8f8;
  padding: 1rem 0;
  
  .search-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  
  .search-tabs {
    display: flex;
    border-bottom: 1px solid #ddd;
    
    .tab-button {
      padding: 1rem 1.5rem;
      background: none;
      border: none;
      font-size: 1rem;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      transition: all 0.3s;
      
      &.active {
        color: #1a1a1a;
        border-bottom: 2px solid #1a1a1a;
      }
      
      &:hover {
        color: #1a1a1a;
      }
    }
  }
  
  .category-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 1rem 0;
    
    .category-button {
      padding: 0.5rem 1.5rem;
      background: none;
      border: 1px solid #ddd;
      border-radius: 50px;
      font-size: 0.9rem;
      color: #666;
      cursor: pointer;
      transition: all 0.3s;
      
      &.active {
        background-color: #1a1a1a;
        color: white;
        border-color: #1a1a1a;
      }
      
      &:hover:not(.active) {
        border-color: #999;
        color: #333;
      }
    }
  }
}

// Cars Section
.cars-section {
  padding: 3rem 0;
  
  .cars-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  
  .cars-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
  }
  
  .car-card-placeholder {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s;
    display: none;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    .car-image-placeholder {
      height: 200px;
      background-color: #f0f0f0;
    }
    
    .car-info-placeholder {
      padding: 1.5rem;
      
      .car-title-placeholder {
        height: 24px;
        background-color: #f0f0f0;
        margin-bottom: 1rem;
        width: 80%;
        border-radius: 4px;
      }
      
      .car-specs-placeholder {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        
        .car-spec-placeholder {
          height: 16px;
          background-color: #f0f0f0;
          width: 40%;
          border-radius: 4px;
        }
      }
      
      .car-price-placeholder {
        height: 20px;
        background-color: #f0f0f0;
        width: 60%;
        border-radius: 4px;
      }
    }
  }
  
  .no-cars-message {
    text-align: center;
    padding: 3rem 0;
    
    p {
      color: #666;
      margin-bottom: 0.5rem;
      
      &:first-child {
        font-size: 1.25rem;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

// Features Section
.features-section {
  background-color: #f8f8f8;
  padding: 5rem 0;
  
  .features-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  
  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 3rem;
    color: #1a1a1a;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }
  
  .feature-card {
    background-color: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    text-align: center;
    transition: transform 0.3s;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    .feature-icon {
      font-size: 2.5rem;
      color: #1a1a1a;
      margin-bottom: 1.5rem;
    }
    
    .feature-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #1a1a1a;
    }
    
    .feature-description {
      color: #666;
      line-height: 1.6;
    }
  }
}

// CTA Section
.cta-section {
  padding: 5rem 0;
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), linear-gradient(45deg, #222, #444);
  background-size: cover;
  background-position: center;
  color: white;
  
  .cta-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 1.5rem;
    text-align: center;
  }
  
  .cta-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }
  
  .cta-description {
    font-size: 1.1rem;
    margin-bottom: 2rem;
    opacity: 0.9;
  }
  
  .cta-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    
    @media (max-width: 576px) {
      flex-direction: column;
      align-items: center;
    }
    
    .btn-primary {
      display: inline-block;
      background-color: #fff;
      color: #1a1a1a;
      font-size: 1rem;
      font-weight: 500;
      padding: 0.75rem 2rem;
      border-radius: 4px;
      text-decoration: none;
      transition: all 0.3s;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.9);
        transform: translateY(-2px);
      }
    }
    
    .btn-secondary {
      display: inline-block;
      background-color: transparent;
      color: #fff;
      font-size: 1rem;
      font-weight: 500;
      padding: 0.75rem 2rem;
      border-radius: 4px;
      border: 1px solid #fff;
      text-decoration: none;
      transition: all 0.3s;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }
    }
  }
}
</style>
