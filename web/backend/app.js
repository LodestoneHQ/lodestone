var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var statusRouter = require('./routes/status');

var app = express();

app.set('json spaces', 2);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/web',express.static(path.join(__dirname, 'public')));
app.use('/web', indexRouter);

app.use('/api/v1/users', usersRouter);
app.use('/api/v1/status', statusRouter);

module.exports = app;
