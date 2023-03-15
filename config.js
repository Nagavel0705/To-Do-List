const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    username: process.env.ATLAS_USERNAME,
    password: process.env.ATLAS_PASSWORD,
    port: process.env.PORT
  };