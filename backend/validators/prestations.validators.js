const { z } = require("zod");

const prestationSchema = z.object({
  categoryId: z.coerce.number(),

  nom: z.string().min(2),

  descriptionCourte: z.string().min(1),

  descriptionComplete: z.string().min(1),

  duree: z.coerce.number().positive(),

  prix: z.coerce.number().positive(),

  ancienPrix: z.coerce.number().min(0).optional(),

  produitsUtilises: z.string().optional(),
});

module.exports = { prestationSchema };
