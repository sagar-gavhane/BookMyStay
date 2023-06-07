const { z } = require('zod');

const knex = require('../utils/knex');
const handle_zod_error = require('../utils/handle-zod-error');
const { is_object_empty } = require('../utils/object');

exports.get_rooms = async (_req, res) => {
  const rooms = await knex.select('*').from('rooms');

  res.status(200).send({
    message: 'Rooms retrieved succuessfully.',
    data: {
      rooms,
    },
  });
};

exports.post_rooms = async (req, res) => {
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
      data: { fields: handle_zod_error(error) },
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
};

exports.get_room_by_id = async (req, res) => {
  const room_id = +req.params.id;
  const { success, error } = await z.number().safeParse(+room_id);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handle_zod_error(error) },
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
};

exports.update_room_by_id = async (req, res) => {
  const room_id = +req.params.id;
  const check_room_id = z.number().safeParse(+room_id);

  if (!check_room_id.success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handle_zod_error(check_room_id.error) },
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
      data: { fields: handle_zod_error(error) },
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
};
