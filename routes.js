const express = require('express');
const router = express.Router();

const homePageController = require('./controllers/homepage');
const statusController = require('./controllers/status');

const signUpController = require('./controllers/sign-up');
const confirmSignUpController = require('./controllers/confirm-sign-up');
const loginController = require('./controllers/login');
const verifyTokenController = require('./controllers/verify-token');

router.get('/', homePageController);
router.get('/status', statusController);

router.post('/sign-up', signUpController);
router.post('/confirm-sign-up', confirmSignUpController);
router.post('/login', loginController);
router.post('/verify-token', verifyTokenController);

module.exports = router;
