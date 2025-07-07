const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Créer le dossier d'upload s'il n'existe pas
const uploadDir = path.join(__dirname, '../../uploads');
const profileImagesDir = path.join(uploadDir, 'profile-images');

// Créer les dossiers s'ils n'existent pas
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(profileImagesDir)) {
  fs.mkdirSync(profileImagesDir, { recursive: true });
}

// Configuration du stockage pour multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileImagesDir);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique avec l'extension d'origine
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  // Accepter uniquement les types d'images courants
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Le fichier doit être une image'), false);
  }
};

// Créer l'instance multer pour l'upload d'images de profil
const profileImageUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5MB
  },
  fileFilter: fileFilter
});

/**
 * Service pour la gestion des uploads de fichiers
 */
const uploadService = {
  /**
   * Middleware pour l'upload d'image de profil
   */
  uploadProfileImage: profileImageUpload.single('profileImage'),

  /**
   * Supprimer une image de profil existante
   * @param {string} imagePath - Chemin de l'image à supprimer
   * @returns {Promise<boolean>} - Résultat de la suppression
   */
  deleteProfileImage: async (imagePath) => {
    if (!imagePath) return true;

    try {
      const fullPath = path.join(profileImagesDir, path.basename(imagePath));
      
      // Vérifier si le fichier existe avant de le supprimer
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        logger.info(`Image de profil supprimée: ${fullPath}`);
      }
      return true;
    } catch (error) {
      logger.error(`Erreur lors de la suppression de l'image de profil: ${error.message}`);
      return false;
    }
  },

  /**
   * Obtenir l'URL complète d'une image de profil
   * @param {string} imagePath - Chemin relatif de l'image
   * @returns {string} - URL complète de l'image
   */
  getProfileImageUrl: (imagePath) => {
    if (!imagePath) return null;
    return `/uploads/profile-images/${path.basename(imagePath)}`;
  }
};

module.exports = uploadService;
