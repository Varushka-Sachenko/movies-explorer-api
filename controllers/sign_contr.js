const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const DataError = require('../errors/dataError');
const ConflictError = require('../errors/conflictError');
const UnauthorizedError = require('../errors/unauthorizedError');

module.exports.login = (req, res, next) => {
  const {
    email, password,
  } = req.body;
  User.findUser(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      return res.send({ token });
    })
    .catch(() => next(new UnauthorizedError('Неправильная почта или пароль')));
};

module.exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      const {
        name, email,
      } = req.body;
      User.create({
        name, email, password: hash,
      })
        .then((user) => res.status(200).send({
          data: {
            name: user.name, about: user.about, avatar: user.avatar, email: user.email,
          },
        }))
        .catch((err) => {
          if (err.name === 'MongoServerError' && err.code === 11000) {
            next(new ConflictError('Пользователь с данным email уже существует'));
          } else if (err.name === 'CastError' || (err.name === 'ValidationError')) {
            next(new DataError('Неправильные данные'));
          }
          next(err);
        });
    })
    .catch(next);
};
