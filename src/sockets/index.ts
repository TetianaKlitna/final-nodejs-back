import { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import tokenService from '../service/token-service'

let io: Server

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL || ''],
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE']
    }
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    const userData = tokenService.validateAccessToken(token)
    socket.data.user = userData
    next()
  })

  io.on('connection', socket => {
    // console.log('File:', __filename, 'Time:', new Date().toISOString())
    console.log(`User connected: ${socket.id}`)

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getIO = (): Server => {
  if (!io) throw new Error('Socket.IO not initialized')
  return io
}
