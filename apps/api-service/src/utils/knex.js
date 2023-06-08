const knex = require('knex');

const db_config = require('../knexfile');

const db_connector = knex(db_config.development);

module.exports = db_connector;
