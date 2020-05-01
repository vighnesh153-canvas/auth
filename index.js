// Obtain environment config
require('dotenv').config()

if (process.env.MODE === "DEV") {
    const path = require("path");
    require('dotenv').config({ path: path.resolve(process.cwd(), "secrets.env") })
}

const express = require("express");
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const routes = require('./routes');
app.use(routes);

const startAppServer = () => app.listen(process.env.PORT || 8090, () => {
    console.log("Serving at port: 8090");
});

// Acquire authToken if in prod
if (process.env.MODE === "DEV") {
    startAppServer();
} else {
    const fetch = require('node-fetch');

    const URL = process.env.ADMIN_VERIFICATION_URL + process.env.PROJECT_API_KEY;
    const adminInfo = {
        email: process.env.AUTH_EMAIL,
        password: process.env.AUTH_PASSWORD,
        returnSecureToken: true
    };
    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminInfo)
    };

    fetch(URL, options)
        .then(jsonResponse => jsonResponse.json())
        .then(response => {
            const authToken = response.idToken;
            app.set("authToken", authToken);
            startAppServer();
        });
}
