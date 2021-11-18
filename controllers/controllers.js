const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Movie = require('../models/movie');

const DataError = require('../errors/dataError');
const NotFoundError = require('../errors/notFoundError');
const ConflictError = require('../errors/conflictError');
const UnauthorizedError = require('../errors/unauthorizedError');
const AccessError = require('../errors/accessError');

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

module.exports.myInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => res.send(user))
    .catch(next);
};

module.exports.changeInfo = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'CastError' || (err.name === 'ValidationError')) {
        next(new DataError('Неправильные данные'));
      }
      return next(err);
    });
};

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch(next);
};

module.exports.postMovie = (req, res, next) => {
  req.body.owner = req.user;
  Movie.create(req.body)
    .then((movie) => res.send({ data: movie }))
    .catch((err) => {
      if (err.name === 'CastError' || (err.name === 'ValidationError')) {
        return next(new DataError('Неправильные данные'));
      }
      return next(err);
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.id)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Нет фильма с таким id');
      }
      if (movie.owner.equals(req.user._id)) {
        Movie.deleteOne(movie)
          .then(() => res.send({ data: movie }))
          .catch(next);
      } else { throw new AccessError('Нельзя удалять чужие карточки'); }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new DataError('Неправильные данные'));
      }
      return next(err);
    });
};
