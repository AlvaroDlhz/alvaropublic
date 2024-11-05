const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descripcion: String,
    tipo: {
        type: String,
        enum: ['diligencia', 'reunion', 'recordatorio', 'vencimiento'],
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ubicacion: {
        nombre: String,
        direccion: String,
        coordenadas: {
            lat: Number,
            lng: Number
        }
    },
    recordatorios: [{
        tiempo: Number, // minutos antes del evento
        enviado: {
            type: Boolean,
            default: false
        }
    }],
    estado: {
        type: String,
        enum: ['pendiente', 'completado', 'cancelado'],
        default: 'pendiente'
    },
    documentosRequeridos: [{
        nombre: String,
        descripcion: String,
        obligatorio: Boolean
    }],
    participantes: [{
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        confirmado: {
            type: Boolean,
            default: false
        }
    }]
});

module.exports = mongoose.model('Event', eventSchema); 