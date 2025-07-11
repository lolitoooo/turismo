<template>
  <div class="home-container">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Turismo</h1>
        <p class="hero-subtitle">Location de voitures d'exception</p>
        <div class="hero-cta">
          <router-link to="/cars" class="btn-primary">Découvrir nos véhicules</router-link>
        </div>
      </div>
    </section>
    
    <!-- Spacer pour remplacer les filtres -->
    <div style="height: 40px;"></div>
    
    <!-- Featured Cars -->
    <section class="cars-section">
      <div class="cars-container">
        <h2 class="section-title">Nos véhicules les plus prestigieux</h2>
        
        <div v-if="hasCars" class="cars-grid">
          <div class="car-card" v-for="car in filteredCars" :key="car.id">
            <div class="car-image" :style="{ backgroundImage: `url(${car.image})` }">
              <div class="car-category">Cat {{ car.category.substring(3) }}</div>
            </div>
            <div class="car-info">
              <h3 class="car-title">{{ car.name }}</h3>
              <div class="car-specs">
                <div class="car-spec">
                  <i class="pi pi-tag"></i>
                  <span>{{ car.type }}</span>
                </div>
                <div class="car-spec">
                  <i class="pi pi-cog"></i>
                  <span>{{ car.engine }}</span>
                </div>
              </div>
              <div class="car-actions">
                <router-link :to="`/cars/${car.id}`" class="btn-more">Plus d'infos</router-link>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="no-cars-message">
          <p>Aucun véhicule disponible pour le moment.</p>
          <p>Revenez bientôt pour découvrir notre sélection de voitures de luxe.</p>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="why-choose-section">
      <div class="why-choose-container">
        <h2 class="section-title">Pourquoi choisir Turismo ?</h2>
        
        <div class="benefits-row">
          <div class="benefit-column">
            <div class="benefit-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <h3 class="benefit-title">Véhicules d'exception</h3>
            <p class="benefit-description">
              Notre flotte comprend uniquement des voitures de luxe et de sport soigneusement sélectionnées.
            </p>
          </div>
          
          <div class="benefit-column">
            <div class="benefit-icon">
              <i class="pi pi-shield"></i>
            </div>
            <h3 class="benefit-title">Assurance complète</h3>
            <p class="benefit-description">
              Tous nos véhicules sont couverts par une assurance tous risques pour votre tranquillité.
            </p>
          </div>
          
          <div class="benefit-column">
            <div class="benefit-icon">
              <i class="pi pi-map-marker"></i>
            </div>
            <h3 class="benefit-title">Livraison à domicile</h3>
            <p class="benefit-description">
              Nous livrons votre véhicule à l'adresse de votre choix, partout en France.
            </p>
          </div>
          
          <div class="benefit-column">
            <div class="benefit-icon">
              <i class="pi pi-clock"></i>
            </div>
            <h3 class="benefit-title">Service 24/7</h3>
            <p class="benefit-description">
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
import { ref, computed } from 'vue'

export default {
  name: 'HomeView',
  setup() {
    
    const cars = ref([
      // Catégorie 1
      { id: 1, name: 'Porsche Macan 4S', category: 'cat01', type: 'SUV', engine: 'Hybride', brand: 'Porsche', price: 350, image: require('@/assets/images/porsche_macan_4S_home.webp') },
      { id: 2, name: 'Porsche Macan 4', category: 'cat01', type: 'SUV', engine: 'Hybride', brand: 'Porsche', price: 320, image: require('@/assets/images/porsche_macan_4_home.webp') },
      { id: 3, name: 'Mercedes Benz GLE 400e', category: 'cat01', type: 'SUV', engine: 'Hybride', brand: 'Mercedes', price: 340, image: require('@/assets/images/mb_gle_400e_home.webp') },
      { id: 4, name: 'Mercedes Benz GLC 300e SUV', category: 'cat01', type: 'SUV', engine: 'Hybride', brand: 'Mercedes', price: 310, image: require('@/assets/images/mb_glc_300e_home.webp') },
      { id: 5, name: 'Mercedes Benz GLC 300e Coupé', category: 'cat01', type: 'Coupé', engine: 'Hybride', brand: 'Mercedes', price: 320, image: require('@/assets/images/mb_glc_300e_coupe_home.webp') },
      { id: 6, name: 'Audi RSQ3', category: 'cat01', type: 'SUV', engine: 'Essence', brand: 'Audi', price: 330, image: require('@/assets/images/audi_rsq3_home.webp') },
      { id: 7, name: 'Mercedes Benz GLC 200D 4MATIC', category: 'cat01', type: 'SUV', engine: 'Diesel', brand: 'Mercedes', price: 300, image: require('@/assets/images/mb_glc_200d_4matic_home.jpg') },
      { id: 8, name: 'Range Rover Velar P400E', category: 'cat01', type: 'SUV', engine: 'Hybride', brand: 'Range Rover', price: 350, image: require('@/assets/images/range_rover_velar_p400e_home.webp') },
      { id: 9, name: 'Porsche Macan S', category: 'cat01', type: 'SUV', engine: 'Essence', brand: 'Porsche', price: 340, image: require('@/assets/images/porsche_macan_s_home.webp') },
      { id: 10, name: 'Porsche 718 Boxter', category: 'cat01', type: 'Cabriolet', engine: 'Essence', brand: 'Porsche', price: 350, image: require('@/assets/images/porsche_718_boxter_home.webp') },
      
      // Catégorie 2
      { id: 11, name: 'Mercedes GLE 53 AMG', category: 'cat02', type: 'SUV', engine: 'Essence', brand: 'Mercedes', price: 450, image: require('@/assets/images/mb_gle_53_amg_home.webp') },
      { id: 12, name: 'BMW M3 Compétition', category: 'cat02', type: 'Berline', engine: 'Essence', brand: 'BMW', price: 470, image: require('@/assets/images/bmw_m3_comp_home.webp') },
      { id: 13, name: 'Porsche 992 Carrera Cabriolet', category: 'cat02', type: 'Cabriolet', engine: 'Essence', brand: 'Porsche', price: 490, image: require('@/assets/images/porsche_992_carrera_cab_home.webp') },
      { id: 14, name: 'Mercedes GT 43 AMG', category: 'cat02', type: 'Coupé', engine: 'Essence', brand: 'Mercedes', price: 480, image: require('@/assets/images/mb_gt_43_amg_home.jpg') },
      { id: 15, name: 'Porsche 992 Carrera', category: 'cat02', type: 'Coupé', engine: 'Essence', brand: 'Porsche', price: 470, image: require('@/assets/images/porsche_992_carrera_home.webp') },
      { id: 16, name: 'Mercedes SL 43 AMG', category: 'cat02', type: 'Cabriolet', engine: 'Essence', brand: 'Mercedes', price: 460, image: require('@/assets/images/mb_sl_43_amg_home.webp') },
      { id: 17, name: 'Porsche Cayenne E-Hybrid Coupé', category: 'cat02', type: 'SUV', engine: 'Hybride', brand: 'Porsche', price: 480, image: require('@/assets/images/porsche_cayenne_e-hybrid_home.webp') },
      { id: 18, name: 'Range Rover Sport P460e', category: 'cat02', type: 'SUV', engine: 'Hybride', brand: 'Range Rover', price: 470, image: require('@/assets/images/range_rover_sport_p460e_home.webp') },
      { id: 19, name: 'Range Rover Sport P440e', category: 'cat02', type: 'SUV', engine: 'Hybride', brand: 'Range Rover', price: 460, image: require('@/assets/images/range_rover_sport_p440e_home.webp') },
      
      // Catégorie 3
      { id: 20, name: 'Mercedes Classe G63 AMG', category: 'cat03', type: 'SUV', engine: 'Essence', brand: 'Mercedes', price: 650, image: require('@/assets/images/mb_g63_amg_home.webp') },
      { id: 21, name: 'Range Rover P560e SWB', category: 'cat03', type: 'SUV', engine: 'Hybride', brand: 'Range Rover', price: 670, image: require('@/assets/images/range_rover_p560e_swb_home.webp') },
      
      // Catégorie 4
      { id: 22, name: 'Bentley Continental GT', category: 'cat04', type: 'Coupé', engine: 'Essence', brand: 'Bentley', price: 850, image: require('@/assets/images/bentley_continental_gt_home.webp') },
      { id: 23, name: 'Porsche 718 GT4 RS', category: 'cat04', type: 'Coupé', engine: 'Essence', brand: 'Porsche', price: 870, image: require('@/assets/images/porsche_718_gt4_rs_home.webp') },
      { id: 24, name: 'Range Rover P635 SV', category: 'cat04', type: 'SUV', engine: 'Essence', brand: 'Range Rover', price: 880, image: require('@/assets/images/range_rover_p635_sv_home.webp') },
      { id: 25, name: 'Lamborghini Urus', category: 'cat04', type: 'SUV', engine: 'Essence', brand: 'Lamborghini', price: 890, image: require('@/assets/images/lamborghini_urus_home.webp') },
      { id: 26, name: 'Bentley Bentayga S', category: 'cat04', type: 'SUV', engine: 'Essence', brand: 'Bentley', price: 860, image: require('@/assets/images/bentley_bentayga_s_home.webp') },
      
      // Catégorie 5
      { id: 27, name: 'Porsche 992 GT3 RS', category: 'cat05', type: 'Coupé', engine: 'Essence', brand: 'Porsche', price: 1050, image: require('@/assets/images/porsche_992_gt3_rs_home.webp') },
      { id: 28, name: 'Lamborghini Huracan Technica', category: 'cat05', type: 'Coupé', engine: 'Essence', brand: 'Lamborghini', price: 1080, image: require('@/assets/images/lamborghini_huracan_technica_home.webp') },
      { id: 29, name: 'Lamborghini Urus S', category: 'cat05', type: 'SUV', engine: 'Essence', brand: 'Lamborghini', price: 1070, image: require('@/assets/images/lamborghini_urus_s_home.webp') },
      { id: 30, name: 'Lamborghini Urus Performante', category: 'cat05', type: 'SUV', engine: 'Essence', brand: 'Lamborghini', price: 1090, image: require('@/assets/images/lamborghini_urus_performante_home.webp') },
      { id: 31, name: 'Ferrari 488 Pista', category: 'cat05', type: 'Coupé', engine: 'Essence', brand: 'Ferrari', price: 1100, image: require('@/assets/images/ferrari_488_pista_home.webp') },
      
      // Catégorie 6
      { id: 32, name: 'Lamborghini Aventador SVJ', category: 'cat06', type: 'Coupé', engine: 'Essence', brand: 'Lamborghini', price: 1500, image: require('@/assets/images/lamborghini_avantador_svj_home.webp') },
    ])
    
    const filteredCars = computed(() => {
      // Créer un tableau pour stocker une voiture de chaque catégorie
      const selectedCars = [];
      
      // Sélectionner une voiture de chaque catégorie (de 1 à 6)
      for (let i = 1; i <= 6; i++) {
        const categoryName = `cat${i < 10 ? '0' + i : i}`;
        const carsInCategory = cars.value.filter(car => car.category === categoryName);
        
        // Si la catégorie contient des voitures, prendre la première
        if (carsInCategory.length > 0) {
          selectedCars.push(carsInCategory[0]);
        }
      }
      
      return selectedCars;
    })
    
    const hasCars = computed(() => filteredCars.value.length > 0)
    
    return {
      cars,
      filteredCars,
      hasCars
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
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url('@/assets/images/porsche_home.jpg');
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
    color: #fff;
    
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

// Separator
.section-separator {
  height: 1px;
  background: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.1), rgba(0,0,0,0));
  margin: 2rem auto;
  max-width: 80%;
}

// Why Choose Section
.why-choose-section {
  padding: 5rem 0;
  background-color: #f5f5f5;
  
  .why-choose-container {
    max-width: 1200px;
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
  
  .benefits-row {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1.5rem;
    margin-bottom: 2rem;
    
    @media (max-width: 1200px) {
      justify-content: center;
      gap: 2rem;
    }
    
    @media (max-width: 992px) {
      flex-direction: column;
      align-items: center;
    }
  }
  
  .benefit-column {
    flex: 0 0 calc(25% - 1.5rem);
    background-color: #fff;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    text-align: center;
    transition: transform 0.3s;
    
    @media (max-width: 1200px) {
      flex: 0 0 calc(45% - 1rem);
      margin-bottom: 1rem;
    }
    
    @media (max-width: 992px) {
      width: 100%;
      max-width: 400px;
      margin-bottom: 0;
    }
    
    &:hover {
      transform: translateY(-5px);
    }
    
    .benefit-icon {
      font-size: 2.5rem;
      color: #1a1a1a;
      margin-bottom: 1.5rem;
    }
    
    .benefit-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #1a1a1a;
    }
    
    .benefit-description {
      color: #666;
      line-height: 1.6;
    }
  }
}

// Cars Section
.cars-section {
  padding: 5rem 0;
  background-color: #f9f9f9;
  
  .cars-container {
    max-width: 1200px;
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
  
  .cars-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }
  
  .car-card {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s, box-shadow 0.3s;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    
    .car-image {
      height: 180px;
      background-size: cover;
      background-position: center;
      position: relative;
      
      .car-category {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: 600;
      }
    }
    
    .car-info {
      padding: 1.5rem;
      
      .car-title {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #1a1a1a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .car-specs {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        
        .car-spec {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
          
          i {
            color: #1a1a1a;
          }
        }
      }
      
      .car-price {
        font-size: 1.2rem;
        font-weight: 700;
        color: #1a1a1a;
        margin-bottom: 1rem;
        
        span {
          font-size: 0.9rem;
          font-weight: 400;
          color: #666;
        }
      }
      
      .car-actions {
        .btn-more {
          display: inline-block;
          background-color: #1a1a1a;
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          transition: all 0.3s;
          
          &:hover {
            background-color: #333;
          }
        }
      }
    }
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    
    @media (max-width: 992px) {
      grid-template-columns: repeat(2, 1fr);
    }
    
    @media (max-width: 576px) {
      grid-template-columns: 1fr;
    }
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
  background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('@/assets/images/mb-footer.jpg');
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
    color: #fff;
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
