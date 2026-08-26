const { z } = require("zod");

const createReservationSchema = z.object({
  start: z.string(),
  prestationIds: z.array(z.coerce.number()).min(1),
  description: z.string().max(300).optional(),
  color: z.string().optional(),
});
const createAdminReservationSchema = createReservationSchema.extend({
  userId: z.coerce.number(),
  color: z.string().optional(),
});

module.exports = { createReservationSchema, createAdminReservationSchema };
