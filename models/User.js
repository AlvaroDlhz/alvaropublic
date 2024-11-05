const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    cedula: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    ciudad: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    bio: {
        type: String,
        maxLength: 500
    },
    puntos: {
        type: Number,
        default: 0
    },
    nivel: {
        type: String,
        enum: ['Principiante', 'Intermedio', 'Experto'],
        default: 'Principiante'
    },
    diligenciasCompletadas: {
        type: Number,
        default: 0
    },
    seguidores: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    siguiendo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    fechaRegistro: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema); 