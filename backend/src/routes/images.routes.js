const express = require('express');
const path = require('path');
const router = express.Router();

// Route pour servir les images de profil
router.get('/profile/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../../uploads/profile-images', filename);
  
  // Ajouter des en-têtes CORS spécifiques pour les images
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Envoyer le fichier
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Erreur lors de l\'envoi du fichier:', err);
      res.status(404).json({ message: 'Image non trouvée' });
    }
  });
});

module.exports = router;
