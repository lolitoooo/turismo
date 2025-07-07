const { User, Role, SubscriptionType } = require('../models');
const logger = require('../utils/logger');
const driverLicenseService = require('../services/driverLicense.service');

/**
 * Contrôleur pour la gestion des utilisateurs
 */
const userController = {
  /**
   * Récupération du profil de l'utilisateur connecté
   */
  getProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [
          { model: Role, as: 'role' },
          { model: SubscriptionType, as: 'subscriptionType' }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.status(200).json({
        message: 'Profil récupéré avec succès',
        user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mise à jour du profil de l'utilisateur connecté
   */
  updateProfile: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { firstName, lastName, phone, address, city, postalCode, country, driverLicenseNumber, latitude, longitude } = req.body;

      // Récupération de l'utilisateur
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Mise à jour de l'utilisateur
      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phone: phone !== undefined ? phone : user.phone,
        address: address !== undefined ? address : user.address,
        city: city !== undefined ? city : user.city,
        postalCode: postalCode !== undefined ? postalCode : user.postalCode,
        country: country !== undefined ? country : user.country,
        latitude: latitude !== undefined ? latitude : user.latitude,
        longitude: longitude !== undefined ? longitude : user.longitude,
        driverLicenseNumber: driverLicenseNumber !== undefined ? driverLicenseNumber : user.driverLicenseNumber
      });

      // Récupération de l'utilisateur mis à jour avec son rôle
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [
          { model: Role, as: 'role' },
          { model: SubscriptionType, as: 'subscriptionType' }
        ]
      });

      res.status(200).json({
        message: 'Profil mis à jour avec succès',
        user: updatedUser
      });
    } catch (error) {
      logger.error('Erreur lors de la mise à jour du profil:', error);
      next(error);
    }
  },

  /**
   * Récupération de tous les utilisateurs
   */
  getAllUsers: async (req, res, next) => {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [
          { model: Role, as: 'role' },
          { model: SubscriptionType, as: 'subscriptionType' }
        ]
      });

      res.status(200).json({
        message: 'Liste des utilisateurs récupérée avec succès',
        users
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupération d'un utilisateur par son ID
   */
  getUserById: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Vérification des permissions (un utilisateur ne peut voir que son propre profil, sauf admin/manager)
      if (req.user.id !== parseInt(id) && !['admin', 'manager'].includes(req.user.role.name)) {
        return res.status(403).json({ message: 'Accès non autorisé à ce profil utilisateur' });
      }

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [
          { model: Role, as: 'role' },
          { model: SubscriptionType, as: 'subscriptionType' }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      res.status(200).json({
        message: 'Utilisateur récupéré avec succès',
        user
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Création d'un nouvel utilisateur (admin uniquement)
   */
  createUser: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, phone, roleId } = req.body;

      // Vérification si l'email existe déjà
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      // Création de l'utilisateur
      const user = await User.create({
        email,
        password, // Le hash est géré par le hook beforeCreate dans le modèle
        firstName,
        lastName,
        phone,
        roleId
      });

      // Récupération de l'utilisateur créé avec son rôle
      const createdUser = await User.findByPk(user.id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [{ model: Role, as: 'role' }]
      });

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: createdUser
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mise à jour d'un utilisateur
   */
  updateUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { email, firstName, lastName, phone, address, city, postalCode, country } = req.body;

      // Vérification des permissions (un utilisateur ne peut modifier que son propre profil, sauf admin/manager)
      if (req.user.id !== parseInt(id) && !['admin', 'manager'].includes(req.user.role.name)) {
        return res.status(403).json({ message: 'Accès non autorisé pour modifier ce profil utilisateur' });
      }

      // Récupération de l'utilisateur
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Vérification si l'email existe déjà (si changement d'email)
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }
      }

      // Mise à jour de l'utilisateur
      await user.update({
        email: email || user.email,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phone: phone || user.phone,
        address: address || user.address,
        city: city || user.city,
        postalCode: postalCode || user.postalCode,
        country: country || user.country
      });

      // Si l'admin met à jour le rôle
      if (req.body.roleId && req.user.role.name === 'admin') {
        await user.update({ roleId: req.body.roleId });
      }

      // Récupération de l'utilisateur mis à jour avec son rôle
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [
          { model: Role, as: 'role' },
          { model: SubscriptionType, as: 'subscriptionType' }
        ]
      });

      res.status(200).json({
        message: 'Utilisateur mis à jour avec succès',
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Suppression d'un utilisateur (admin uniquement)
   */
  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Récupération de l'utilisateur
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Suppression de l'utilisateur
      await user.destroy();

      res.status(200).json({
        message: 'Utilisateur supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Vérification du permis de conduire d'un utilisateur
   */
  verifyDriverLicense: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { licenseNumber } = req.body;

      // Vérification des permissions (un utilisateur ne peut vérifier que son propre permis, sauf admin/manager)
      if (req.user.id !== parseInt(id) && !['admin', 'manager'].includes(req.user.role.name)) {
        return res.status(403).json({ message: 'Accès non autorisé pour vérifier ce permis' });
      }

      // Récupération de l'utilisateur
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Appel au service de vérification de permis
      const verificationResult = await driverLicenseService.verifyLicense(licenseNumber);

      // Mise à jour de l'utilisateur
      await user.update({
        driverLicenseNumber: licenseNumber,
        driverLicenseVerified: verificationResult.isValid
      });

      res.status(200).json({
        message: verificationResult.isValid 
          ? 'Permis de conduire vérifié avec succès' 
          : 'La vérification du permis de conduire a échoué',
        isValid: verificationResult.isValid,
        details: verificationResult.details
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Gestion de l'abonnement d'un utilisateur
   */
  manageSubscription: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { subscriptionTypeId } = req.body;

      // Vérification des permissions (un utilisateur ne peut gérer que son propre abonnement, sauf admin/manager)
      if (req.user.id !== parseInt(id) && !['admin', 'manager'].includes(req.user.role.name)) {
        return res.status(403).json({ message: 'Accès non autorisé pour gérer cet abonnement' });
      }

      // Récupération de l'utilisateur
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Récupération du type d'abonnement
      const subscriptionType = await SubscriptionType.findByPk(subscriptionTypeId);
      if (!subscriptionType) {
        return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
      }

      // Calcul des dates d'abonnement
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + subscriptionType.durationDays);

      // Mise à jour de l'utilisateur
      await user.update({
        subscriptionTypeId,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate
      });

      // Récupération de l'utilisateur mis à jour avec son abonnement
      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [
          { model: Role, as: 'role' },
          { model: SubscriptionType, as: 'subscriptionType' }
        ]
      });

      res.status(200).json({
        message: 'Abonnement mis à jour avec succès',
        user: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
