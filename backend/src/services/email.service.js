const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Service pour l'envoi d'emails
 */
const emailService = {
  /**
   * Configuration du transporteur d'emails
   */
  getTransporter: () => {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  },

  /**
   * Envoi d'un email de réinitialisation de mot de passe
   * @param {string} to - Adresse email du destinataire
   * @param {Object} data - Données pour le template d'email
   */
  sendPasswordResetEmail: async (to, data) => {
    try {
      const transporter = emailService.getTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Réinitialisation de votre mot de passe - DriveturismoCopy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Bonjour ${data.name},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
            <p>
              <a href="${data.resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p>Ce lien est valable pendant 1 heure.</p>
            <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
            <p>Cordialement,<br>L'équipe DriveturismoCopy</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Email de réinitialisation envoyé à ${to}`);
      return true;
    } catch (error) {
      logger.error(`Erreur lors de l'envoi de l'email de réinitialisation à ${to}:`, error);
      throw error;
    }
  },

  /**
   * Envoi d'un email de confirmation de réservation
   * @param {string} to - Adresse email du destinataire
   * @param {Object} data - Données pour le template d'email
   */
  sendReservationConfirmationEmail: async (to, data) => {
    try {
      const transporter = emailService.getTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Confirmation de votre réservation - DriveturismoCopy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Confirmation de réservation</h2>
            <p>Bonjour ${data.name},</p>
            <p>Votre réservation a été confirmée avec succès.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Détails de la réservation :</h3>
              <p><strong>Référence :</strong> ${data.reservationId}</p>
              <p><strong>Véhicule :</strong> ${data.carBrand} ${data.carModel}</p>
              <p><strong>Dates :</strong> Du ${new Date(data.startDate).toLocaleDateString('fr-FR')} au ${new Date(data.endDate).toLocaleDateString('fr-FR')}</p>
              <p><strong>Lieu de prise en charge :</strong> ${data.pickupLocation}</p>
              <p><strong>Lieu de retour :</strong> ${data.returnLocation}</p>
              <p><strong>Montant total :</strong> ${data.totalPrice} €</p>
              <p><strong>Caution :</strong> ${data.depositAmount} €</p>
            </div>
            <p>N'oubliez pas de payer la caution pour finaliser votre réservation.</p>
            <p>
              <a href="${data.paymentUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Payer ma caution
              </a>
            </p>
            <p>Nous vous remercions pour votre confiance et vous souhaitons une excellente location.</p>
            <p>Cordialement,<br>L'équipe DriveturismoCopy</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Email de confirmation de réservation envoyé à ${to}`);
      return true;
    } catch (error) {
      logger.error(`Erreur lors de l'envoi de l'email de confirmation de réservation à ${to}:`, error);
      throw error;
    }
  },

  /**
   * Envoi d'un email de bienvenue après inscription
   * @param {string} to - Adresse email du destinataire
   * @param {Object} data - Données pour le template d'email
   */
  sendWelcomeEmail: async (to, data) => {
    try {
      const transporter = emailService.getTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Bienvenue sur DriveturismoCopy !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Bienvenue sur DriveturismoCopy !</h2>
            <p>Bonjour ${data.name},</p>
            <p>Nous sommes ravis de vous compter parmi nos utilisateurs.</p>
            <p>Avec DriveturismoCopy, vous pouvez :</p>
            <ul>
              <li>Réserver des véhicules de qualité</li>
              <li>Gérer vos réservations facilement</li>
              <li>Profiter de nos offres exclusives</li>
            </ul>
            <p>
              <a href="${data.loginUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Accéder à mon compte
              </a>
            </p>
            <p>Si vous avez des questions, n'hésitez pas à contacter notre service client.</p>
            <p>Cordialement,<br>L'équipe DriveturismoCopy</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      logger.info(`Email de bienvenue envoyé à ${to}`);
      return true;
    } catch (error) {
      logger.error(`Erreur lors de l'envoi de l'email de bienvenue à ${to}:`, error);
      throw error;
    }
  }
};

module.exports = emailService;
