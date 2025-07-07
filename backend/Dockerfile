# Utiliser une image Node.js standard au lieu d'Alpine pour éviter les problèmes de compatibilité
FROM node:18

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Nettoyer le cache npm pour éviter les problèmes de modules précompilés
RUN npm cache clean --force

# Supprimer node_modules s'il existe
RUN rm -rf node_modules

# Utiliser bcryptjs (implémentation pure JavaScript) au lieu de bcrypt pour éviter les problèmes de compatibilité
RUN npm uninstall bcrypt --save
RUN npm install bcryptjs --save

# Installer toutes les dépendances
RUN npm install

# Installer multer pour la gestion des uploads
RUN npm install multer uuid --save

# Copier le reste des fichiers du projet
COPY . .

# Créer le dossier pour les uploads
RUN mkdir -p /app/uploads/profile-images

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
