<template>
  <div class="contact-page container py-5">
    <h1 class="mb-4">Contactez-nous</h1>
    <div class="row">
      <div class="col-md-6">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h2 class="h4 mb-3">Formulaire de contact</h2>
            <form @submit.prevent="submitForm">
              <div class="mb-3">
                <label for="name" class="form-label">Nom</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="name" 
                  v-model="form.name" 
                  required
                >
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  class="form-control" 
                  id="email" 
                  v-model="form.email" 
                  required
                >
              </div>
              <div class="mb-3">
                <label for="subject" class="form-label">Sujet</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="subject" 
                  v-model="form.subject" 
                  required
                >
              </div>
              <div class="mb-3">
                <label for="message" class="form-label">Message</label>
                <textarea 
                  class="form-control" 
                  id="message" 
                  rows="5" 
                  v-model="form.message" 
                  required
                ></textarea>
              </div>
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer' }}
              </button>
              <div v-if="submitStatus" class="alert mt-3" :class="submitStatus.type">
                {{ submitStatus.message }}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-body">
            <h2 class="h4 mb-3">Nos coordonnées</h2>
            <p><strong>Adresse :</strong><br>
              Turismo<br>
              123 Avenue des Champs-Élysées<br>
              75008 Paris, France
            </p>
            <p><strong>Téléphone :</strong><br>
              +33 (0)1 23 45 67 89
            </p>
            <p><strong>Email :</strong><br>
              contact@driveturismo.com
            </p>
            <h3 class="h5 mt-4">Horaires d'ouverture</h3>
            <p>
              Lundi - Vendredi : 9h00 - 19h00<br>
              Samedi : 10h00 - 18h00<br>
              Dimanche : Fermé
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactPage',
  data() {
    return {
      form: {
        name: '',
        email: '',
        subject: '',
        message: ''
      },
      isSubmitting: false,
      submitStatus: null
    }
  },
  methods: {
    async submitForm() {
      this.isSubmitting = true
      this.submitStatus = null
      
      try {
        // Simuler un appel API avec un délai
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Ici, vous pourriez implémenter l'appel API réel vers votre backend
        // const response = await fetch('/api/contact', {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify(this.form)
        // })
        
        // if (!response.ok) throw new Error('Erreur lors de l'envoi du message')
        
        this.submitStatus = {
          type: 'alert-success',
          message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
        }
        
        // Réinitialiser le formulaire
        this.form = {
          name: '',
          email: '',
          subject: '',
          message: ''
        }
      } catch (error) {
        this.submitStatus = {
          type: 'alert-danger',
          message: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer ultérieurement.'
        }
        console.error('Erreur de contact:', error)
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.contact-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
