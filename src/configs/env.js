const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

module.exports = {
  bucket_url: process.env.BUCKET_URL,
  bucket_key : process.env.BUCKET_KEY,
};