const usersModel = require('../models/users');

exports.get_user_by_id = async (req, res) => {
  const user = await usersModel.get_user_by_id(req.params.user_id);
  delete user.password;

  res
    .status(200)
    .send({ message: 'User retreived successfully.', data: { user } });
};
