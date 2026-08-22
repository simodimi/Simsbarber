const { z } = require("zod");

const teamMemberSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().optional(),
  photo: z.string().optional(),
  titre: z.string().min(1),
  description: z.string().min(1),
  experience: z.string().min(1),
  categories: z.array(z.string()),
  citation: z.string().min(1),
});

module.exports = { teamMemberSchema };
