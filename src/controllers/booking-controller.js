const knex = require('../utils/knex');
const handle_zod_error = require('../utils/handle-zod-error');
const { booking_schema } = require('../validation/zod-schema');

exports.get_bookings = async (req, res) => {
  const { user_id } = req.auth.user;

  const bookings = await knex.select('*').from('bookings').where({ user_id });

  res.send({ data: { bookings } });
};

exports.get_booking_id = async (req, res) => {
  const { user_id } = req.auth.user;
  const { booking_id } = req.params;

  const booking = await knex
    .select('*')
    .from('bookings')
    .where({ booking_id, user_id });

  res.send({ data: { booking } });
};

exports.post_booking = async (req, res) => {
  const { user_id } = req.auth.user;

  const { success, error } = booking_schema.safeParse(req.body);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handle_zod_error(error) },
    });
    return;
  }

  const [booking_id] = await knex
    .insert({
      user_id,
      room_id: req.body.room_id,
      check_in_date: new Date(req.body.check_in_date),
      check_out_date: new Date(req.body.check_out_date),
      total_guests: req.body.total_guests,
      total_price: req.body.total_price,
      is_cancelled: req.body.is_cancelled,
    })
    .into('bookings');

  const booking = await knex.select('*').from('bookings').where({ booking_id });

  res.send({ message: 'Booking retreived successfully.', data: { booking } });
};

exports.put_bookings = async (req, res) => {
  const { user_id } = req.auth.user;
  const { booking_id } = req.params;

  const { success, error } = booking_schema.partial().safeParse(req.body);

  if (!success) {
    res.status(400).send({
      message: 'Zod error occured',
      data: { fields: handle_zod_error(error) },
    });
    return;
  }

  const booking = await knex
    .select('*')
    .from('bookings')
    .where({ booking_id, user_id });

  if (!booking) {
    res.status(400).send({
      message: `No booking found with ${booking_id}`,
      data: null,
    });
    return;
  }

  const is_updated = await knex('bookings')
    .where({ booking_id, user_id })
    .update({
      room_id: req.body.room_id,
      check_in_date: new Date(req.body.check_in_date),
      check_out_date: new Date(req.body.check_out_date),
      total_guests: req.body.total_guests,
      total_price: req.body.total_price,
      is_cancelled: req.body.is_cancelled,
    });

  if (!is_updated) {
    res.status(400).send({
      message: `Failed to update booking found with ${booking_id}`,
      data: null,
    });
    return;
  }

  const updated_booking = await knex
    .select('*')
    .from('bookings')
    .where({ booking_id, user_id });

  res.status(200).send({
    message: 'Booking update successfully.',
    data: {
      booking: updated_booking,
    },
  });
};
