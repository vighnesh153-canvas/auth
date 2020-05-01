const fetch = require('node-fetch');

module.exports = (req, res, next) => {
    const databasePrefix = process.env.MODE === "DEV" ? "test/" : "";
    const authParam = `?auth=${req.app.get('authToken')}`;
    const baseUsersUrl = process.env.DB_URL + databasePrefix +
        appName + "/users.json" + (req.app.get('authToken') ? authParam : "");

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email, password
        })
    };

    fetch(baseUsersUrl, options)
        .then(jsonResponse => jsonResponse.json())
        .then(response => {
            res.status(200).json({message: "SUCCESS" });
        });
};
