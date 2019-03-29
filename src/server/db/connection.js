const config = require('config');
const knexConfig = require('../../../knexfile.js')[config.get('environment')];
module.exports = require('knex')(knexConfig);
