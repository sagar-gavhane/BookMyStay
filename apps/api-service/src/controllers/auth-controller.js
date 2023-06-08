const { z } = require('zod');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const knex = require('../utils/knex');
const usersModel = require('../models/users');
const handle_zod_error = require('../utils/handle-zod-error');
const { user_schema } = require('../validation/zod-schema');

const loginSchema = user_schema.pick({ email: true, password: true });

exports.login = async (req, res) => {
  const { success, error } = loginSchema.safeParse(req.body);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handle_zod_error(error) },
    });
    return;
  }

  const user = await usersModel.get_user_by_email(req.body.email);

  if (!user) {
    res.status(400).send({
      message: 'User account not exist.',
      data: null,
    });
    return;
  }

  const match = await bcrypt.compare(req.body.password, user.password);
  delete user.password;

  if (!match) {
    res.status(400).send({
      message: 'User email or password match not found.',
      data: null,
    });
    return;
  }

  const token = await jwt.sign(
    { user: { user_id: user.user_id, email: user.email } },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '7d' },
  );

  res.send({
    message: 'User successfully logged in.',
    data: {
      user,
      auth: { token },
    },
  });
};

const signUpSchema = user_schema.pick({
  email: true,
  password: true,
  name: true,
  contact_number: true,
  address: true,
});

exports.signup = async (req, res) => {
  const { success, error } = signUpSchema.safeParse(req.body);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: {
        fields: handle_zod_error(error),
      },
    });
    return;
  }

  // check username exists in db or not
  const exists = await usersModel.get_user_by_email(req.body.email);

  if (exists) {
    res
      .status(400)
      .send({ message: 'User already exist. Pleae login.', data: null });
    return;
  }

  const encryptedPassword = await bcrypt.hash(req.body.password, 10);

  const [userId] = await knex
    .insert({
      email: req.body.email,
      password: encryptedPassword,
      name: req.body.name,
      contact_number: req.body.contact_number,
      address: req.body.address,
    })
    .into('users');

  const user = await usersModel.get_user_by_id(userId);
  delete user.password;

  const token = await jwt.sign(
    { user: { user_id: user.user_id, email: user.email } },
    process.env.JWT_SECRET_KEY,
    { expiresIn: '7d' },
  );

  res.status(201).send({
    message: 'User created successfully.',
    data: {
      user,
      auth: { token },
    },
  });
};

const resetPasswordSchema = user_schema
  .pick({ email: true, password: true })
  .extend({ newPassword: z.string().min(6) })
  .refine((val) => val.password !== val.newPassword, {
    message: "Passwords should't match",
    path: ['newPassword'],
  });

exports.reset_password = async (req, res) => {
  const { success, error } = resetPasswordSchema.safeParse(req.body);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handle_zod_error(error) },
    });
    return;
  }

  const user = await usersModel.get_user_by_email(req.body.email);

  if (!user) {
    res.status(400).send({
      message: 'User account not exist.',
      data: null,
    });
    return;
  }

  const match = await bcrypt.compare(req.body.password, user.password);

  if (!match) {
    res.status(400).send({
      message: 'User email or password match not found.',
      data: null,
    });
    return;
  }

  const encryptedNewPassword = await bcrypt.hash(req.body.newPassword, 10);

  const isUpdated = await knex('users')
    .update({ password: encryptedNewPassword })
    .where({ email: req.body.email });

  if (!isUpdated) {
    res.status(500).send({
      message: 'failed to update password',
      body: null,
    });
    return;
  }

  res.send({
    message: 'Password updated successfully. Please login.',
    data: null,
  });
};
