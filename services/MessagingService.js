const User = require('../models/User');
const Notification = require('../models/Notification');
const sgMail = require('@sendgrid/mail');
const Queue = require('bull');

class MessagingService {
    constructor() {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.emailQueue = new Queue('email-queue');
        this.notificationQueue = new Queue('notification-queue');
        this.setupQueues();
    }

    setupQueues() {
        this.emailQueue.process(async (job) => {
            const { to, subject, text, html } = job.data;
            try {
                await sgMail.send({
                    to,
                    from: process.env.EMAIL_FROM,
                    subject,
                    text,
                    html
                });
            } catch (error) {
                console.error('Error enviando email:', error);
                throw error;
            }
        });

        this.notificationQueue.process(async (job) => {
            const { users, notification } = job.data;
            try {
                await Notification.insertMany(
                    users.map(userId => ({
                        ...notification,
                        receptor: userId
                    }))
                );
            } catch (error) {
                console.error('Error creando notificaciones:', error);
                throw error;
            }
        });
    }

    async sendMassMessage({
        filtros,
        mensaje,
        tipo = 'todos', // 'email', 'notificacion', 'todos'
        prioridad = 'normal'
    }) {
        try {
            // Obtener usuarios según filtros
            const query = this.buildUserQuery(filtros);
            const users = await User.find(query).select('_id email');

            if (tipo === 'email' || tipo === 'todos') {
                await this.queueEmails(users, mensaje);
            }

            if (tipo === 'notificacion' || tipo === 'todos') {
                await this.queueNotifications(users, mensaje);
            }

            return {
                usuariosAlcanzados: users.length,
                estado: 'encolado'
            };
        } catch (error) {
            console.error('Error en envío masivo:', error);
            throw new Error('Error al procesar envío masivo');
        }
    }

    buildUserQuery(filtros) {
        const query = {};
        
        if (filtros.ciudad) {
            query.ciudad = filtros.ciudad;
        }
        if (filtros.nivel) {
            query.nivel = filtros.nivel;
        }
        if (filtros.puntosMínimos) {
            query.puntos = { $gte: filtros.puntosMínimos };
        }
        if (filtros.actividadReciente) {
            query.ultimaActividad = {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            };
        }

        return query;
    }

    async queueEmails(users, mensaje) {
        const emailJobs = users.map(user => ({
            to: user.email,
            subject: mensaje.asunto,
            text: mensaje.texto,
            html: mensaje.html
        }));

        await Promise.all(
            emailJobs.map(job => 
                this.emailQueue.add(job, {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000
                    }
                })
            )
        );
    }

    async queueNotifications(users, mensaje) {
        await this.notificationQueue.add({
            users: users.map(u => u._id),
            notification: {
                tipo: 'sistema',
                contenido: mensaje.texto,
                fecha: new Date()
            }
        });
    }
} 