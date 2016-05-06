var express = require('express');
var cookieParser = require('cookie-parser')
var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.static('node_modules/bootstrap/dist'));

app.use(cookieParser())

app.use('/', require('./controllers/index'));
app.use('/codesearch', require('./controllers/codesearch'));
app.get('/id/:input?', require('./controllers/id'));

app.listen(3000, function () {
  console.log('Listening on port 3000!');
});

module.exports = app;
