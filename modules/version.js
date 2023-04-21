const pjson = require("../package.json");

module.exports = {
    environment: process.env.NODE_ENV,
    version: pjson.version,
    show: process.env.NODE_ENV === "development" ? true : false,
};
