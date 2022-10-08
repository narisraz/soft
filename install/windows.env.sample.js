'use strict'

module.exports = {
  NODE_ENV: 'production',

  PORT: '8080', // Remplacer par le port à utiliser
  DOMAIN: 'http://localhost:8080', // Sous la forme http(s)://(adresse ou ip)(:port)
  SESSION_SECRET: 'keyboard cat', // Chaîne de caractères aléatoire, à changer avant de déployer

  DATABASE: 'LYSASOFT',
  DATABASE_USER: 'sa',
  DATABASE_PASSWORD: 'sa',
  DATABASE_HOST: 'localhost',
}
