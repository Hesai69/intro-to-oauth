const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/login', (req, res, next) => {
  res.redirect('https://github.com/login/oauth/authorize');
});

module.exports = router;
