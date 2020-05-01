const express = require('express');
const router = express.Router();

const signUpController = require('./controllers/sign-up');
const confirmSignUpController = require('./controllers/confirm-sign-up');

router.post('/sign-up', signUpController);
router.post('/confirm-sign-up', confirmSignUpController);

module.exports = router;
