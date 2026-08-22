const { z } = require("zod");

const updateProfileSchema = z.object({
  nameUser: z.string().min(2).optional(),
  photoUser: z.string().optional(),
});

const updateChatBackgroundSchema = z.object({
  chatBackgroundUrl: z.string(),
});

module.exports = { updateProfileSchema, updateChatBackgroundSchema };
