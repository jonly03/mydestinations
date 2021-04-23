const axios = require("axios");

if (!process.env.PORT) {
  require("../Secrets");
}

function getUID() {
  // generate a six digit random numbers
  let uid = "";
  for (let i = 0; i < 6; i++) {
    const rand = Math.floor(Math.random() * 10);
    uid += rand;
  }

  return uid;
}

async function getPhotoFromUnsplash(name) {
  const URL = `https://api.unsplash.com/search/photos?client_id=${process.env.UNSPLASH_API_KEY}&query=${name}`;

  const res = await axios.get(URL);

  const photos = res.data.results;
  const fallbackPhoto =
    "https://cavchronicle.org/wp-content/uploads/2018/03/top-travel-destination-for-visas-900x504.jpg";

  if (photos.length === 0) return fallbackPhoto;

  const photosLen = photos.length;
  const randIdx = Math.floor(Math.random() * photosLen);

  return photos[randIdx].urls.small;
}

module.exports = {
  getUID,
  getPhoto: getPhotoFromUnsplash,
};
