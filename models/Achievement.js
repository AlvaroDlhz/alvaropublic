const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    icono: {
        type: String,
        required: true
    },
    puntos: {
        type: Number,
        required: true
    },
    condicion: {
        tipo: {
            type: String,
            enum: ['diligencias', 'posts', 'seguidores', 'puntos'],
            required: true
        },
        cantidad: {
            type: Number,
            required: true
        }
    }
});

module.exports = mongoose.model('Achievement', achievementSchema); 