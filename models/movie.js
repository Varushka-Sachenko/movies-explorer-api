const mongoose = require('mongoose');
const validator = require('validator');

const cardSchema = new mongoose.Schema({
  country: {
    type: String, // имя — это строка
    required: true,
  },

  director: {
    type: String, // имя — это строка
    required: true,
  },

  duration: {
    type: Number, // имя — это строка
    required: true,
  },

  year: {
    type: String, // имя — это строка
    required: true,
  },

  description: {
    type: String, // имя — это строка
    required: true,
  },

  image: {
    type: String,
    required: true,
    validate: {
      validator: (v) => validator.isURL(v),
    },
  },

  trailer: {
    type: String,
    required: true,
    validate: {
      validator: (v) => validator.isURL(v),
    },
  },

  thumbnail: {
    type: String,
    required: true,
    validate: {
      validator: (v) => validator.isURL(v),
    },
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },

  movieId: {
    type: Number,
    required: true,
  },

  nameRU: {
    type: String, // имя — это строка
    required: true,
  },

  nameEN: {
    type: String, // имя — это строка
    required: true,
  },

});

module.exports = mongoose.model('card', cardSchema);
