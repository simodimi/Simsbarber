const { z } = require("zod");

const loginAdminSchema = z.object({
  emailAdmin: z.string().email(),
  passwordAdmin: z.string().min(1),
});

const requestAccessSchema = z.object({
  nameAdmin: z.string().min(2),
  emailAdmin: z.string().email(),
  passwordAdmin: z
    .string()
    .min(8)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/\d/)
    .regex(/[!@#$%^&*(),.?":{}|<>]/),
});

const forgotPasswordAdminSchema = z.object({
  emailAdmin: z.string().email(),
});

const verifyCodeAdminSchema = z.object({
  emailAdmin: z.string().email(),
  code: z.string().length(5),
});

const resetPasswordAdminSchema = z.object({
  emailAdmin: z.string().email(),
  code: z.string().length(5),
  nouveauPassword: z
    .string()
    .min(8)
    .regex(/[a-z]/)
    .regex(/[A-Z]/)
    .regex(/\d/)
    .regex(/[!@#$%^&*(),.?":{}|<>]/),
});

module.exports = {
  loginAdminSchema,
  requestAccessSchema,
  forgotPasswordAdminSchema,
  verifyCodeAdminSchema,
  resetPasswordAdminSchema,
};
