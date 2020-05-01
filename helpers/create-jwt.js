const jwt = require('jsonwebtoken');

module.exports = dataObject => jwt.sign(
    dataObject,
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
);
