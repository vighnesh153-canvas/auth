const verifyJWT = require("../helpers/verify-jwt");

module.exports = (req, res) => {
    const providedEmail = req.body.email;
    const providedToken = req.body.token;

    const isValid =  verifyJWT(providedToken, providedEmail);

    res.json({ isValid: isValid });
};
