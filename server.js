const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const request = require('request');
const dotenv = require('dotenv');
dotenv.config();

app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts/'}));
app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({urlextended: true}));
app.use(bodyParser.json());
app.use(session({
  secret: 'whatever',
  resave: false,
  saveUninitialize: true
}));
app.use(express.static(__dirname + '/public'));

app.get('/', require('./routes/index'));

  const redirect_uri = 'http://127.0.0.1:3000/authorize';
app.get('/login', (req, res, next) => {
  const redirect_url = 'https://github.com/login/oauth/authorize';
  const client_id = process.env.GITHUB_CLIENT_ID;
  const scope = 'user';
  const state = 'abc';
  const queryParams = `client_id=${client_id}&uri=${redirect_uri}&scope=${scope}&state=${state}`;
  res.redirect(redirect_url + '?' + queryParams);
});

app.get('/authorize', (req, res, next) => {
  const code = req.query.code;
  // server exchanges code with github
  const data = {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    code: code,
    redirect_uri: redirect_uri,
    state: req.query.state
  }
  const options = {
    method: 'POST',
    url: 'https://github.com/login/oauth/access_token',
    headers: {'Accept': 'application/json'},
    json: data
  }
  request(options, (err, response, body) => {
    if (!err && response.statusCode === 200) {
      // store token in session for later use
      req.session.access_token = body.access_token;
      res.redirect('/profile');
    }
  });
});

app.get('/profile', (req, res, next) => {
  const access_token = req.session.access_token;
  const url = 'https://api.github.com/user';
  const options = {
    method: 'GET',
    url: url,
    headers: {
      'Authorization': `token ${access_token}`,
      'User-Agent': 'Oauth Example'
    }
  }
  request(options, (err, response, body) => {
    //res.send(body);
    const user = JSON.parse(body);
    console.log(user);
    res.render('profile', {user: user});
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
