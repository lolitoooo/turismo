#!/bin/bash

echo "Arrêt des conteneurs Drive Turismo..."
docker-compose down

echo ""
echo "Tous les conteneurs ont été arrêtés."
echo "Pour redémarrer les services, utilisez ./start.sh"
