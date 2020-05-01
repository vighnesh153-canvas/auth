const md5 = require('md5');

module.exports = value => {
    return md5(value);
}
