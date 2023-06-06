const knex = require('../utils/knex');

const getUserByKeyValue = async (key, value) => {
  const [user] = await knex
    .select('*')
    .from('users')
    .where({ [key]: value })
    .limit(1);

  return user;
};

const getUserById = async (userId) => getUserByKeyValue('user_id', userId);

const getUserByEmail = async (email) => getUserByKeyValue('email', email);

module.exports = {
  getUserById,
  getUserByEmail,
};
