var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('./logger');
const cors = require(`cors`);
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const userApi = require(`./routes/user_api`);
const commentApi = require(`./routes/comment_api`);




/**SQL Model**/
const User = require(`./database/models/User`);
const Comment = require(`./database/models/Comment`);

User.sync().then(() => {
    logger.info(`User Model Initialized`);
}).catch(err => {
    logger.error(`Error Occurred ${err}`);
});

Comment.sync().then(() => {
    logger.info(`Comment Model Initialized`);
}).catch(err => {
    logger.error(`Error Occurred ${err}`);
});

var app = express();

// Remove in Production
app.use(cors());

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(`/api/user`, userApi);
app.use(`/api/comment`, commentApi);

module.exports = app;
