module.exports = async (io) => {
    io.on("connection", (socket) => {
        const gameID = socket.handshake.query.gameID;

        socket.join(gameID);
        //socket.to(gameID).emit("chat", "user: " + socket.id + " joined.");

        socket.on("chat", (message) => {
            console.log(message);
            socket.to(gameID).emit("chat", message);
        });
    });
};
