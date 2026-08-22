const slugify = require("slugify");
const { Prestation } = require("../models");

async function genererSlugUnique(nom) {
  const base = slugify(nom, { lower: true, strict: true });
  let slug = base;
  let i = 1;
  while (await Prestation.findOne({ where: { slug } })) {
    slug = `${base}-${i}`;
    i++;
  }
  return slug;
}

module.exports = { genererSlugUnique };
