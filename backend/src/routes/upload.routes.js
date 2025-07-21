const express = require('express');
const uploadService = require('../services/upload.service');
const { authenticateJWT } = require('../middlewares/auth');
const { User } = require('../models');
const logger = require('../utils/logger');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateJWT);

/**
 * @route POST /api/upload/profile-image
 * @desc Upload d'une image de profil
 * @access Private
 */
router.post('/profile-image', async (req, res) => {
  try {
    uploadService.uploadProfileImage(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: `Erreur lors de l'upload: ${err.message}`
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucun fichier n\'a été uploadé'
        });
      }

      try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'Utilisateur non trouvé'
          });
        }

        // Supprimer l'ancienne image si elle existe
        if (user.profileImage) {
          await uploadService.deleteProfileImage(user.profileImage);
        }

        // Mettre à jour le chemin de l'image dans la base de données
        const profileImagePath = req.file.filename;
        await user.update({ profileImage: profileImagePath });

        res.status(200).json({
          success: true,
          message: 'Image de profil mise à jour avec succès',
          profileImage: uploadService.getProfileImageUrl(profileImagePath)
        });
      } catch (error) {
        logger.error('Erreur lors de la mise à jour de l\'image de profil:', error);
        res.status(500).json({
          success: false,
          message: 'Erreur lors de la mise à jour de l\'image de profil',
          error: error.message
        });
      }
    });
  } catch (error) {
    logger.error('Erreur lors de l\'upload de l\'image de profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload de l\'image de profil',
      error: error.message
    });
  }
});

module.exports = router;
