const knex = require('../utils/knex');

const get_user_by_key_value = async (key, value) => {
  const [user] = await knex
    .select('*')
    .from('users')
    .where({ [key]: value })
    .limit(1);

  return user;
};

const get_user_by_id = (userId) => get_user_by_key_value('user_id', userId);

const get_user_by_email = (email) => get_user_by_key_value('email', email);

module.exports = {
  get_user_by_id,
  get_user_by_email,
};
