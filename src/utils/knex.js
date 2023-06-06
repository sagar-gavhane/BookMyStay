const knex = require('knex');

const dbConfig = require('../knexfile');

const dbConnector = knex(dbConfig.development);

module.exports = dbConnector;
