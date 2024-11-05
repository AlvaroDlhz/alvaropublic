const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Modelo para las diligencias
const Task = mongoose.model('Task', {
    userId: mongoose.Schema.Types.ObjectId,
    titulo: String,
    descripcion: String,
    estado: {
        type: String,
        enum: ['pendiente', 'en_proceso', 'completada'],
        default: 'pendiente'
    },
    fechaCreacion: { type: Date, default: Date.now },
    fechaActualizacion: Date,
    puntos: Number
});

// Obtener diligencias del usuario
router.get('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.userId });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener diligencias' });
    }
});

// Crear nueva diligencia
router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            userId: req.userId,
            ...req.body
        });
        await task.save();

        // Notificar al usuario
        notifyUser(req.userId, {
            type: 'NEW_TASK',
            task
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear diligencia' });
    }
});

// Actualizar estado de diligencia
router.patch('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { 
                estado: req.body.estado,
                fechaActualizacion: Date.now()
            },
            { new: true }
        );

        if (task.estado === 'completada') {
            // Actualizar puntos del usuario
            const user = await User.findByIdAndUpdate(
                req.userId,
                { $inc: { puntos: task.puntos } },
                { new: true }
            );

            // Notificar actualización de puntos
            notifyUser(req.userId, {
                type: 'POINTS_UPDATED',
                points: user.puntos
            });
        }

        // Notificar actualización de tarea
        notifyUser(req.userId, {
            type: 'TASK_UPDATED',
            task
        });

        res.json(task);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar diligencia' });
    }
}); 