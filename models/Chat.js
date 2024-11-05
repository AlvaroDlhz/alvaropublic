const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    emisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: ['texto', 'imagen', 'archivo'],
        default: 'texto'
    },
    archivo: {
        url: String,
        nombre: String,
        tipo: String
    },
    leido: {
        type: Boolean,
        default: false
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

const chatSchema = new mongoose.Schema({
    participantes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    mensajes: [messageSchema],
    ultimoMensaje: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema); 