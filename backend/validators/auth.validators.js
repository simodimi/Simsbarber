const { z } = require("zod"); //zod bibliothèque de validation des données

const registerSchema = z.object({
  nameUser: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  mailUser: z.string().email("Email invalide"),
  passwordUser: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/\d/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Le mot de passe doit contenir au moins un caractère spécial",
    ),
});

const loginSchema = z.object({
  mailUser: z.string().email("Email invalide"),
  //minimun 1 caractère
  passwordUser: z.string().min(1, "Mot de passe requis"),
});

const forgotPasswordSchema = z.object({
  mailUser: z.string().email("Email invalide"),
});

const verifyCodeSchema = z.object({
  mailUser: z.string().email("Email invalide"),
  code: z.string().length(5, "Le code doit contenir 5 chiffres"),
});

const resetPasswordSchema = z.object({
  mailUser: z.string().email("Email invalide"),
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
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
};
