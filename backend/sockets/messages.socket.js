function emitMessageNew(io, targetRoom, message) {
  io.to(targetRoom).emit("message:new", message);
}
function emitBroadcast(io, messages) {
  io.emit("message:broadcast", messages);
}

module.exports = { emitMessageNew, emitBroadcast };
