const jwt = require('jsonwebtoken');

module.exports = (token, email) => {
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        return false;
    }

    if (!decodedToken) {
        return false;
    }

    return decodedToken.email === email;
};
