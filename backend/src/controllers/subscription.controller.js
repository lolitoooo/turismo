const { SubscriptionType, Subscription, User, Payment } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

// Obtenir tous les types d'abonnements
exports.getAllSubscriptionTypes = async (req, res) => {
  try {
    const subscriptionTypes = await SubscriptionType.findAll();
    
    // Formater les données pour le frontend
    const formattedSubscriptions = subscriptionTypes.map(sub => {
      // Extraire les fonctionnalités du champ JSONB features
      const features = sub.features ? (typeof sub.features === 'string' ? JSON.parse(sub.features) : sub.features) : {};
      
      return {
        id: sub.id,
        name: sub.name,
        level: features.level || sub.id, // Utiliser le niveau du champ features ou l'ID comme fallback
        price: sub.price,
        daysPerMonth: features.days_per_month || Math.round(sub.durationDays / 30), // Utiliser les jours par mois du champ features ou calculer
        vehicleAccess: features.vehicle_access || `Accès aux véhicules de catégories 1 à ${features.level || sub.id}`,
        featured: features.featured || false,
        description: sub.description,
        services: [
          { name: 'Livraison du véhicule', included: features.delivery_included || false },
          { name: 'Conciergerie', included: features.concierge_included || false },
          { name: 'Hotline dédiée', included: features.hotline_included || false },
          { name: 'Nettoyage personnalisé', included: features.cleaning_included || false }
        ]
      };
    });
    
    return res.status(200).json({ subscriptions: formattedSubscriptions });
  } catch (error) {
    console.error('Erreur lors de la récupération des types d\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des types d\'abonnement' });
  }
};

// Obtenir un type d'abonnement par ID
exports.getSubscriptionTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriptionType = await SubscriptionType.findByPk(id);
    
    if (!subscriptionType) {
      return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
    }
    
    return res.status(200).json(subscriptionType);
  } catch (error) {
    console.error('Erreur lors de la récupération du type d\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération du type d\'abonnement' });
  }
};

// Créer un nouveau type d'abonnement
exports.createSubscriptionType = async (req, res) => {
  try {
    const { name, price, description, level, features } = req.body;
    
    // Vérifier si le type d'abonnement existe déjà
    const existingType = await SubscriptionType.findOne({ where: { name } });
    if (existingType) {
      return res.status(400).json({ message: 'Un type d\'abonnement avec ce nom existe déjà' });
    }
    
    // Calculer la durée en jours en fonction du nombre de jours par mois
    const daysPerMonth = features?.days_per_month || 30;
    const durationDays = daysPerMonth * 30; // Durée d'un mois en jours
    
    // Créer un objet features avec les valeurs par défaut si non fournies
    const subscriptionFeatures = {
      level: level || 1,
      days_per_month: daysPerMonth,
      featured: features?.featured || false,
      delivery_included: features?.delivery_included || false,
      concierge_included: features?.concierge_included || false,
      hotline_included: features?.hotline_included || false,
      cleaning_included: features?.cleaning_included || false,
      vehicle_access: `Accès aux véhicules de catégories 1 à ${level || 1}`
    };
    
    const newSubscriptionType = await SubscriptionType.create({ 
      name, 
      price, 
      description,
      durationDays,
      features: subscriptionFeatures
    });
    
    // Formater la réponse pour le frontend
    const formattedSubscription = {
      id: newSubscriptionType.id,
      name: newSubscriptionType.name,
      level: subscriptionFeatures.level,
      price: newSubscriptionType.price,
      daysPerMonth: subscriptionFeatures.days_per_month,
      vehicleAccess: subscriptionFeatures.vehicle_access,
      featured: subscriptionFeatures.featured,
      description: newSubscriptionType.description,
      services: [
        { name: 'Livraison du véhicule', included: subscriptionFeatures.delivery_included },
        { name: 'Conciergerie', included: subscriptionFeatures.concierge_included },
        { name: 'Hotline dédiée', included: subscriptionFeatures.hotline_included },
        { name: 'Nettoyage personnalisé', included: subscriptionFeatures.cleaning_included }
      ]
    };
    
    return res.status(201).json(formattedSubscription);
  } catch (error) {
    console.error('Erreur lors de la création du type d\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création du type d\'abonnement' });
  }
};

// Mettre à jour un type d'abonnement
exports.updateSubscriptionType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, level, features } = req.body;
    
    const subscriptionType = await SubscriptionType.findByPk(id);
    if (!subscriptionType) {
      return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
    }
    
    // Vérifier si le nouveau nom existe déjà pour un autre type d'abonnement
    if (name) {
      const existingType = await SubscriptionType.findOne({ 
        where: { name, id: { [Op.ne]: id } } 
      });
      
      if (existingType) {
        return res.status(400).json({ message: 'Un type d\'abonnement avec ce nom existe déjà' });
      }
    }
    
    // Récupérer les features existantes
    let currentFeatures = subscriptionType.features;
    if (typeof currentFeatures === 'string') {
      currentFeatures = JSON.parse(currentFeatures);
    } else if (!currentFeatures) {
      currentFeatures = {};
    }
    
    // Mettre à jour les features si nécessaire
    let updatedFeatures = { ...currentFeatures };
    
    if (level !== undefined) {
      updatedFeatures.level = level;
      updatedFeatures.vehicle_access = `Accès aux véhicules de catégories 1 à ${level}`;
    }
    
    if (features) {
      updatedFeatures = {
        ...updatedFeatures,
        days_per_month: features.days_per_month || updatedFeatures.days_per_month,
        featured: features.featured !== undefined ? features.featured : updatedFeatures.featured,
        delivery_included: features.delivery_included !== undefined ? features.delivery_included : updatedFeatures.delivery_included,
        concierge_included: features.concierge_included !== undefined ? features.concierge_included : updatedFeatures.concierge_included,
        hotline_included: features.hotline_included !== undefined ? features.hotline_included : updatedFeatures.hotline_included,
        cleaning_included: features.cleaning_included !== undefined ? features.cleaning_included : updatedFeatures.cleaning_included
      };
    }
    
    // Calculer la durée en jours si le nombre de jours par mois a changé
    let durationDays = subscriptionType.durationDays;
    if (features && features.days_per_month) {
      durationDays = features.days_per_month * 30; // Durée d'un mois en jours
    }
    
    // Mettre à jour les champs fournis
    const updateData = {};
    if (name) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (durationDays !== undefined) updateData.durationDays = durationDays;
    updateData.features = updatedFeatures;
    
    await subscriptionType.update(updateData);
    
    // Formater la réponse pour le frontend
    const formattedSubscription = {
      id: subscriptionType.id,
      name: subscriptionType.name,
      level: updatedFeatures.level,
      price: subscriptionType.price,
      daysPerMonth: updatedFeatures.days_per_month,
      vehicleAccess: updatedFeatures.vehicle_access,
      featured: updatedFeatures.featured,
      description: subscriptionType.description,
      services: [
        { name: 'Livraison du véhicule', included: updatedFeatures.delivery_included },
        { name: 'Conciergerie', included: updatedFeatures.concierge_included },
        { name: 'Hotline dédiée', included: updatedFeatures.hotline_included },
        { name: 'Nettoyage personnalisé', included: updatedFeatures.cleaning_included }
      ]
    };
    
    return res.status(200).json(formattedSubscription);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du type d\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du type d\'abonnement' });
  }
};

// Supprimer un type d'abonnement
exports.deleteSubscriptionType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscriptionType = await SubscriptionType.findByPk(id);
    if (!subscriptionType) {
      return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
    }
    
    await subscriptionType.destroy();
    return res.status(200).json({ message: 'Type d\'abonnement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du type d\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la suppression du type d\'abonnement' });
  }
};

// ========== GESTION DES ABONNEMENTS UTILISATEURS ==========

/**
 * Récupérer tous les abonnements utilisateurs avec pagination
 */
exports.getUserSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, subscriptionType, status } = req.query;
    const offset = (page - 1) * limit;
    
    // Construction des filtres
    const filters = {};
    const userFilters = {};
    
    if (subscriptionType) {
      filters.subscriptionTypeId = subscriptionType;
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (search) {
      userFilters[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Récupération des abonnements avec pagination
    const { count, rows: subscriptionsData } = await Subscription.findAndCountAll({
      where: filters,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          where: Object.keys(userFilters).length > 0 ? userFilters : undefined
        },
        {
          model: SubscriptionType,
          as: 'subscriptionType'
        },
        {
          model: Payment,
          as: 'payments',
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    // Formater les abonnements pour le frontend
    const subscriptions = subscriptionsData.map(subscription => {
      const subscriptionType = subscription.subscriptionType;
      const features = subscriptionType.features ? 
        (typeof subscriptionType.features === 'string' ? 
          JSON.parse(subscriptionType.features) : subscriptionType.features) : {};
      
      return {
        id: subscription.id,
        userId: subscription.userId,
        user: subscription.user,
        subscriptionType: {
          id: subscriptionType.id,
          name: subscriptionType.name,
          level: features.level || subscriptionType.id,
          price: subscriptionType.price,
          description: subscriptionType.description
        },
        startDate: subscription.startDate,
        expiryDate: subscription.expiryDate,
        status: subscription.status,
        price: subscription.price,
        payments: subscription.payments || [],
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt
      };
    });
    
    return res.status(200).json({
      subscriptions,
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des abonnements utilisateurs:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des abonnements utilisateurs' });
  }
};

/**
 * Récupérer un abonnement utilisateur par ID
 */
exports.getUserSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscriptionData = await Subscription.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: SubscriptionType,
          as: 'subscriptionType'
        },
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });
    
    if (!subscriptionData) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }
    
    // Formater l'abonnement pour le frontend
    const subscriptionType = subscriptionData.subscriptionType;
    const features = subscriptionType.features ? 
      (typeof subscriptionType.features === 'string' ? 
        JSON.parse(subscriptionType.features) : subscriptionType.features) : {};
    
    const subscription = {
      id: subscriptionData.id,
      userId: subscriptionData.userId,
      user: subscriptionData.user,
      subscriptionType: {
        id: subscriptionType.id,
        name: subscriptionType.name,
        level: features.level || subscriptionType.id,
        price: subscriptionType.price,
        description: subscriptionType.description
      },
      startDate: subscriptionData.startDate,
      expiryDate: subscriptionData.expiryDate,
      status: subscriptionData.status,
      price: subscriptionData.price,
      payments: subscriptionData.payments || [],
      createdAt: subscriptionData.createdAt,
      updatedAt: subscriptionData.updatedAt
    };
    
    return res.status(200).json(subscription);
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'abonnement' });
  }
};

/**
 * Créer un nouvel abonnement utilisateur
 */
exports.createUserSubscription = async (req, res) => {
  try {
    const { userId, subscriptionTypeId, startDate, expiryDate, price, paymentMethod } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si le type d'abonnement existe
    const subscriptionType = await SubscriptionType.findByPk(subscriptionTypeId);
    if (!subscriptionType) {
      return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
    }
    
    // Vérifier si l'utilisateur a déjà un abonnement actif
    const activeSubscription = await Subscription.findOne({
      where: {
        userId,
        status: 'active',
        expiryDate: { [Op.gt]: new Date() }
      }
    });
    
    if (activeSubscription) {
      return res.status(400).json({ message: 'L\'utilisateur a déjà un abonnement actif' });
    }
    
    // Créer l'abonnement
    const subscription = await Subscription.create({
      userId,
      subscriptionTypeId,
      startDate: startDate || new Date(),
      expiryDate,
      status: 'active',
      price: price || subscriptionType.price
    });
    
    // Créer le paiement associé
    if (paymentMethod) {
      const payment = await Payment.create({
        subscriptionId: subscription.id,
        amount: price || subscriptionType.price,
        paymentType: 'subscription',
        paymentMethod: paymentMethod,
        status: 'completed',
        paymentDate: new Date()
      });
      
      // Mettre à jour l'abonnement avec l'ID du paiement
      await subscription.update({
        paymentId: payment.id
      });
    }
    
    // Récupérer l'abonnement créé avec ses relations
    const createdSubscription = await Subscription.findByPk(subscription.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: SubscriptionType,
          as: 'subscriptionType'
        }
      ]
    });
    
    return res.status(201).json({
      message: 'Abonnement créé avec succès',
      subscription: createdSubscription
    });
  } catch (error) {
    logger.error('Erreur lors de la création de l\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création de l\'abonnement' });
  }
};

/**
 * Mettre à jour un abonnement utilisateur
 */
exports.updateUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscriptionTypeId, startDate, expiryDate, status, price } = req.body;
    
    // Vérifier si l'abonnement existe
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }
    
    // Vérifier si le type d'abonnement existe si fourni
    if (subscriptionTypeId) {
      const subscriptionType = await SubscriptionType.findByPk(subscriptionTypeId);
      if (!subscriptionType) {
        return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
      }
    }
    
    // Mettre à jour les champs fournis
    const updateData = {};
    if (subscriptionTypeId) updateData.subscriptionTypeId = subscriptionTypeId;
    if (startDate) updateData.startDate = startDate;
    if (expiryDate) updateData.expiryDate = expiryDate;
    if (status) updateData.status = status;
    if (price !== undefined) updateData.price = price;
    
    await subscription.update(updateData);
    
    // Récupérer l'abonnement mis à jour avec ses relations
    const updatedSubscription = await Subscription.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: SubscriptionType,
          as: 'subscriptionType'
        },
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });
    
    return res.status(200).json({
      message: 'Abonnement mis à jour avec succès',
      subscription: updatedSubscription
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de l\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'abonnement' });
  }
};

/**
 * Annuler un abonnement utilisateur
 */
exports.cancelUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Vérifier si l'abonnement existe
    const subscription = await Subscription.findByPk(id);
    if (!subscription) {
      return res.status(404).json({ message: 'Abonnement non trouvé' });
    }
    
    // Mettre à jour le statut de l'abonnement
    await subscription.update({
      status: 'cancelled',
      cancellationReason: reason || 'Annulé par l\'administrateur',
      cancellationDate: new Date()
    });
    
    return res.status(200).json({
      message: 'Abonnement annulé avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de l\'annulation de l\'abonnement' });
  }
};
