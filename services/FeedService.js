const Post = require('../models/Post');
const User = require('../models/User');

class FeedService {
    static async getPersonalizedFeed(userId, page = 1, limit = 10) {
        try {
            const user = await User.findById(userId);
            const siguiendo = user.siguiendo;

            // Obtener posts de usuarios seguidos y posts populares
            const [followingPosts, popularPosts] = await Promise.all([
                Post.find({ usuario: { $in: siguiendo } })
                    .populate('usuario', 'nombre avatar')
                    .sort({ fecha: -1 })
                    .skip((page - 1) * limit)
                    .limit(Math.floor(limit * 0.7)), // 70% del feed son posts de seguidos

                Post.find({ usuario: { $nin: siguiendo } })
                    .populate('usuario', 'nombre avatar')
                    .sort({ likes: -1 })
                    .limit(Math.floor(limit * 0.3)) // 30% son posts populares
            ]);

            // Mezclar posts de manera inteligente
            const feed = this.mergePosts(followingPosts, popularPosts);

            return {
                posts: feed,
                hasMore: followingPosts.length === Math.floor(limit * 0.7)
            };
        } catch (error) {
            throw new Error('Error al generar feed personalizado');
        }
    }

    static mergePosts(following, popular) {
        const merged = [...following];
        let popularIndex = 0;

        // Insertar posts populares cada 3 posts de seguidos
        for (let i = 2; i < merged.length && popularIndex < popular.length; i += 3) {
            merged.splice(i, 0, popular[popularIndex++]);
        }

        // Añadir posts populares restantes al final
        while (popularIndex < popular.length) {
            merged.push(popular[popularIndex++]);
        }

        return merged;
    }
}

module.exports = FeedService; 