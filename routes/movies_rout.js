const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
// экспортируем его
module.exports = router;

const {
  postMovie, getMovies, deleteMovie,
} = require('../controllers/movies_contr');

const validateURL = (value) => {
  if (!validator.isURL(value, { require_protocol: true })) {
    throw new Error('Неправильный формат ссылки');
  }
  return value;
};

router.get('/movies', getMovies);

router.post('/movies', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    trailer: Joi.string().custom(validateURL).required().min(2),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
    thumbnail: Joi.string().custom(validateURL).required().min(2),
    movieId: Joi.number().required(),
    image: Joi.string().custom(validateURL).required().min(2),
  }),
}), postMovie);

router.delete('/movies/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex(),
  }),
}), deleteMovie);
