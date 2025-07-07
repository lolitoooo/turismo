<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="not-found-title">404</h1>
      <h2 class="not-found-subtitle">Page non trouvée</h2>
      <p class="not-found-message">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <router-link to="/" class="btn-home">
        Retourner à l'accueil
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style lang="scss" scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  max-width: 600px;
}

.not-found-title {
  font-family: 'Playfair Display', serif;
  font-size: 6rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.not-found-subtitle {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
}

.not-found-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
}

.btn-home {
  display: inline-block;
  background-color: #1a1a1a;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #333;
  }
}
</style>
