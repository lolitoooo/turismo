const express = require('express');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const carRoutes = require('./car.routes');
const reservationRoutes = require('./reservation.routes');
const categoryRoutes = require('./category.routes');
const subscriptionRoutes = require('./subscription.routes');
const userSubscriptionRoutes = require('./userSubscription.routes');
const addressRoutes = require('./address.routes');
const uploadRoutes = require('./upload.routes');
const imagesRoutes = require('./images.routes');
const adminRoutes = require('./admin.routes');
const paymentRoutes = require('./payment.routes');

const router = express.Router();

// Routes principales
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cars', carRoutes);
router.use('/reservations', reservationRoutes);
router.use('/categories', categoryRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/userSubscription', userSubscriptionRoutes);
router.use('/address', addressRoutes);
router.use('/upload', uploadRoutes);
router.use('/images', imagesRoutes);
router.use('/admin', adminRoutes);
router.use('/payment', paymentRoutes);

// Route de base pour vérifier l'API
router.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API DriveturismoCopy',
    version: '1.0.0',
    timestamp: new Date()
  });
});

module.exports = router;
