const bcrypt = require('bcryptjs');

module.exports = value => {
    const saltRounds = 12;
    return bcrypt.hash(value, saltRounds);
};
