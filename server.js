const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Running on port http://localhost:${PORT}`);
});
