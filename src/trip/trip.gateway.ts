import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Solo para desarrollo
  },
})
export class TripGateway {
  @WebSocketServer() server: Server;

  emitTripStatusChange(trip: any) {
    console.log('🚀 Emitting trip-status-change:', trip);
    this.server.emit('trip-status-change', trip);
  }
}
