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
   * Récupération de tous les utilisateurs avec pagination
   */
  getAllUsers: async (req, res, next) => {
    try {
      // Paramètres de pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      
      // Récupération des utilisateurs avec pagination
      const { count, rows: users } = await User.findAndCountAll({
        attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] },
        include: [
          { model: Role, as: 'role' },
          { model: SubscriptionType, as: 'subscriptionType' }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      // Calcul du nombre total de pages
      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        message: 'Liste des utilisateurs récupérée avec succès',
        users,
        pagination: {
          total: count,
          totalPages,
          currentPage: page,
          limit
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des utilisateurs:', error);
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
      const { email, password, firstName, lastName, phone, role, isActive } = req.body;

      // Journaliser les données reçues pour le débogage
      logger.info('Données reçues pour la création d\'utilisateur:', { ...req.body, password: '***' });

      // Vérification si l'email existe déjà
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      // Récupération de l'ID du rôle à partir du nom du rôle
      let roleId;
      if (role) {
        const roleRecord = await Role.findOne({ where: { name: role } });
        if (roleRecord) {
          roleId = roleRecord.id;
        } else {
          // Rôle par défaut (customer) si le rôle n'est pas trouvé
          const defaultRole = await Role.findOne({ where: { name: 'customer' } });
          roleId = defaultRole ? defaultRole.id : null;
        }
      }

      // Création de l'utilisateur
      const user = await User.create({
        email,
        password, // Le hash est géré par le hook beforeCreate dans le modèle
        firstName,
        lastName,
        phone,
        roleId,
        isActive: isActive !== undefined ? isActive : true
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

      const updateData = {};
      
      // Ne mettre à jour que les champs fournis dans la requête
      if (email !== undefined) updateData.email = email;
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (phone !== undefined) updateData.phone = phone;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (postalCode !== undefined) updateData.postalCode = postalCode;
      if (country !== undefined) updateData.country = country;
      if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
      
      // Journaliser les données de mise à jour pour le débogage
      logger.info(`Mise à jour de l'utilisateur ${id} avec les données:`, updateData);
      
      await user.update(updateData);

      // Si l'admin met à jour le rôle
      if (req.body.role && req.user.role.name === 'admin') {
        // Récupération de l'ID du rôle à partir du nom
        const roleRecord = await Role.findOne({ where: { name: req.body.role } });
        if (roleRecord) {
          await user.update({ roleId: roleRecord.id });
        }
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
