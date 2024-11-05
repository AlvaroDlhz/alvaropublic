const User = require('../models/User');
const Achievement = require('../models/Achievement');

class GamificationService {
    static async checkUserAchievements(userId) {
        const user = await User.findById(userId);
        const achievements = await Achievement.find();
        const newAchievements = [];

        for (const achievement of achievements) {
            const isEarned = await this.verifyAchievement(user, achievement);
            if (isEarned) {
                await this.awardAchievement(user, achievement);
                newAchievements.push(achievement);
            }
        }

        return newAchievements;
    }

    static async verifyAchievement(user, achievement) {
        switch (achievement.condicion.tipo) {
            case 'diligencias':
                return user.diligenciasCompletadas >= achievement.condicion.cantidad;
            case 'posts':
                const postsCount = await Post.countDocuments({ usuario: user._id });
                return postsCount >= achievement.condicion.cantidad;
            case 'seguidores':
                return user.seguidores.length >= achievement.condicion.cantidad;
            case 'puntos':
                return user.puntos >= achievement.condicion.cantidad;
            default:
                return false;
        }
    }

    static async awardAchievement(user, achievement) {
        // Actualizar puntos y logros del usuario
        await User.findByIdAndUpdate(user._id, {
            $addToSet: { logros: achievement._id },
            $inc: { puntos: achievement.puntos }
        });

        // Crear notificación
        await Notification.create({
            receptor: user._id,
            tipo: 'logro',
            contenido: `¡Has desbloqueado el logro "${achievement.nombre}"!`,
            referencia: achievement._id,
            modeloReferencia: 'Achievement'
        });
    }

    static async calculateLevel(points) {
        const levels = [
            { nombre: 'Principiante', min: 0, max: 1000 },
            { nombre: 'Ciudadano Activo', min: 1001, max: 3000 },
            { nombre: 'Ciudadano Experto', min: 3001, max: 6000 },
            { nombre: 'Líder Comunitario', min: 6001, max: 10000 },
            { nombre: 'Embajador Ciudadano', min: 10001, max: Infinity }
        ];

        return levels.find(level => points >= level.min && points <= level.max);
    }
} 