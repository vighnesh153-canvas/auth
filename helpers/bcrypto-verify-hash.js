const bcrypt = require('bcryptjs');

module.exports = (value, hashedValue) => {
    return bcrypt.compare(value, hashedValue);
};
