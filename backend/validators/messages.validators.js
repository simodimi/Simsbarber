const { z } = require("zod");

const sendMessageSchema = z.object({
  content: z.string().max(10000).optional(),
});

module.exports = { sendMessageSchema };
