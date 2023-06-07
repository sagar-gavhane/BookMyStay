const { z } = require('zod');

exports.user_schema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  contact_number: z.string().length(10),
  address: z.string(),
});

exports.booking_schema = z.object({
  room_id: z.number(),
  check_in_date: z.coerce.date(),
  check_out_date: z.coerce.date(),
  total_guests: z.number(),
  total_price: z.number(),
  is_cancelled: z.boolean(),
});
