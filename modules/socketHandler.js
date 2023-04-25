/*
module.exports = function (io) {
    io.on("connection", (socket) => {
        socket.on("join-room", (roomId) => {
            console.log(`User ${socket.id} joined room ${roomId}`);
            socket.join(roomId);

            // Notify other users in the room
            socket.to(roomId).emit("user-joined", socket.id);
        });

        socket.on("leaveRoom", (roomId) => {
            socket.leave(roomId);
            console.log("User left room", roomId, socket.id);
        });

        socket.on("chat", (roomId, msg) => {
            console.log(`Received data in room ${roomId}:`, msg);
            socket.to(roomId).emit("chat", msg);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected", socket.id);
            if (currentRoomId) {
                socket.to(currentRoomId).emit("user-left", socket.id);
            }
        });
    });
};
*/

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
