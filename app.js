var express = require('express');
var app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/', require('./controllers/index'));
app.use('/codesearch', require('./controllers/codesearch'));

app.listen(3000, function () {
  console.log('Listening on port 3000!');
});

module.exports = app;
