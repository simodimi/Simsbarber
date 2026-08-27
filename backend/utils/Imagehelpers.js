function getImageUrl(file) {
  return file ? `/uploads/${file.filename}` : undefined;
}

function getImageUrls(files) {
  if (!files || files.length === 0) return [];
  return files.map((file) => `/uploads/${file.filename}`);
}

module.exports = { getImageUrl, getImageUrls };
