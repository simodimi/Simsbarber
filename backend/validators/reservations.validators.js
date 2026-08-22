const { z } = require("zod");

const createReservationSchema = z.object({
  start: z.string(),
  prestationIds: z.array(z.coerce.number()).min(1),
  description: z.string().max(300).optional(),
});
const createAdminReservationSchema = createReservationSchema.extend({
  userId: z.coerce.number(),
});

module.exports = { createReservationSchema, createAdminReservationSchema };
