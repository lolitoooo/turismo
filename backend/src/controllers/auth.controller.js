const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Role } = require('../models');
const logger = require('../utils/logger');
const emailService = require('../services/email.service');

/**
 * Contrôleur pour la gestion de l'authentification
 */
const authController = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Vérification si l'email existe déjà
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }

      // Récupération du rôle "customer" par défaut
      const customerRole = await Role.findOne({ where: { name: 'customer' } });
      if (!customerRole) {
        return res.status(500).json({ message: 'Erreur lors de la configuration des rôles' });
      }

      // Création de l'utilisateur
      const user = await User.create({
        email,
        password, // Le hash est géré par le hook beforeCreate dans le modèle
        firstName,
        lastName,
        phone,
        roleId: customerRole.id
      });

      // Génération du token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );

      // Envoi de la réponse sans le mot de passe
      const userWithoutPassword = { ...user.get() };
      delete userWithoutPassword.password;

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Connexion d'un utilisateur
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Recherche de l'utilisateur
      const user = await User.findOne({ 
        where: { email },
        include: ['role']
      });

      // Vérification de l'existence de l'utilisateur
      if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Vérification du mot de passe
      const isPasswordValid = await user.validPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      // Génération du token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION }
      );

      // Envoi de la réponse sans le mot de passe
      const userWithoutPassword = { ...user.get() };
      delete userWithoutPassword.password;

      res.status(200).json({
        message: 'Connexion réussie',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Demande de réinitialisation de mot de passe
   */
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      // Recherche de l'utilisateur
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Pour des raisons de sécurité, on ne révèle pas si l'email existe ou non
        return res.status(200).json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
      }

      // Génération d'un token de réinitialisation
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

      // Mise à jour de l'utilisateur avec le token
      await user.update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry
      });

      // Envoi de l'email de réinitialisation
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      await emailService.sendPasswordResetEmail(user.email, {
        name: `${user.firstName} ${user.lastName}`,
        resetUrl
      });

      res.status(200).json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Réinitialisation du mot de passe
   */
  resetPassword: async (req, res, next) => {
    try {
      const { token, password } = req.body;

      // Recherche de l'utilisateur avec le token valide
      const user = await User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: new Date() }
        }
      });

      if (!user) {
        return res.status(400).json({ message: 'Token invalide ou expiré' });
      }

      // Mise à jour du mot de passe
      await user.update({
        password,
        resetPasswordToken: null,
        resetPasswordExpires: null
      });

      res.status(200).json({ message: 'Mot de passe réinitialisé avec succès' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Vérification de la validité du token JWT
   */
  verifyToken: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token manquant' });
      }

      const token = authHeader.split(' ')[1];

      // Vérification du token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Recherche de l'utilisateur
      const user = await User.findByPk(decoded.id, {
        include: ['role']
      });

      if (!user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      // Envoi de la réponse sans le mot de passe
      const userWithoutPassword = { ...user.get() };
      delete userWithoutPassword.password;

      res.status(200).json({
        message: 'Token valide',
        user: userWithoutPassword
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expiré' });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token invalide' });
      }
      next(error);
    }
  }
};

module.exports = authController;
