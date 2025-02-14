const dotenv = require('dotenv');
dotenv.config();

const store = {}; // Global shared store

module.exports = {
  baseUrl: process.env.BASE_URL,
  store,
};
