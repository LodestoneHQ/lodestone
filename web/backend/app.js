var express = require('express');
var cors = require('cors')
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var statusRouter = require('./routes/status');
var elasticRouter = require('./routes/elastic');

var app = express();

app.set('json spaces', 2);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())
app.use('/web',express.static(path.join(__dirname, 'public')));
app.use('/web', indexRouter);


app.use('/api/v1/users', usersRouter);
app.use('/api/v1/status', statusRouter);
app.use('/api/v1/elastic', elasticRouter);
module.exports = app;
