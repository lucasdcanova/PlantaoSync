import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({
  namespace: '/schedules',
  cors: {
    origin: process.env.FRONTEND_URL ?? '*',
    credentials: true,
  },
})
export class SchedulesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(SchedulesGateway.name)

  afterInit() {
    this.logger.log('SchedulesGateway initialized')
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('join:org')
  handleJoinOrg(
    @MessageBody() data: { organizationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `org:${data.organizationId}`
    client.join(room)
    this.logger.log(`Client ${client.id} joined room ${room}`)
    return { event: 'joined', room }
  }

  @SubscribeMessage('leave:org')
  handleLeaveOrg(
    @MessageBody() data: { organizationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `org:${data.organizationId}`
    client.leave(room)
    this.logger.log(`Client ${client.id} left room ${room}`)
    return { event: 'left', room }
  }

  @OnEvent('schedule.published')
  handleSchedulePublished(payload: {
    scheduleId: string
    organizationId: string
    schedule: unknown
  }) {
    const room = `org:${payload.organizationId}`
    this.server.to(room).emit('schedule.published', {
      scheduleId: payload.scheduleId,
      schedule: payload.schedule,
    })
    this.logger.log(`schedule.published emitted to room ${room}`)
  }

  @OnEvent('schedule.updated')
  handleScheduleUpdated(payload: {
    scheduleId: string
    organizationId: string
  }) {
    const room = `org:${payload.organizationId}`
    this.server.to(room).emit('schedule.updated', {
      scheduleId: payload.scheduleId,
    })
  }

  @OnEvent('shift.confirmed')
  handleShiftConfirmed(payload: {
    shiftId: string
    organizationId: string
    userId: string
    confirmationId: string
  }) {
    const room = `org:${payload.organizationId}`
    this.server.to(room).emit('shift.confirmed', {
      shiftId: payload.shiftId,
      userId: payload.userId,
      confirmationId: payload.confirmationId,
    })
  }

  emitToOrg(organizationId: string, event: string, data: unknown) {
    const room = `org:${organizationId}`
    this.server.to(room).emit(event, data)
  }
}
