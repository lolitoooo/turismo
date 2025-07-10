<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-top">
        <div class="footer-brand">
          <h2 class="footer-logo">TURISMO</h2>
          <p class="footer-slogan">Location de voitures de luxe</p>
        </div>
        
        <div class="footer-links">
          <div class="footer-column">
            <h3 class="footer-title">Navigation</h3>
            <ul class="footer-menu">
              <li><router-link to="/">Accueil</router-link></li>
              <li><router-link to="/cars">Nos véhicules</router-link></li>
              <li><router-link to="/about">À propos</router-link></li>
              <li><router-link to="/contact">Contact</router-link></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h3 class="footer-title">Informations</h3>
            <ul class="footer-menu">
              <li><router-link to="/terms-of-service">Conditions générales</router-link></li>
              <li><router-link to="/privacy-policy">Politique de confidentialité</router-link></li>
              <li><router-link to="/faq">FAQ</router-link></li>
            </ul>
          </div>
          
          <div class="footer-column">
            <h3 class="footer-title">Contact</h3>
            <ul class="footer-menu">
              <li><a href="tel:+33123456789">+33 1 23 45 67 89</a></li>
              <li><a href="mailto:contact@driveturismo.com">contact@driveturismo.com</a></li>
              <li>123 Avenue des Champs-Élysées, 75008 Paris</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p class="copyright">&copy; {{ currentYear }} Turismo. Tous droits réservés.</p>
        <div class="social-links">
          <a href="#" class="social-link"><i class="pi pi-facebook"></i></a>
          <a href="#" class="social-link"><i class="pi pi-instagram"></i></a>
          <a href="#" class="social-link"><i class="pi pi-twitter"></i></a>
          <a href="#" class="social-link"><i class="pi pi-linkedin"></i></a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'AppFooter',
  setup() {
    const currentYear = computed(() => new Date().getFullYear())
    
    return {
      currentYear
    }
  }
}
</script>

<style lang="scss" scoped>
.footer {
  background-color: #1a1a1a;
  color: #fff;
  padding: 4rem 0 2rem;
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.footer-brand {
  margin-bottom: 2rem;
  
  .footer-logo {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    letter-spacing: 1px;
    color: #fff;
  }
  
  .footer-slogan {
    color: #aaa;
    font-size: 0.95rem;
  }
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 2rem;
  }
}

.footer-column {
  min-width: 160px;
  
  .footer-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1.25rem;
    position: relative;
    color: #fff;
    
    &::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      width: 40px;
      height: 2px;
      background-color: #666;
    }
  }
  
  .footer-menu {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      margin-bottom: 0.75rem;
      
      a {
        color: #aaa;
        text-decoration: none;
        transition: color 0.3s;
        
        &:hover {
          color: #fff;
        }
      }
    }
  }
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid #333;
  
  @media (max-width: 576px) {
    flex-direction: column;
    gap: 1rem;
  }
  
  .copyright {
    color: #aaa;
    font-size: 0.9rem;
  }
  
  .social-links {
    display: flex;
    gap: 1rem;
    
    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #333;
      color: #fff;
      text-decoration: none;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #666;
      }
    }
  }
}
</style>
