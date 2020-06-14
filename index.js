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

const corsConfiguration = require('./controllers/cors-config');
app.use(corsConfiguration);

const helmet = require('helmet');
app.use(helmet());

const routes = require('./routes');
app.use(routes);

const startAppServer = () => app.listen(process.env.PORT || 8090, () => {
    console.log("Serving at port: 8090");
});

startAppServer();
