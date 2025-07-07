/**
 * Middleware de vérification des rôles
 * @param {Array} roles - Tableau des rôles autorisés
 */
module.exports = (roles) => {
  return (req, res, next) => {
    try {
      // Vérification que l'utilisateur est bien présent (middleware auth déjà passé)
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }

      // Vérification que l'utilisateur a un rôle
      if (!req.user.role) {
        return res.status(403).json({ message: 'Accès refusé. Aucun rôle attribué.' });
      }

      // Vérification que le rôle de l'utilisateur est dans la liste des rôles autorisés
      if (!roles.includes(req.user.role.name)) {
        return res.status(403).json({ message: 'Accès refusé. Permissions insuffisantes.' });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Erreur lors de la vérification des permissions' });
    }
  };
};
