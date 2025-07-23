const { Op } = require('sequelize');
const { 
  Reservation, ReservationStatus, Car, User, Payment, Review,
  CarCategory
} = require('../models');
const logger = require('../utils/logger');
const emailService = require('../services/email.service');
const paymentService = require('../services/payment.service');

/**
 * Contrôleur pour la gestion des réservations
 */
const reservationController = {
  /**
   * Récupération de toutes les réservations (admin/manager)
   */
  getAllReservations: async (req, res, next) => {
    try {
      const reservations = await Reservation.findAll({
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Car, as: 'car', include: [{ model: CarCategory, as: 'category' }] },
          { model: ReservationStatus, as: 'reservationStatus' },
          { model: Payment, as: 'payments' }
        ]
      });

      res.status(200).json({
        message: 'Liste des réservations récupérée avec succès',
        reservations
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupération des réservations d'un utilisateur
   */
  getUserReservations: async (req, res, next) => {
    try {
      // Utiliser l'ID de l'utilisateur connecté depuis req.user
      const userId = req.user.id;
      console.log('ID de l\'utilisateur connecté:', userId);

      const reservations = await Reservation.findAll({
        where: { userId },
        include: [
          { model: Car, as: 'car', include: [{ model: CarCategory, as: 'category' }] },
          { model: ReservationStatus, as: 'reservationStatus' },
          { model: Payment, as: 'payments' },
          { model: Review, as: 'review' }
        ]
      });

      res.status(200).json({
        message: 'Liste des réservations de l\'utilisateur récupérée avec succès',
        reservations
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupération d'une réservation par son ID
   */
  getReservationById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const reservation = await Reservation.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email', 'phone'] },
          { model: Car, as: 'car', include: [{ model: CarCategory, as: 'category' }] },
          { model: ReservationStatus, as: 'reservationStatus' },
          { model: Payment, as: 'payments' },
          { model: Review, as: 'review' }
        ]
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée' });
      }

      // Vérification des permissions (un utilisateur ne peut voir que ses propres réservations, sauf admin/manager)
      if (req.user.id !== reservation.userId && !['admin', 'manager'].includes(req.user.role.name)) {
        return res.status(403).json({ message: 'Accès non autorisé à cette réservation' });
      }

      res.status(200).json({
        message: 'Réservation récupérée avec succès',
        reservation
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Création d'une nouvelle réservation
   */
  createReservation: async (req, res, next) => {
    try {
      const {
        carId, startDate, endDate, pickupLocation, returnLocation,
        additionalOptions, specialRequests
      } = req.body;
      
      const userId = req.user.id;

      // Vérification si la voiture existe
      const car = await Car.findByPk(carId);
      if (!car) {
        return res.status(404).json({ message: 'Voiture non trouvée' });
      }

      // Vérification si la voiture est disponible
      if (!car.isAvailable) {
        return res.status(400).json({ message: 'Cette voiture n\'est pas disponible à la location' });
      }

      // Vérification si les dates sont valides
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return res.status(400).json({ message: 'La date de début doit être antérieure à la date de fin' });
      }

      if (start < new Date()) {
        return res.status(400).json({ message: 'La date de début ne peut pas être dans le passé' });
      }

      // Vérification si la voiture est disponible pour cette période
      const overlappingReservation = await Reservation.findOne({
        where: {
          carId,
          statusId: {
            [Op.in]: [
              // IDs des statuts 'confirmed' et 'in_progress'
              (await ReservationStatus.findOne({ where: { name: 'confirmed' } })).id,
              (await ReservationStatus.findOne({ where: { name: 'in_progress' } })).id
            ]
          },
          [Op.or]: [
            {
              startDate: { [Op.lte]: end },
              endDate: { [Op.gte]: start }
            },
            {
              startDate: { [Op.between]: [start, end] }
            },
            {
              endDate: { [Op.between]: [start, end] }
            }
          ]
        }
      });

      if (overlappingReservation) {
        return res.status(400).json({ message: 'Cette voiture n\'est pas disponible pour la période demandée' });
      }

      // Calcul du nombre de jours
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      // Calcul du prix total
      let totalPrice = car.dailyPrice * days;
      
      // Ajout des options supplémentaires au prix
      if (additionalOptions && Array.isArray(additionalOptions)) {
        additionalOptions.forEach(option => {
          totalPrice += option.price;
        });
      }

      // Création de la réservation
      const reservation = await Reservation.create({
        userId,
        carId,
        startDate,
        endDate,
        pickupLocation,
        returnLocation,
        status: 'pending',
        specialRequests: specialRequests || ''
      });

      // Récupération de la réservation créée avec ses relations
      const createdReservation = await Reservation.findByPk(reservation.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Car, as: 'car', include: [{ model: CarCategory, as: 'category' }] },
          { model: ReservationStatus, as: 'reservationStatus' }
        ]
      });

      res.status(201).json({
        message: 'Réservation créée avec succès',
        reservation: createdReservation
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mise à jour d'une réservation
   */
  updateReservation: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { pickupLocation, returnLocation, additionalOptions, specialRequests } = req.body;

      // Récupération de la réservation
      const reservation = await Reservation.findByPk(id, {
        include: [
          { model: ReservationStatus, as: 'reservationStatus' },
          { model: Car, as: 'car' }
        ]
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée' });
      }

      // Vérification des permissions (un utilisateur ne peut modifier que ses propres réservations, sauf admin/manager)
      if (req.user.id !== reservation.userId && !['admin', 'manager'].includes(req.user.role.name)) {
        return res.status(403).json({ message: 'Accès non autorisé pour modifier cette réservation' });
      }

      // Vérification si la réservation peut être modifiée
      if (!['pending', 'confirmed'].includes(reservation.reservationStatus.name)) {
        return res.status(400).json({ message: 'Cette réservation ne peut plus être modifiée' });
      }

      // Mise à jour de la réservation
      let updatedFields = {
        pickupLocation: pickupLocation || reservation.pickupLocation,
        returnLocation: returnLocation || reservation.returnLocation,
        specialRequests: specialRequests || reservation.specialRequests
      };

      // Mise à jour des options supplémentaires et recalcul du prix si nécessaire
      if (additionalOptions && Array.isArray(additionalOptions)) {
        updatedFields.additionalOptions = additionalOptions;
        
        // Calcul du nombre de jours
        const days = Math.ceil((new Date(reservation.endDate) - new Date(reservation.startDate)) / (1000 * 60 * 60 * 24));
        
        // Calcul du prix total
        let totalPrice = reservation.car.dailyPrice * days;
        
        // Ajout des options supplémentaires au prix
        additionalOptions.forEach(option => {
          totalPrice += option.price;
        });

        updatedFields.totalPrice = totalPrice;
      }

      // Mise à jour de la réservation
      await reservation.update(updatedFields);

      // Récupération de la réservation mise à jour
      const updatedReservation = await Reservation.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Car, as: 'car', include: [{ model: CarCategory, as: 'category' }] },
          { model: ReservationStatus, as: 'reservationStatus' }
        ]
      });

      res.status(200).json({
        message: 'Réservation mise à jour avec succès',
        reservation: updatedReservation
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Annulation d'une réservation
   */
  cancelReservation: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Récupération de la réservation
      const reservation = await Reservation.findByPk(id, {
        include: [
          { model: ReservationStatus, as: 'reservationStatus' },
          { model: Payment, as: 'payments' }
        ]
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée' });
      }

      // Vérification des permissions (un utilisateur ne peut annuler que ses propres réservations, sauf admin/manager)
      if (req.user.id !== reservation.userId && !['admin', 'manager'].includes(req.user.role.name)) {
        return res.status(403).json({ message: 'Accès non autorisé pour annuler cette réservation' });
      }
      
      // Suppression complète de la réservation de la base de données
      await reservation.destroy();
      
      // Récupération des informations de la voiture et de l'utilisateur avant de renvoyer la réponse
      const car = await Car.findByPk(reservation.carId);
      const user = await User.findByPk(reservation.userId, {
        attributes: ['id', 'firstName', 'lastName', 'email']
      });

      res.status(200).json({
        message: 'Réservation supprimée avec succès',
        deletedReservationInfo: {
          id: parseInt(id),
          userId: user ? user.id : null,
          carId: car ? car.id : null,
          userInfo: user || null,
          carInfo: car || null
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mise à jour du statut d'une réservation (admin/manager)
   */
  updateReservationStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { statusId } = req.body;

      // Récupération de la réservation
      const reservation = await Reservation.findByPk(id, {
        include: [
          { model: User, as: 'user' },
          { model: Car, as: 'car' },
          { model: ReservationStatus, as: 'reservationStatus' }
        ]
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée' });
      }

      // Vérification si le statut existe
      const newStatus = await ReservationStatus.findByPk(statusId);
      if (!newStatus) {
        return res.status(404).json({ message: 'Statut non trouvé' });
      }

      // Mise à jour de la réservation
      await reservation.update({ statusId });

      // Si le statut est 'confirmed', envoi d'un email de confirmation
      if (newStatus.name === 'confirmed') {
        const user = reservation.user;
        const car = reservation.car;
        
        // Génération de l'URL de paiement de la caution
        const paymentUrl = `${process.env.FRONTEND_URL}/reservations/${reservation.id}/payment`;
        
        await emailService.sendReservationConfirmationEmail(user.email, {
          name: `${user.firstName} ${user.lastName}`,
          reservationId: reservation.id,
          carBrand: car.brand,
          carModel: car.model,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          pickupLocation: reservation.pickupLocation,
          returnLocation: reservation.returnLocation,
          totalPrice: reservation.totalPrice,
          depositAmount: reservation.depositAmount,
          paymentUrl
        });
      }

      // Récupération de la réservation mise à jour
      const updatedReservation = await Reservation.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Car, as: 'car' },
          { model: ReservationStatus, as: 'reservationStatus' }
        ]
      });

      res.status(200).json({
        message: 'Statut de la réservation mis à jour avec succès',
        reservation: updatedReservation
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Paiement de la caution pour une réservation
   */
  payDeposit: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { paymentMethod, paymentDetails } = req.body;

      // Récupération de la réservation
      const reservation = await Reservation.findByPk(id, {
        include: [
          { model: User, as: 'user' },
          { model: Car, as: 'car' },
          { model: ReservationStatus, as: 'reservationStatus' },
          { model: Payment, as: 'payments' }
        ]
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée' });
      }

      // Vérification des permissions (un utilisateur ne peut payer que pour ses propres réservations)
      if (req.user.id !== reservation.userId) {
        return res.status(403).json({ message: 'Accès non autorisé pour cette réservation' });
      }

      // Vérification si la caution a déjà été payée
      const depositPayment = reservation.payments.find(payment => payment.type === 'deposit');
      if (depositPayment) {
        return res.status(400).json({ message: 'La caution a déjà été payée pour cette réservation' });
      }

      // Vérification si la réservation est confirmée
      if (reservation.reservationStatus.name !== 'confirmed') {
        return res.status(400).json({ message: 'La réservation doit être confirmée avant de payer la caution' });
      }

      // Traitement du paiement via le service de paiement
      const paymentResult = await paymentService.processPayment({
        amount: reservation.depositAmount,
        currency: 'EUR',
        paymentMethod,
        paymentDetails,
        description: `Caution pour la réservation #${reservation.id}`
      });

      if (!paymentResult.success) {
        return res.status(400).json({ 
          message: 'Le paiement de la caution a échoué', 
          error: paymentResult.error 
        });
      }

      // Enregistrement du paiement
      const payment = await Payment.create({
        reservationId: id,
        amount: reservation.depositAmount,
        type: 'deposit',
        status: 'completed',
        paymentMethod,
        transactionId: paymentResult.transactionId,
        details: paymentResult.details || {}
      });

      res.status(200).json({
        message: 'Caution payée avec succès',
        payment
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ajout d'un avis sur une réservation terminée
   */
  addReview: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;

      // Récupération de la réservation
      const reservation = await Reservation.findByPk(id, {
        include: [
          { model: ReservationStatus, as: 'reservationStatus' },
          { model: Review, as: 'review' }
        ]
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée' });
      }

      // Vérification des permissions (un utilisateur ne peut ajouter un avis que pour ses propres réservations)
      if (req.user.id !== reservation.userId) {
        return res.status(403).json({ message: 'Accès non autorisé pour cette réservation' });
      }

      // Vérification si la réservation est terminée
      if (reservation.reservationStatus.name !== 'completed') {
        return res.status(400).json({ message: 'Vous ne pouvez ajouter un avis que pour une réservation terminée' });
      }

      // Vérification si un avis existe déjà
      if (reservation.review) {
        return res.status(400).json({ message: 'Un avis a déjà été ajouté pour cette réservation' });
      }

      // Création de l'avis
      const review = await Review.create({
        userId: req.user.id,
        carId: reservation.carId,
        reservationId: id,
        rating,
        comment
      });

      res.status(201).json({
        message: 'Avis ajouté avec succès',
        review
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Enregistrer le début d'une location (admin/manager)
   */
  startRental: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { initialMileage } = req.body;

      // Récupération de la réservation
      const reservation = await Reservation.findByPk(id, {
        include: [
          { model: User, as: 'user' },
          { model: Car, as: 'car' },
          { model: ReservationStatus, as: 'reservationStatus' },
          { model: Payment, as: 'payments' }
        ]
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée' });
      }

      // Vérification si la réservation est confirmée
      if (reservation.reservationStatus.name !== 'confirmed') {
        return res.status(400).json({ message: 'La réservation doit être confirmée pour commencer la location' });
      }

      // Vérification si la caution a été payée
      const depositPayment = reservation.payments.find(payment => payment.type === 'deposit');
      if (!depositPayment) {
        return res.status(400).json({ message: 'La caution doit être payée avant de commencer la location' });
      }

      // Récupération du statut 'in_progress'
      const inProgressStatus = await ReservationStatus.findOne({ where: { name: 'in_progress' } });
      if (!inProgressStatus) {
        return res.status(500).json({ message: 'Erreur lors de la configuration des statuts' });
      }

      // Mise à jour de la réservation
      await reservation.update({
        statusId: inProgressStatus.id,
        actualStartDate: new Date(),
        initialMileage
      });

      // Mise à jour du kilométrage de la voiture
      await reservation.car.update({
        mileage: initialMileage
      });

      // Récupération de la réservation mise à jour
      const updatedReservation = await Reservation.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Car, as: 'car' },
          { model: ReservationStatus, as: 'reservationStatus' }
        ]
      });

      res.status(200).json({
        message: 'Location commencée avec succès',
        reservation: updatedReservation
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Enregistrer la fin d'une location (admin/manager)
   */
  endRental: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { finalMileage } = req.body;

      // Récupération de la réservation
      const reservation = await Reservation.findByPk(id, {
        include: [
          { model: User, as: 'user' },
          { model: Car, as: 'car' },
          { model: ReservationStatus, as: 'reservationStatus' }
        ]
      });

      if (!reservation) {
        return res.status(404).json({ message: 'Réservation non trouvée' });
      }

      // Vérification si la réservation est en cours
      if (reservation.reservationStatus.name !== 'in_progress') {
        return res.status(400).json({ message: 'La réservation doit être en cours pour terminer la location' });
      }

      // Vérification du kilométrage
      if (finalMileage < reservation.initialMileage) {
        return res.status(400).json({ message: 'Le kilométrage final ne peut pas être inférieur au kilométrage initial' });
      }

      // Calcul des kilomètres parcourus
      const kmDriven = finalMileage - reservation.initialMileage;

      // Calcul des frais supplémentaires si dépassement du forfait
      let extraFees = 0;
      if (kmDriven > reservation.car.includedKm) {
        const extraKm = kmDriven - reservation.car.includedKm;
        extraFees = extraKm * reservation.car.extraKmPrice;
      }

      // Récupération du statut 'completed'
      const completedStatus = await ReservationStatus.findOne({ where: { name: 'completed' } });
      if (!completedStatus) {
        return res.status(500).json({ message: 'Erreur lors de la configuration des statuts' });
      }

      // Mise à jour de la réservation
      await reservation.update({
        statusId: completedStatus.id,
        actualEndDate: new Date(),
        finalMileage,
        kmDriven,
        extraFees
      });

      // Mise à jour du kilométrage de la voiture
      await reservation.car.update({
        mileage: finalMileage
      });

      // Si des frais supplémentaires sont dus, création d'un paiement
      if (extraFees > 0) {
        await Payment.create({
          reservationId: id,
          amount: extraFees,
          type: 'extra_fees',
          status: 'pending',
          details: {
            reason: 'Frais kilométriques supplémentaires',
            extraKm: kmDriven - reservation.car.includedKm,
            pricePerKm: reservation.car.extraKmPrice
          }
        });
      }

      // Récupération de la réservation mise à jour
      const updatedReservation = await Reservation.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Car, as: 'car' },
          { model: ReservationStatus, as: 'reservationStatus' },
          { model: Payment, as: 'payments' }
        ]
      });

      res.status(200).json({
        message: 'Location terminée avec succès',
        reservation: updatedReservation,
        extraFees: extraFees > 0 ? {
          amount: extraFees,
          reason: 'Frais kilométriques supplémentaires',
          extraKm: kmDriven - reservation.car.includedKm,
          pricePerKm: reservation.car.extraKmPrice
        } : null
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupération des dates réservées pour un véhicule spécifique
   */
  getReservedDatesForCar: async (req, res, next) => {
    try {
      const { carId } = req.params;
      
      // Vérification si la voiture existe
      const car = await Car.findByPk(carId);
      if (!car) {
        return res.status(404).json({ message: 'Voiture non trouvée' });
      }

      // Récupération des réservations confirmées et en cours pour cette voiture
      const reservations = await Reservation.findAll({
        where: {
          carId,
          status: {
            [Op.in]: ['confirmed', 'pending', 'in_progress']
          }
        },
        attributes: ['startDate', 'endDate']
      });

      // Formatage des dates pour le frontend
      const reservedDates = reservations.map(reservation => ({
        start: reservation.startDate,
        end: reservation.endDate
      }));

      res.status(200).json({
        message: 'Dates réservées récupérées avec succès',
        reservedDates
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = reservationController;
