FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Exposer le port
EXPOSE 8080

# Commande de démarrage en mode développement
CMD ["npm", "run", "serve"]
