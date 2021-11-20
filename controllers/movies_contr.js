const Movie = require('../models/movie');

const DataError = require('../errors/dataError');
const NotFoundError = require('../errors/notFoundError');
const AccessError = require('../errors/accessError');

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
