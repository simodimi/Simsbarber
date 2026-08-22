const { z } = require("zod");

const askSchema = z.object({
  message: z.string().min(1),
});

module.exports = { askSchema };
