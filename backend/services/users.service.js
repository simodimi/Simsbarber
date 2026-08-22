const { User } = require("../models");
const { ErreurMetier } = require("./auth.service");

async function getProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["passwordUser"] },
  });
  if (!user) throw new ErreurMetier("Utilisateur introuvable", 404);
  return user;
}

async function updateProfile(userId, data) {
  const user = await User.findByPk(userId);
  if (!user) throw new ErreurMetier("Utilisateur introuvable", 404);
  await user.update(data);
  return user;
}

async function updatePhoto(userId, photoUrl) {
  return updateProfile(userId, { photoUser: photoUrl });
}

async function updateChatBackground(userId, url) {
  return updateProfile(userId, { chatBackgroundUrl: url });
}

async function deleteAccount(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new ErreurMetier("Utilisateur introuvable", 404);
  await user.destroy();
}
async function getAllUsers(search = "") {
  const where = {};

  if (search && search.trim() !== "") {
    where[Op.or] = [
      { nameUser: { [Op.like]: `%${search}%` } },
      { mailUser: { [Op.like]: `%${search}%` } },
    ];
  }

  const users = await User.findAll({
    where,
    attributes: { exclude: ["passwordUser", "validationToken"] },
    order: [["createdAt", "DESC"]],
  });

  return users;
}
module.exports = {
  getProfile,
  updateProfile,
  updatePhoto,
  updateChatBackground,
  deleteAccount,
  getAllUsers,
};
