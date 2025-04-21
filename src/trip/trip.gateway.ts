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
  path: '/socket.io',
})
export class TripGateway {
  @WebSocketServer() server: Server;

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

  @SubscribeMessage('leave-trip-room')
  handleLeaveRoom(
    @MessageBody() data: { id: string },
    @ConnectedSocket() client: Socket,
  ) {
    const tripId = data.id;
    if (!tripId) {
      console.warn(`⚠️ Cliente ${client.id} intentó salir sin tripId`);
      return;
    }

    const room = `trip-${tripId}`;
    client.leave(room);
    console.log(`🚪 Cliente ${client.id} salió de la sala ${room}`);
  }

  emitTripStatusChange(trip: any) {
    const roomName = `trip-${trip.id}`;
    console.log(`🚀 Emitting to room ${roomName}:`, trip);
    this.server.to(roomName).emit('trip-status-change', trip);
  }
}
