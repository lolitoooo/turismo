const { Op } = require('sequelize');
const { Car, CarCategory, CarAvailability, Reservation, ReservationStatus } = require('../models');
const logger = require('../utils/logger');

/**
 * Contrôleur pour la gestion des voitures
 */
const carController = {
  /**
   * Récupération de toutes les voitures
   */
  getAllCars: async (req, res, next) => {
    try {
      const cars = await Car.findAll({
        include: [
          { model: CarCategory, as: 'category' }
        ]
      });

      res.status(200).json({
        message: 'Liste des voitures récupérée avec succès',
        cars
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupération des voitures disponibles
   */
  getAvailableCars: async (req, res, next) => {
    try {
      const cars = await Car.findAll({
        where: { isAvailable: true },
        include: [
          { model: CarCategory, as: 'category' }
        ]
      });

      res.status(200).json({
        message: 'Liste des voitures disponibles récupérée avec succès',
        cars
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupération d'une voiture par son ID
   */
  getCarById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const car = await Car.findByPk(id, {
        include: [
          { model: CarCategory, as: 'category' },
          { model: CarAvailability, as: 'availabilities' }
        ]
      });

      if (!car) {
        return res.status(404).json({ message: 'Voiture non trouvée' });
      }

      res.status(200).json({
        message: 'Voiture récupérée avec succès',
        car
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Recherche de voitures disponibles pour une période donnée
   */
  searchAvailableCars: async (req, res, next) => {
    try {
      const { startDate, endDate, categoryId, minPrice, maxPrice } = req.query;
      
      // Construction des filtres
      const filters = { isAvailable: true };
      
      if (categoryId) {
        filters.categoryId = categoryId;
      }
      
      if (minPrice && maxPrice) {
        filters.dailyPrice = { [Op.between]: [minPrice, maxPrice] };
      } else if (minPrice) {
        filters.dailyPrice = { [Op.gte]: minPrice };
      } else if (maxPrice) {
        filters.dailyPrice = { [Op.lte]: maxPrice };
      }

      // Récupération des voitures selon les filtres
      const cars = await Car.findAll({
        where: filters,
        include: [
          { model: CarCategory, as: 'category' }
        ]
      });

      // Si des dates sont spécifiées, on filtre les voitures disponibles pour cette période
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Récupération des réservations qui chevauchent la période demandée
        const reservations = await Reservation.findAll({
          where: {
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
          },
          attributes: ['carId']
        });

        // Récupération des indisponibilités qui chevauchent la période demandée
        const unavailabilities = await CarAvailability.findAll({
          where: {
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
          },
          attributes: ['carId']
        });

        // IDs des voitures indisponibles
        const unavailableCarIds = [
          ...reservations.map(r => r.carId),
          ...unavailabilities.map(u => u.carId)
        ];

        // Filtrage des voitures disponibles
        const availableCars = cars.filter(car => !unavailableCarIds.includes(car.id));

        return res.status(200).json({
          message: 'Liste des voitures disponibles pour la période demandée',
          cars: availableCars
        });
      }

      // Si pas de dates spécifiées, on renvoie toutes les voitures disponibles
      res.status(200).json({
        message: 'Liste des voitures disponibles',
        cars
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Création d'une nouvelle voiture
   */
  createCar: async (req, res, next) => {
    try {
      const {
        brand, model, year, color, licensePlate, mileage, categoryId,
        dailyPrice, depositAmount, includedKm, extraKmPrice,
        seats, transmission, fuelType, features, images
      } = req.body;

      // Vérification si la plaque d'immatriculation existe déjà
      const existingCar = await Car.findOne({ where: { licensePlate } });
      if (existingCar) {
        return res.status(400).json({ message: 'Cette plaque d\'immatriculation est déjà utilisée' });
      }

      // Création de la voiture
      const car = await Car.create({
        brand,
        model,
        year,
        color,
        licensePlate,
        mileage,
        categoryId,
        dailyPrice,
        depositAmount,
        includedKm,
        extraKmPrice,
        seats,
        transmission,
        fuelType,
        features: features || {},
        images: images || [],
        isAvailable: true
      });

      // Récupération de la voiture créée avec sa catégorie
      const createdCar = await Car.findByPk(car.id, {
        include: [{ model: CarCategory, as: 'category' }]
      });

      res.status(201).json({
        message: 'Voiture créée avec succès',
        car: createdCar
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mise à jour d'une voiture
   */
  updateCar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const {
        brand, model, year, color, licensePlate, mileage, categoryId,
        dailyPrice, depositAmount, includedKm, extraKmPrice,
        seats, transmission, fuelType, features, images, isAvailable
      } = req.body;

      // Récupération de la voiture
      const car = await Car.findByPk(id);
      if (!car) {
        return res.status(404).json({ message: 'Voiture non trouvée' });
      }

      // Vérification si la plaque d'immatriculation existe déjà (si changement de plaque)
      if (licensePlate && licensePlate !== car.licensePlate) {
        const existingCar = await Car.findOne({ where: { licensePlate } });
        if (existingCar) {
          return res.status(400).json({ message: 'Cette plaque d\'immatriculation est déjà utilisée' });
        }
      }

      // Mise à jour de la voiture
      await car.update({
        brand: brand || car.brand,
        model: model || car.model,
        year: year || car.year,
        color: color || car.color,
        licensePlate: licensePlate || car.licensePlate,
        mileage: mileage || car.mileage,
        categoryId: categoryId || car.categoryId,
        dailyPrice: dailyPrice || car.dailyPrice,
        depositAmount: depositAmount || car.depositAmount,
        includedKm: includedKm || car.includedKm,
        extraKmPrice: extraKmPrice || car.extraKmPrice,
        seats: seats || car.seats,
        transmission: transmission || car.transmission,
        fuelType: fuelType || car.fuelType,
        features: features || car.features,
        images: images || car.images,
        isAvailable: isAvailable !== undefined ? isAvailable : car.isAvailable
      });

      // Récupération de la voiture mise à jour avec sa catégorie
      const updatedCar = await Car.findByPk(id, {
        include: [{ model: CarCategory, as: 'category' }]
      });

      res.status(200).json({
        message: 'Voiture mise à jour avec succès',
        car: updatedCar
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Suppression d'une voiture
   */
  deleteCar: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Récupération de la voiture
      const car = await Car.findByPk(id);
      if (!car) {
        return res.status(404).json({ message: 'Voiture non trouvée' });
      }

      // Vérification si la voiture a des réservations en cours
      const activeReservations = await Reservation.findOne({
        where: {
          carId: id,
          statusId: {
            [Op.in]: [
              // IDs des statuts 'confirmed' et 'in_progress'
              (await ReservationStatus.findOne({ where: { name: 'confirmed' } })).id,
              (await ReservationStatus.findOne({ where: { name: 'in_progress' } })).id
            ]
          }
        }
      });

      if (activeReservations) {
        return res.status(400).json({ 
          message: 'Impossible de supprimer cette voiture car elle a des réservations en cours' 
        });
      }

      // Suppression de la voiture
      await car.destroy();

      res.status(200).json({
        message: 'Voiture supprimée avec succès'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Ajout d'une période d'indisponibilité pour une voiture
   */
  addCarAvailability: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { startDate, endDate, reason } = req.body;

      // Récupération de la voiture
      const car = await Car.findByPk(id);
      if (!car) {
        return res.status(404).json({ message: 'Voiture non trouvée' });
      }

      // Vérification si la période chevauche une réservation existante
      const overlappingReservation = await Reservation.findOne({
        where: {
          carId: id,
          statusId: {
            [Op.in]: [
              // IDs des statuts 'confirmed' et 'in_progress'
              (await ReservationStatus.findOne({ where: { name: 'confirmed' } })).id,
              (await ReservationStatus.findOne({ where: { name: 'in_progress' } })).id
            ]
          },
          [Op.or]: [
            {
              startDate: { [Op.lte]: new Date(endDate) },
              endDate: { [Op.gte]: new Date(startDate) }
            },
            {
              startDate: { [Op.between]: [new Date(startDate), new Date(endDate)] }
            },
            {
              endDate: { [Op.between]: [new Date(startDate), new Date(endDate)] }
            }
          ]
        }
      });

      if (overlappingReservation) {
        return res.status(400).json({ 
          message: 'Cette période chevauche une réservation existante' 
        });
      }

      // Création de la période d'indisponibilité
      const availability = await CarAvailability.create({
        carId: id,
        startDate,
        endDate,
        reason
      });

      res.status(201).json({
        message: 'Période d\'indisponibilité ajoutée avec succès',
        availability
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Suppression d'une période d'indisponibilité
   */
  removeCarAvailability: async (req, res, next) => {
    try {
      const { carId, availabilityId } = req.params;

      // Récupération de la période d'indisponibilité
      const availability = await CarAvailability.findOne({
        where: {
          id: availabilityId,
          carId
        }
      });

      if (!availability) {
        return res.status(404).json({ message: 'Période d\'indisponibilité non trouvée' });
      }

      // Suppression de la période d'indisponibilité
      await availability.destroy();

      res.status(200).json({
        message: 'Période d\'indisponibilité supprimée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = carController;
