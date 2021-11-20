const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
// экспортируем его
module.exports = router;

const {
  myInfo, changeInfo,
} = require('../controllers/users_contr');

router.get('/users/me', myInfo);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().email().required().min(2),
  }),
}), changeInfo);
