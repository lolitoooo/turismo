<template>
  <div class="faq-page container py-5">
    <h1 class="mb-4">Foire Aux Questions (FAQ)</h1>
    <div class="card shadow-sm">
      <div class="card-body">
        <div class="accordion" id="faqAccordion">
          <!-- Question 1 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingOne">
              Comment puis-je réserver un véhicule ?
            </h2>
            <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>
                  Pour réserver un véhicule, vous devez d'abord créer un compte sur notre plateforme. Une fois connecté, vous pouvez parcourir notre catalogue de véhicules, 
                  sélectionner celui qui vous intéresse, choisir vos dates de location et procéder au paiement. Vous recevrez une confirmation de réservation par email.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Question 2 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingTwo">
              Quels documents sont nécessaires pour louer un véhicule ?              
            </h2>
            <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>
                  Pour louer un véhicule, vous devez présenter :
                </p>
                <ul>
                  <li>Un permis de conduire valide depuis au moins 2 ans</li>
                  <li>Une pièce d'identité (carte d'identité ou passeport)</li>
                  <li>Une carte bancaire à votre nom pour le paiement et la caution</li>
                  <li>Un justificatif de domicile de moins de 3 mois</li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Question 3 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingThree">
              Quelle est la politique d'annulation ?
            </h2>
            <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>
                  Notre politique d'annulation est la suivante :
                </p>
                <ul>
                  <li>Annulation plus de 48 heures avant la prise en charge : remboursement à 100%</li>
                  <li>Annulation entre 24 et 48 heures avant la prise en charge : remboursement à 50%</li>
                  <li>Annulation moins de 24 heures avant la prise en charge : aucun remboursement</li>
                </ul>
              </div>
            </div>
          </div>
          
          <!-- Question 4 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingFour">
              Y a-t-il une limite de kilométrage ?
            </h2>
            <div id="collapseFour" class="accordion-collapse collapse" aria-labelledby="headingFour" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>
                  Oui, nos locations incluent un kilométrage limité qui varie selon le véhicule et la durée de location. 
                  En général, nous offrons 200 km par jour. Des kilomètres supplémentaires peuvent être achetés lors de la réservation 
                  ou facturés à la fin de la location au tarif de 0,50€ par kilomètre supplémentaire.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Question 5 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingFive">
              Quelle est la caution demandée ?
            </h2>
            <div id="collapseFive" class="accordion-collapse collapse" aria-labelledby="headingFive" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>
                  Le montant de la caution varie selon le véhicule loué. Pour les véhicules de catégorie standard, la caution est généralement de 1 000€. 
                  Pour les véhicules premium et de luxe, la caution peut aller de 2 000€ à 5 000€. La caution est prélevée sous forme de pré-autorisation 
                  sur votre carte bancaire et est libérée après le retour du véhicule en bon état.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Question 6 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingSix">
              Que faire en cas d'accident ou de panne ?
            </h2>
            <div id="collapseSix" class="accordion-collapse collapse" aria-labelledby="headingSix" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>
                  En cas d'accident ou de panne, vous devez :
                </p>
                <ol>
                  <li>Assurer votre sécurité et celle des autres personnes impliquées</li>
                  <li>Contacter les services d'urgence si nécessaire</li>
                  <li>Informer immédiatement notre service client au +33 (0)1 23 45 67 89</li>
                  <li>Remplir le constat amiable en cas d'accident</li>
                  <li>Ne pas faire réparer le véhicule sans notre accord préalable</li>
                </ol>
                <p>
                  Tous nos véhicules sont couverts par une assistance 24h/24 et 7j/7.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Question 7 -->
          <div class="accordion-item">
            <h2 class="accordion-header" id="headingSeven">
              Puis-je modifier ma réservation ?
            </h2>
            <div id="collapseSeven" class="accordion-collapse collapse" aria-labelledby="headingSeven" data-bs-parent="#faqAccordion">
              <div class="accordion-body">
                <p>
                  Oui, vous pouvez modifier votre réservation jusqu'à 48 heures avant la date de prise en charge du véhicule, 
                  sous réserve de disponibilité. Des frais supplémentaires peuvent s'appliquer si le nouveau tarif est plus élevé. 
                  Pour modifier votre réservation, connectez-vous à votre compte ou contactez notre service client.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FAQPage'
}
</script>

<style scoped>
.faq-page {
  max-width: 900px;
  margin: 0 auto;
}

.accordion-button:not(.collapsed) {
  background-color: rgba(0, 123, 255, 0.1);
  color: #0056b3;
}

.accordion-button:focus {
  box-shadow: none;
  border-color: rgba(0, 0, 0, 0.125);
}
</style>
