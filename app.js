require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const { DB_ADRESS } = process.env;
const { PORT = 3000 } = process.env;
const { errors } = require('celebrate');

const sign = require('./routes/sign_rout');
const users = require('./routes/users_rout');
const movies = require('./routes/movies_rout');

const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/notFoundError');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

mongoose.connect(DB_ADRESS, {
  useNewUrlParser: true,
});

app.use(express.json());// for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(requestLogger);

app.use('/', sign);

// авторизация
app.use(auth);

app.use('/', users);
app.use('/', movies);

app.use((req, res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});

app.use(errorLogger);

// ошибки
app.use(errors());

app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.listen(PORT);
