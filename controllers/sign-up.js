const crypto = require('crypto');
const fetch = require('node-fetch');

const bcryptoHashGenerator = require('../helpers/bcrypto-hash-generator');
const md5HashGenerator = require('../helpers/md5-hash-generator');

const report = " Report the error to me so I can start a fix."

const sendConfirmationEmail = (res, body) => {
    const emailUrl = process.env.EMAIL_URL + 'send';
    const options = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }

    fetch(emailUrl, options)
        .then(res => res.json())
        .then(response => {
            if (response.message === "SUCCESS") {
                res.status(201).json({message: "VERIFICATION_CODE_SENT" });
                return;
            }
            res.status(500).json({
                message: "FAILED",
                details: "Failed to send verification to provided email address. " +
                    "Report this to me along with the email address used to create an account."
            });
        })
        .catch(e => {
            res.status(500).json({
                message: "FAILED",
                details: "Failed to send verification to provided email address. " +
                    "Report this to me along with the email address used to create an account."
            });
        });
}

const saveConfirmationInfo = (res, URL, OPTIONS, emailServiceBody) => {
    fetch(URL, OPTIONS)
        .then(jsonResponse => jsonResponse.json())
        .then(response => {
            if (response.error) {
                res.status(500).json({
                    message: "FAILED",
                    details: "Failed to generate verification token. " +
                        "Report this to me along with the email address used to create an account."
                });
                return;
            }

            sendConfirmationEmail(res, emailServiceBody);
        })
        .catch(e => {
            res.status(500).json({
                message: "FAILED",
                details: "Failed to generate verification token. " +
                    "Report this to me along with the email address used to create an account."
            })
        });
}

module.exports = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const appName = req.body.appName;

    if (!email) {
        res.status(400).json({
            message: "EMAIL_NOT_VALID", details: "Please enter a valid email address."
        });
        return;
    }

    if (!appName) {
        res.status(400).json({
            message: "APP_NAME_NOT_VALID", details: "Unable to identify application."
        });
        return;
    }

    if (confirmPassword !== password) {
        res.status(400).json({
            message: "PASSWORDS_DO_NOT_MATCH", details: "Both passwords should be the same."
        });
        return;
    }

    crypto.randomBytes(3, async (err, buffer) => {
        const verificationToken = buffer.toString('hex');

        if (err) {
            res.status(500).json({
                message: "VERIFICATION_TOKEN_GENERATION_FAILED",
                details: "Failed to generate a verification token. " +
                    "Please try again later." + report
            });
            return;
        }

        let hashedPassword, hashedEmail;
        try {
            hashedPassword = await bcryptoHashGenerator(password);
            hashedEmail = md5HashGenerator(email);
        } catch (e) {
            res.status(500).json({
                message: "HASHING_FAILED",
                details: "Failed to hash email/password. " +
                    "Please try again later." + report
            });
            return;
        }

        const databasePrefix = process.env.MODE === "DEV" ? "test/" : "";
        const authParam = `?auth=${req.app.get('authToken')}`;
        const usersUrl = process.env.DB_URL + databasePrefix +
            appName + "/users.json" + (req.app.get('authToken') ? authParam : "");

        try {
            const responseJson = await fetch(usersUrl);
            const users = await responseJson.json();
            if (users && users.hasOwnProperty(hashedEmail)) {
                res.status(409).json({
                    message: "EMAIL_ALREADY_EXISTS",
                    details: "The email address already exists. " +
                        "Try registering with a different email."
                });
                return;
            }
        } catch (e) {
            res.status(500).json({
                message: "FAILED",
                details: "Failed to check if email already exists in the database. " +
                    "Please try again later." + report
            });
            return;
        }

        const signUpConfirmationUrl = process.env.DB_URL + databasePrefix +
            appName + "/signUpConfirmation.json" + (req.app.get('authToken') ? authParam : "");

        const options = {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                [hashedEmail] : {
                    email,
                    hashedPassword,
                    verificationToken: verificationToken
                }
            })
        };

        const emailServiceBody = {
            to: email,
            subject: appName + " sign-up verification",
            text: `Verification code: ${verificationToken}`,
            html: `Verification code: <strong>${verificationToken}</strong>`,
            secret: process.env.EMAIL_SERVICE_SECRET
        }
        saveConfirmationInfo(res, signUpConfirmationUrl, options, emailServiceBody);
    });
};
