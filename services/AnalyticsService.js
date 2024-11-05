const User = require('../models/User');
const Post = require('../models/Post');
const Diligencia = require('../models/Diligencia');

class AnalyticsService {
    static async getUserAnalytics(userId) {
        try {
            const [
                user,
                postsCount,
                diligenciasCompletadas,
                interacciones
            ] = await Promise.all([
                User.findById(userId),
                Post.countDocuments({ usuario: userId }),
                Diligencia.countDocuments({ 
                    usuario: userId,
                    estado: 'Completada'
                }),
                this.getUserInteractions(userId)
            ]);

            return {
                estadisticasGenerales: {
                    totalPosts: postsCount,
                    diligenciasCompletadas,
                    puntosTotales: user.puntos,
                    seguidores: user.seguidores.length,
                    siguiendo: user.siguiendo.length
                },
                interacciones,
                progreso: await this.calculateUserProgress(userId),
                tendencias: await this.getUserTrends(userId)
            };
        } catch (error) {
            throw new Error('Error al obtener analíticas del usuario');
        }
    }

    static async getUserInteractions(userId) {
        const posts = await Post.find({ usuario: userId });
        const postIds = posts.map(post => post._id);

        const likes = posts.reduce((total, post) => total + post.likes.length, 0);
        const comentarios = posts.reduce((total, post) => total + post.comentarios.length, 0);

        return {
            likes,
            comentarios,
            promedioInteraccionesPorPost: posts.length ? 
                (likes + comentarios) / posts.length : 0
        };
    }

    static async calculateUserProgress(userId) {
        const user = await User.findById(userId);
        const nivelActual = user.nivel;
        
        const niveles = {
            'Principiante': { min: 0, max: 1000 },
            'Intermedio': { min: 1001, max: 5000 },
            'Experto': { min: 5001, max: Infinity }
        };

        const progresoNivel = {
            nivelActual,
            puntos: user.puntos,
            siguienteNivel: nivelActual !== 'Experto' ? 
                Object.keys(niveles)[Object.keys(niveles).indexOf(nivelActual) + 1] : null,
            porcentaje: this.calculateLevelProgress(user.puntos, niveles[nivelActual])
        };

        return progresoNivel;
    }

    static calculateLevelProgress(points, level) {
        return Math.min(
            ((points - level.min) / (level.max - level.min)) * 100,
            100
        );
    }

    static async getUserTrends(userId) {
        const ultimoMes = new Date();
        ultimoMes.setMonth(ultimoMes.getMonth() - 1);

        const [postsRecientes, diligenciasRecientes] = await Promise.all([
            Post.find({
                usuario: userId,
                fecha: { $gte: ultimoMes }
            }).sort({ fecha: 1 }),
            Diligencia.find({
                usuario: userId,
                fechaCreacion: { $gte: ultimoMes }
            }).sort({ fechaCreacion: 1 })
        ]);

        return {
            actividadReciente: {
                posts: this.groupByDate(postsRecientes, 'fecha'),
                diligencias: this.groupByDate(diligenciasRecientes, 'fechaCreacion')
            }
        };
    }

    static groupByDate(items, dateField) {
        const grouped = {};
        items.forEach(item => {
            const fecha = item[dateField].toISOString().split('T')[0];
            grouped[fecha] = (grouped[fecha] || 0) + 1;
        });
        return grouped;
    }
}

module.exports = AnalyticsService; 