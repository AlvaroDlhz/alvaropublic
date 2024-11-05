const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    receptor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    emisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tipo: {
        type: String,
        enum: ['like', 'comentario', 'seguidor', 'diligencia', 'nivel', 'mensaje'],
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    referencia: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'modeloReferencia'
    },
    modeloReferencia: {
        type: String,
        enum: ['Post', 'Diligencia', 'User']
    },
    leida: {
        type: Boolean,
        default: false
    },
    fecha: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema); 