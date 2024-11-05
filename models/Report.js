const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reportador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tipo: {
        type: String,
        enum: ['post', 'usuario', 'comentario'],
        required: true
    },
    elementoReportado: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'tipoElemento',
        required: true
    },
    tipoElemento: {
        type: String,
        required: true,
        enum: ['Post', 'User', 'Comment']
    },
    razon: {
        type: String,
        required: true,
        enum: [
            'contenido_inapropiado',
            'spam',
            'acoso',
            'informacion_falsa',
            'otro'
        ]
    },
    descripcion: {
        type: String,
        maxLength: 500
    },
    estado: {
        type: String,
        enum: ['pendiente', 'revisado', 'resuelto', 'descartado'],
        default: 'pendiente'
    },
    accionTomada: {
        type: String,
        enum: ['ninguna', 'advertencia', 'eliminacion', 'suspension'],
        default: 'ninguna'
    },
    fechaReporte: {
        type: Date,
        default: Date.now
    },
    fechaResolucion: Date,
    moderador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Report', reportSchema); 