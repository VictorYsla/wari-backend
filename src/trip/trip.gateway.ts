import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Solo para desarrollo
  },
})
export class TripGateway {
  @WebSocketServer() server: Server;

  // El cliente debe llamar esto para unirse a su sala privada
  @SubscribeMessage('join-trip-room')
  @SubscribeMessage('join-trip-room')
  handleJoinRoom(
    @MessageBody() data: { id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const tripId = data.id;
    if (!tripId) {
      console.warn(`⚠️ Cliente ${client.id} intentó unirse sin tripId`);
      return;
    }

    const room = `trip-${tripId}`;
    client.join(room);
    console.log(`✅ Cliente ${client.id} se unió a la sala ${room}`);
  }

  // Emitimos a una sala específica
  emitTripStatusChange(trip: any) {
    const roomName = `trip-${trip.id}`; // asumimos que trip tiene id
    console.log(`🚀 Emitting to room ${roomName}:`, trip);
    this.server.to(roomName).emit('trip-status-change', trip);
  }
}
