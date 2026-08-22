const { z } = require("zod");

const categorySchema = z.object({
  nom: z.string().min(2),
  image: z.string().optional(),
  description: z.string().min(1),
});

module.exports = { categorySchema };
