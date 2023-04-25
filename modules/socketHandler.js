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

module.exports = function (io) {
    io.on("connection", (socket) => {
        console.log("WS ID " + socket.handshake.query.gameID);
        socket.join(socket.handshake.query.gameID);
        socket.to(socket.handshake.query.gameID).emit("user-joined", socket.id);
    });
};
