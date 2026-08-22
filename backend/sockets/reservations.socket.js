function emitReservationCreated(io, reservation) {
  io.to("admins").emit("reservation:created", reservation);
  if (reservation.userId)
    io.to(`user:${reservation.userId}`).emit(
      "reservation:created",
      reservation,
    );
}
function emitReservationUpdated(io, reservation) {
  io.to("admins").emit("reservation:updated", reservation);
  io.to(`user:${reservation.userId}`).emit("reservation:updated", reservation);
}
function emitReservationCancelled(io, reservation) {
  io.to("admins").emit("reservation:updated", reservation);
  io.to(`user:${reservation.userId}`).emit(
    "reservation:cancelled",
    reservation,
  );
}

module.exports = {
  emitReservationCreated,
  emitReservationUpdated,
  emitReservationCancelled,
};
