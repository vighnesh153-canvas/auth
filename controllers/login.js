const fetch = require('node-fetch');

const bcryptoVerifyHash = require('../helpers/bcrypto-verify-hash');
const md5HashGenerator = require('../helpers/md5-hash-generator');

const createJWT = require('../helpers/create-jwt');

const report = " Report the error to me so I can start a fix."

module.exports = async (req, res) => {
    const providedEmail = req.body.email;
    const providedPassword = req.body.password;
    const appName = req.body.appName;

    const hashedEmail = md5HashGenerator(providedEmail);

    const databasePrefix = process.env.MODE === "DEV" ? "test/" : "";
    const authParam = `?auth=${req.app.get('authToken')}`;
    const usersUrl = process.env.DB_URL + databasePrefix +
        appName + "/users.json" + (req.app.get('authToken') ? authParam : "");

    let user;
    try {
        const usersResponse = await fetch(usersUrl);
        const users = await usersResponse.json();

        if (!users || !users.hasOwnProperty(hashedEmail)) {
            res.status(404).json({ message: "EMAIL_NOT_FOUND" });
            return;
        }

        user = users[hashedEmail];
    } catch (e) {
        res.status(500).json({
            message: "FAILED",
            details: "Failed to check if the email address is registered." + report
        });
        return;
    }

    try {
        const isValid = await bcryptoVerifyHash(providedPassword, user.password);

        if (!isValid) {
            res.status(401).json({ message: "INVALID_PASSWORD" });
            return;
        }
    } catch (e) {
        res.status(500).json({
            message: "FAILED",
            details: "Failed to verify password." + report
        });
        return;
    }

    const jwt = createJWT({ email: providedEmail });

    const date = new Date();
    date.setDate(date.getDate() + 1);

    res.json({
        token: jwt,
        expiresAt: date
    });
};
