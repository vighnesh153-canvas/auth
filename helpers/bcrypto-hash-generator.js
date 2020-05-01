const bcrypt = require('bcryptjs');

module.exports = value => {
    const saltValue = 5;
    return bcrypt.hash(value, saltValue);
};
