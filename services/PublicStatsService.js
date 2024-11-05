const User = require('../models/User');
const Post = require('../models/Post');
const Diligencia = require('../models/Diligencia');
const Cache = require('../utils/Cache');

class PublicStatsService {
    static async getPublicStats() {
        // Usar caché para evitar consultas frecuentes
        const cacheKey = 'public_stats';
        const cachedStats = await Cache.get(cacheKey);

        if (cachedStats) {
            return JSON.parse(cachedStats);
        }

        const [
            userStats,
            cityStats,
            diligenciaStats,
            activityStats
        ] = await Promise.all([
            this.getUserStats(),
            this.getCityStats(),
            this.getDiligenciaStats(),
            this.getActivityStats()
        ]);

        const stats = {
            usuarios: userStats,
            ciudades: cityStats,
            diligencias: diligenciaStats,
            actividad: activityStats,
            ultimaActualizacion: new Date()
        };

        // Guardar en caché por 1 hora
        await Cache.set(cacheKey, JSON.stringify(stats), 3600);

        return stats;
    }

    static async getUserStats() {
        const totalUsuarios = await User.countDocuments();
        const usuariosActivos = await User.countDocuments({
            ultimaActividad: { 
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
            }
        });

        return {
            total: totalUsuarios,
            activos: usuariosActivos,
            porcentajeActivos: (usuariosActivos / totalUsuarios * 100).toFixed(2)
        };
    }

    static async getCityStats() {
        return await User.aggregate([
            { $group: { 
                _id: '$ciudad',
                usuarios: { $sum: 1 },
                puntosPromedio: { $avg: '$puntos' }
            }},
            { $sort: { usuarios: -1 } },
            { $limit: 10 }
        ]);
    }

    static async getDiligenciaStats() {
        const stats = await Diligencia.aggregate([
            { $group: {
                _id: '$estado',
                cantidad: { $sum: 1 },
                tiempoPromedio: { $avg: {
                    $subtract: ['$fechaCompletado', '$fechaCreacion']
                }}
            }}
        ]);

        return stats.map(stat => ({
            estado: stat._id,
            cantidad: stat.cantidad,
            tiempoPromedioDias: Math.round(stat.tiempoPromedio / (1000 * 60 * 60 * 24))
        }));
    }

    static async getActivityStats() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        return await Post.aggregate([
            { $match: { fecha: { $gte: thirtyDaysAgo } } },
            { $group: {
                _id: { 
                    $dateToString: { 
                        format: '%Y-%m-%d', 
                        date: '$fecha' 
                    }
                },
                posts: { $sum: 1 },
                interacciones: { 
                    $sum: { 
                        $add: [
                            { $size: '$likes' },
                            { $size: '$comentarios' }
                        ]
                    }
                }
            }},
            { $sort: { _id: 1 } }
        ]);
    }
} 