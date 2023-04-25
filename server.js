const app = require("./app");
const { server } = require("./app");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

server.listen(PORT, HOST, () => {
    console.log(`Server is running: http://${HOST}:${PORT}`);
});
