const { z } = require("zod");
const createReviewSchema = z.object({
  note: z.number().min(1).max(5),
  commentaire: z.string().optional(),
  reservationId: z.number(),
});
module.exports = { createReviewSchema };
