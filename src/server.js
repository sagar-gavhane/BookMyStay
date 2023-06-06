require('dotenv').config({ path: './src/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const z = require('zod');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const handleZodError = require('./utils/handleZodError');
const knex = require('./utils/knex');
const verifyToken = require('./middlewares/verifyToken');
const usersModel = require('./models/users');
const { is_object_empty } = require('./utils/object');

const app = express();
const port = 3000;
const jwtSecretKey = '~&VV^;WhENo^"^Q';

app.use(helmet());
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (_, res) => {
  res.send('..');
});
app.post('/api/auth/signup', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(3),
    contact_number: z.string().length(10),
    address: z.string().min(10),
  });

  const { success, error } = schema.safeParse(req.body);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: {
        fields: handleZodError(error),
      },
    });
    return;
  }

  // check username exists in db or not
  const exists = await usersModel.getUserByEmail(req.body.email);

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

  const user = await usersModel.getUserById(userId);
  delete user.password;

  const token = await jwt.sign(
    { user: { user_id: user.user_id, email: user.email } },
    jwtSecretKey,
    { expiresIn: '7d' },
  );

  res.status(201).send({
    message: 'User created successfully.',
    data: {
      user,
      auth: { token },
    },
  });
});
app.post('/api/auth/login', async (req, res) => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const { success, error } = schema.safeParse(req.body);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handleZodError(error) },
    });
    return;
  }

  const user = await usersModel.getUserByEmail(req.body.email);

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
    jwtSecretKey,
    { expiresIn: '7d' },
  );

  res.send({
    message: 'User successfully logged in.',
    data: {
      user,
      auth: { token },
    },
  });
});
app.post('/api/auth/reset_password', async (req, res) => {
  const schema = z
    .object({
      email: z.string().email(),
      password: z.string().min(6),
      newPassword: z.string().min(6),
    })
    .refine((val) => val.password !== val.newPassword, {
      message: "Passwords should't match",
      path: ['newPassword'],
    });

  const { success, error } = schema.safeParse(req.body);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handleZodError(error) },
    });
    return;
  }

  const user = await usersModel.getUserByEmail(req.body.email);

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
});
app.get('/api/users', verifyToken, async (req, res) => {
  const user = await usersModel.getUserById(req.auth.user.user_id);
  delete user.password;

  res
    .status(200)
    .send({ message: 'User retreived successfully.', data: { user } });
});
app.get('/api/rooms', verifyToken, async (req, res) => {
  const rooms = await knex.select('*').from('rooms');
  res.status(200).send({
    message: 'Rooms retrieved succuessfully.',
    data: {
      rooms,
    },
  });
});
app.post('/api/rooms', verifyToken, async (req, res) => {
  const schema = z.object({
    room_number: z.string(),
    room_type: z.string(),
    description: z.string().optional(),
    amenities: z.string().optional(),
    price_per_night: z.number().min(100).max(10000),
    is_available: z.boolean().optional(),
  });

  const { success, error } = await schema.safeParse(req.body);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handleZodError(error) },
    });
    return;
  }

  try {
    const [room_id] = await knex
      .insert({
        room_number: req.body.room_number,
        room_type: req.body.room_type,
        description: req.body.description,
        amenities: req.body.amenities,
        price_per_night: req.body.price_per_night,
        is_available: req.body.is_available || false,
      })
      .into('rooms');

    const room = await knex.select('*').from('rooms').where({ room_id });

    res.status(200).send({
      message: 'Room created successfully.',
      data: {
        room,
      },
    });
  } catch (_error) {
    if (_error.code === 'ER_DUP_ENTRY') {
      res.status(500).send({
        message: 'Duplicate entry in rooms. Please check room_number',
        data: null,
      });
      return;
    }

    res.status(500).send({
      message: _error.message,
      data: null,
    });
  }
});
app.get('/api/rooms/:id', verifyToken, async (req, res) => {
  const room_id = +req.params.id;
  const { success, error } = await z.number().safeParse(+room_id);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handleZodError(error) },
    });
    return;
  }

  const [room] = await knex.select('*').from('rooms').where({ room_id });

  if (!room) {
    res.status(200).send({
      message: `No room found with ${room_id}`,
      data: null,
    });
    return;
  }

  res.status(200).send({
    message: 'Room retrieved successfully.',
    data: {
      room,
    },
  });
});
app.put('/api/rooms/:id', async (req, res) => {
  const room_id = +req.params.id;
  const check_room_id = z.number().safeParse(+room_id);

  if (!check_room_id.success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handleZodError(check_room_id.error) },
    });
    return;
  }

  const [roomExist] = await knex.select('*').from('rooms').where({ room_id });

  if (!roomExist) {
    res.status(200).send({
      message: `No room found with ${room_id}`,
      data: null,
    });
  }

  const schema = z
    .object({
      room_number: z.string().optional(),
      room_type: z.string().optional(),
      description: z.string().optional(),
      amenities: z.string().optional(),
      price_per_night: z.number().min(100).max(10000).optional(),
      is_available: z.boolean().optional(),
    })
    .refine((val) => !is_object_empty(val), {
      message: 'body is required',
      path: ['room_number'],
    });

  const { success, error } = await schema.safeParse(req.body);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handleZodError(error) },
    });
    return;
  }

  try {
    await knex('rooms')
      .update({
        room_number: req.body.room_number,
        room_type: req.body.room_type,
        description: req.body.description,
        amenities: req.body.amenities,
        price_per_night: req.body.price_per_night,
        is_available: req.body.is_available,
      })
      .where({ room_id });

    const room = await knex.select('*').from('rooms').where({ room_id });

    res.status(200).send({
      message: 'Room updated successfully.',
      data: { room },
    });
  } catch (_error) {
    if (_error.code === 'ER_DUP_ENTRY') {
      res.status(500).send({
        message: 'Duplicate entry in rooms. Please check room_number',
        data: null,
      });
    }

    res.status(500).send({
      message: _error.message,
      data: null,
    });
  }
});

process.on('uncaughtException', (error) => {
  // eslint-disable-next-line no-console
  console.log('Uncaught exception occured. Stopping App because of', error);
  process.exit(0);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App is listening on port ${port}`);
});
