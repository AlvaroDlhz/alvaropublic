const Event = require('../models/Event');
const Diligencia = require('../models/Diligencia');

class CalendarService {
    static async getUserEvents(userId, start, end) {
        const [events, diligencias] = await Promise.all([
            Event.find({
                usuario: userId,
                fecha: { $gte: start, $lte: end }
            }),
            Diligencia.find({
                usuario: userId,
                fechaLimite: { $gte: start, $lte: end }
            })
        ]);

        // Convertir diligencias a formato de evento
        const diligenciasEvents = diligencias.map(d => ({
            title: d.titulo,
            start: d.fechaLimite,
            tipo: 'diligencia',
            color: this.getEventColor('diligencia'),
            diligenciaId: d._id
        }));

        // Formatear eventos regulares
        const regularEvents = events.map(e => ({
            title: e.titulo,
            start: e.fecha,
            tipo: e.tipo,
            color: this.getEventColor(e.tipo),
            eventId: e._id
        }));

        return [...regularEvents, ...diligenciasEvents];
    }

    static getEventColor(tipo) {
        const colors = {
            diligencia: '#FF5722',
            reunion: '#2196F3',
            recordatorio: '#4CAF50',
            vencimiento: '#F44336'
        };
        return colors[tipo] || '#9E9E9E';
    }

    static async createEvent(eventData) {
        const event = new Event(eventData);
        await event.save();

        // Programar recordatorios
        if (event.recordatorios && event.recordatorios.length > 0) {
            event.recordatorios.forEach(recordatorio => {
                const tiempoRecordatorio = new Date(event.fecha.getTime() - recordatorio.tiempo * 60000);
                this.scheduleReminder(event._id, tiempoRecordatorio);
            });
        }

        return event;
    }

    static async scheduleReminder(eventId, tiempo) {
        // Implementar lógica de recordatorios
        // Puede usar una cola de trabajos como Bull
    }
} 