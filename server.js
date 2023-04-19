const app = require("./app");

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});
