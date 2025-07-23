import apiClient from './api.service';
import { ref } from 'vue';

// Mapping des images locales pour les voitures
// Cette fonction associe les images locales aux voitures en fonction de leur marque et modèle
export const getCarImage = (car) => {
  try {
    // Cas spécial pour la Lamborghini Aventador SVJ
    if (car.brand === 'Lamborghini' && car.model === 'Aventador SVJ') {
      return require('@/assets/images/lamborghini_aventador_svj_home.webp');
    }
    
    // Formater le nom de l'image selon la convention du projet
    // Par exemple: "porsche_macan_4S_home.webp"
    const brand = car.brand.toLowerCase();
    const model = car.model.replace(/\s+/g, '_').toLowerCase();
    
    // Vérifier si la voiture a déjà des images dans son objet JSON
    if (car.images && Array.isArray(car.images) && car.images.length > 0) {
      // Utiliser la première image du tableau JSON
      const imageName = car.images[0];
      return require(`@/assets/images/${imageName}`);
    } else {
      // Sinon, utiliser la convention de nommage
      const imageName = `${brand}_${model}_home.webp`;
      return require(`@/assets/images/${imageName}`);
    }
  } catch (error) {
    // Si l'image n'existe pas, utiliser une image par défaut
    console.warn(`Image non trouvée pour ${car.brand} ${car.model}`, error);
    return require('@/assets/images/car_placeholder.jpg');
  }
};

// Cache pour stocker les résultats des requêtes API
const carsCache = ref(null);
const carTypesCache = ref(null);
const carBrandsCache = ref(null);
const carEnginesCache = ref(null);

/**
 * Service pour gérer les données des voitures via l'API
 */

// Fonction pour obtenir toutes les voitures disponibles
export async function getAllCars() {
  try {
    if (carsCache.value) {
      return carsCache.value;
    }
    
    const response = await apiClient.get('/api/cars/available');
    const cars = response.data.cars;
    
    // Ajouter les images locales aux voitures
    const carsWithImages = cars.map(car => {
      // Déterminer le type de voiture en fonction de la catégorie
      let type = 'Berline';
      
      if (car.category) {
        // Mapper les catégories aux types de véhicules
        switch (car.category.id) {
          case 1:
            type = 'SUV Compact';
            break;
          case 2:
            type = 'SUV';
            break;
          case 3:
            type = 'SUV Premium';
            break;
          case 4:
            type = 'Luxe';
            break;
          case 5:
            type = 'Sport';
            break;
          case 6:
            type = 'Supercar';
            break;
          default:
            type = car.category.name || 'Non catégorisé';
        }
      }
      
      return {
        ...car,
        image: getCarImage(car),
        heroImage: getCarImage(car),
        available: car.isAvailable,
        features: car.features || [],
        type: type,
        engine: car.fuelType || 'Essence' // Utiliser fuelType comme engine pour les filtres
      };
    });
    
    carsCache.value = carsWithImages;
    return carsWithImages;
  } catch (error) {
    console.error('Erreur lors de la récupération des voitures:', error);
    return [];
  }
}

// Fonction pour obtenir une voiture par son ID
export async function getCarById(id) {
  try {
    const response = await apiClient.get(`/api/cars/${id}`);
    const car = response.data.car;
    console.log('Car data from API:', car); // Pour déboguer
    
    // Traiter les fonctionnalités si elles sont au format JSON string
    let features = [];
    if (car.features) {
      if (typeof car.features === 'string') {
        try {
          features = Object.entries(JSON.parse(car.features)).map(([key, value]) => {
            return value === true ? key.replace(/_/g, ' ') : null;
          }).filter(item => item !== null);
        } catch (e) {
          console.error('Erreur lors du parsing des fonctionnalités:', e);
        }
      } else if (typeof car.features === 'object') {
        features = Object.entries(car.features).map(([key, value]) => {
          return value === true ? key.replace(/_/g, ' ') : null;
        }).filter(item => item !== null);
      }
    }
    
    // Ajouter les images locales à la voiture
    return {
      ...car,
      id: car.id,
      name: `${car.brand} ${car.model}`,
      brand: car.brand,
      model: car.model,
      year: car.year,
      color: car.color,
      mileage: car.mileage,
      transmission: car.transmission,
      fuel: car.fuelType, // Mapper fuelType à fuel pour la compatibilité
      type: car.category ? car.category.name : 'Non catégorisé',
      image: getCarImage(car),
      heroImage: getCarImage(car),
      price: car.dailyPrice,
      available: car.isAvailable,
      features: features,
      description: `Le ${car.brand} ${car.model} est un véhicule exceptionnel offrant une expérience de conduite unique. Avec son moteur ${car.fuelType} et sa transmission ${car.transmission}, ce véhicule de ${car.year} combine performance et élégance.`
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération de la voiture ${id}:`, error);
    return null;
  }
}

// Fonction pour obtenir les voitures filtrées par catégorie
export async function getCarsByCategory(categoryId) {
  try {
    if (categoryId === 'all') {
      return await getAllCars();
    }
    
    const response = await apiClient.get(`/api/cars/search?categoryId=${categoryId}`);
    const cars = response.data.cars;
    
    // Ajouter les images locales aux voitures
    return cars.map(car => ({
      ...car,
      image: getCarImage(car),
      heroImage: getCarImage(car),
      price: car.dailyPrice,
      available: car.isAvailable,
      features: car.features || []
    }));
  } catch (error) {
    console.error(`Erreur lors de la récupération des voitures par catégorie ${categoryId}:`, error);
    return [];
  }
}

// Fonction pour obtenir les voitures filtrées par type
export async function getCarsByType(type) {
  try {
    const allCars = await getAllCars();
    
    if (type === 'all') {
      return allCars;
    }
    
    return allCars.filter(car => car.type === type);
  } catch (error) {
    console.error(`Erreur lors de la récupération des voitures par type ${type}:`, error);
    return [];
  }
}

// Fonction pour obtenir les voitures filtrées par marque
export async function getCarsByBrand(brand) {
  try {
    const allCars = await getAllCars();
    
    if (brand === 'all') {
      return allCars;
    }
    
    return allCars.filter(car => car.brand === brand);
  } catch (error) {
    console.error(`Erreur lors de la récupération des voitures par marque ${brand}:`, error);
    return [];
  }
}

// Fonction pour obtenir les voitures filtrées par motorisation
export async function getCarsByEngine(engine) {
  try {
    const allCars = await getAllCars();
    
    if (engine === 'all') {
      return allCars;
    }
    
    return allCars.filter(car => car.fuelType === engine);
  } catch (error) {
    console.error(`Erreur lors de la récupération des voitures par motorisation ${engine}:`, error);
    return [];
  }
}

// Fonction pour obtenir les types uniques
export async function getUniqueTypes() {
  try {
    if (carTypesCache.value) {
      return carTypesCache.value;
    }
    
    const allCars = await getAllCars();
    const types = [...new Set(allCars.map(car => car.type))];
    carTypesCache.value = types;
    return types;
  } catch (error) {
    console.error('Erreur lors de la récupération des types de voitures:', error);
    return [];
  }
}

// Fonction pour obtenir les marques uniques
export async function getUniqueBrands() {
  try {
    if (carBrandsCache.value) {
      return carBrandsCache.value;
    }
    
    const allCars = await getAllCars();
    const brands = [...new Set(allCars.map(car => car.brand))];
    carBrandsCache.value = brands;
    return brands;
  } catch (error) {
    console.error('Erreur lors de la récupération des marques de voitures:', error);
    return [];
  }
}

// Fonction pour obtenir les motorisations uniques
export async function getUniqueEngines() {
  try {
    if (carEnginesCache.value) {
      return carEnginesCache.value;
    }
    
    const allCars = await getAllCars();
    const engines = [...new Set(allCars.map(car => car.fuelType))];
    carEnginesCache.value = engines;
    return engines;
  } catch (error) {
    console.error('Erreur lors de la récupération des motorisations de voitures:', error);
    return [];
  }
}

// Fonction pour rechercher des voitures disponibles pour une période donnée
export async function searchAvailableCars(startDate, endDate, filters = {}) {
  try {
    let queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
    
    const response = await apiClient.get(`/api/cars/search?${queryParams.toString()}`);
    const cars = response.data.cars;
    
    // Ajouter les images locales aux voitures
    return cars.map(car => ({
      ...car,
      image: getCarImage(car),
      heroImage: getCarImage(car),
      price: car.dailyPrice,
      available: car.isAvailable,
      features: car.features || []
    }));
  } catch (error) {
    console.error('Erreur lors de la recherche de voitures disponibles:', error);
    return [];
  }
}
