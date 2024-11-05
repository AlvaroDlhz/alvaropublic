const User = require('../models/User');
const Post = require('../models/Post');
const Report = require('../models/Report');
const Activity = require('../models/Activity');

class AdminService {
    static async getDashboardStats() {
        const [
            userStats,
            contentStats,
            reportStats,
            activityStats
        ] = await Promise.all([
            this.getUserStats(),
            this.getContentStats(),
            this.getReportStats(),
            this.getActivityStats()
        ]);

        return {
            usuarios: userStats,
            contenido: contentStats,
            reportes: reportStats,
            actividad: activityStats
        };
    }

    static async moderateContent(contentId, action, moderatorId) {
        try {
            const report = await Report.findById(contentId);
            if (!report) throw new Error('Reporte no encontrado');

            switch (action) {
                case 'delete':
                    await this.deleteReportedContent(report);
                    break;
                case 'warn':
                    await this.warnUser(report.elementoReportado);
                    break;
                case 'ban':
                    await this.banUser(report.elementoReportado);
                    break;
                default:
                    throw new Error('Acción no válida');
            }

            report.estado = 'resuelto';
            report.moderador = moderatorId;
            report.fechaResolucion = new Date();
            await report.save();

            return { success: true, action };
        } catch (error) {
            console.error('Error en moderación:', error);
            throw new Error('Error al moderar contenido');
        }
    }

    static async getSystemLogs(filters = {}) {
        const query = {};
        if (filters.tipo) query.tipo = filters.tipo;
        if (filters.fechaInicio) {
            query.fecha = { $gte: new Date(filters.fechaInicio) };
        }
        if (filters.fechaFin) {
            query.fecha = { ...query.fecha, $lte: new Date(filters.fechaFin) };
        }

        return await Activity.find(query)
            .sort({ fecha: -1 })
            .limit(100);
    }

    // Métodos privados de ayuda
    static async deleteReportedContent(report) {
        switch (report.tipoElemento) {
            case 'Post':
                await Post.findByIdAndDelete(report.elementoReportado);
                break;
            case 'Comment':
                await Post.findOneAndUpdate(
                    { 'comentarios._id': report.elementoReportado },
                    { $pull: { comentarios: { _id: report.elementoReportado } } }
                );
                break;
        }
    }

    static async warnUser(userId) {
        await User.findByIdAndUpdate(userId, {
            $inc: { advertencias: 1 },
            $push: {
                notificaciones: {
                    tipo: 'advertencia',
                    contenido: 'Has recibido una advertencia por violar las normas de la comunidad.'
                }
            }
        });
    }

    static async banUser(userId) {
        await User.findByIdAndUpdate(userId, {
            $set: { 
                estado: 'suspendido',
                fechaSuspension: new Date(),
                suspensionRazon: 'Violación de normas de la comunidad'
            }
        });
    }
} 