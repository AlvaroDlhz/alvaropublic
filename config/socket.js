const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

module.exports = function(server) {
    const io = socketIO(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ["GET", "POST"]
        }
    });

    // Middleware de autenticación para sockets
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('No autorizado'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.user.id;
            next();
        } catch (err) {
            next(new Error('Token inválido'));
        }
    });

    const connectedUsers = new Map();

    io.on('connection', (socket) => {
        connectedUsers.set(socket.userId, socket.id);

        // Manejar mensajes de chat
        socket.on('send_message', async (data) => {
            try {
                const { receptorId, contenido, tipo = 'texto' } = data;
                const emisorId = socket.userId;

                // Guardar mensaje en la base de datos
                const chat = await Chat.findOneAndUpdate(
                    {
                        participantes: { $all: [emisorId, receptorId] }
                    },
                    {
                        $push: { mensajes: { emisor: emisorId, contenido, tipo } },
                        $set: { ultimoMensaje: new Date() }
                    },
                    { upsert: true, new: true }
                );

                // Enviar mensaje al receptor si está conectado
                const receptorSocketId = connectedUsers.get(receptorId);
                if (receptorSocketId) {
                    io.to(receptorSocketId).emit('receive_message', {
                        chatId: chat._id,
                        mensaje: chat.mensajes[chat.mensajes.length - 1]
                    });
                }

                // Crear notificación
                await Notification.create({
                    receptor: receptorId,
                    emisor: emisorId,
                    tipo: 'mensaje',
                    contenido: 'Nuevo mensaje recibido'
                });
            } catch (error) {
                console.error('Error al enviar mensaje:', error);
            }
        });

        // Manejar notificaciones en tiempo real
        socket.on('notification', async (data) => {
            const receptorSocketId = connectedUsers.get(data.receptorId);
            if (receptorSocketId) {
                io.to(receptorSocketId).emit('new_notification', data);
            }
        });

        socket.on('disconnect', () => {
            connectedUsers.delete(socket.userId);
        });
    });

    return io;
}; 