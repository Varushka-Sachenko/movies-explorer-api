const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

// экспортируем его
module.exports = router;

const {
  login, createUser,
} = require('../controllers/controllers');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required().min(2),
    password: Joi.string().required().min(2),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().email().required().min(2),
    password: Joi.string().required().min(2),
  }),
}), createUser);
