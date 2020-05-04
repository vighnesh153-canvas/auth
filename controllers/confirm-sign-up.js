const fetch = require('node-fetch');

const md5HashGenerator = require('../helpers/md5-hash-generator');

const report = " Report the error to me so I can start a fix."

module.exports = async (req, res) => {
    const providedEmail = req.body.email;
    const providedVerificationToken = req.body.verificationToken;
    const appName = req.body.appName;

    if (!providedEmail) {
        res.status(400).json({ message: "EMAIL_NOT_PROVIDED" });
        return;
    }

    if (!appName) {
        res.status(400).json({ message: "APP_NAME_NOT_PROVIDED" });
        return;
    }

    if (!providedVerificationToken) {
        res.status(400).json({ message: "VERIFICATION_TOKEN_NOT_PROVIDED" });
        return;
    }

    const databasePrefix = process.env.MODE === "DEV" ? "test/" : "";
    const authParam = `?auth=${req.app.get('authToken')}`;
    const signUpConfirmationUrl = process.env.DB_URL + databasePrefix +
        appName + "/signUpConfirmation.json" + (req.app.get('authToken') ? authParam : "");

    let userInfo, hashedEmail;
    try {
        const response = await fetch(signUpConfirmationUrl);
        const data = await response.json();
        hashedEmail = md5HashGenerator(providedEmail);
        userInfo = data[hashedEmail];
        if (!userInfo) {
            res.status(400).json({
                message: "INVALID_CREDENTIALS",
                details: "This email has never been used to register an account." + report
            });
            return;
        }
    } catch (e) {
        res.status(500).json({
            message: "FAILED",
            details: "Failed to verify the code." + report
        });
        return;
    }

    if (providedVerificationToken !== userInfo.verificationToken) {
        res.status(401).json({
            message: "UNAUTHORIZED",
            details: "Verification code is not valid."
        });
        return;
    }

    const usersUrl = process.env.DB_URL + databasePrefix +
        appName + "/users.json" + (req.app.get('authToken') ? authParam : "");

    try {
        const users = await (await fetch(usersUrl)).json();
        if (users && users.hasOwnProperty(hashedEmail)) {
            res.status(409).json({ message: "EMAIL_ALREADY_EXISTS" });
            return;
        }
    } catch (e) {
        res.status(500).json({
            message: "FAILED",
            details: "Failed to check if user is already registered." + report
        });
        return;
    }

    const options = {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            [hashedEmail]: {
                email: providedEmail,
                password: userInfo.hashedPassword
            }
        })
    };

    try {
        const jsonResponse = await fetch(usersUrl, options);
        const responseObject = await jsonResponse.json();
        if (responseObject.error) throw new Error();
        res.status(201).json({message: "SUCCESS" });
    } catch (e) {
        res.status(500).json({
            message: "FAILED",
            details: "Something went wrong. Failed to register the account." + report
        });
    }
};
