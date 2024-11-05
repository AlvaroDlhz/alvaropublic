const User = require('../models/User');
const Post = require('../models/Post');
const Diligencia = require('../models/Diligencia');

class RecommendationService {
    static async getPersonalizedRecommendations(userId) {
        const user = await User.findById(userId);
        
        const [
            recommendedUsers,
            recommendedPosts,
            recommendedDiligencias
        ] = await Promise.all([
            this.getRecommendedUsers(user),
            this.getRecommendedPosts(user),
            this.getRecommendedDiligencias(user)
        ]);

        return {
            usuarios: recommendedUsers,
            posts: recommendedPosts,
            diligencias: recommendedDiligencias
        };
    }

    static async getRecommendedUsers(user) {
        // Encontrar usuarios con intereses similares
        const similarUsers = await User.find({
            _id: { 
                $nin: [...user.siguiendo, user._id] 
            },
            ciudad: user.ciudad
        })
        .limit(10)
        .select('nombre avatar bio ciudad puntos');

        return similarUsers;
    }

    static async getRecommendedPosts(user) {
        // Obtener categorías de posts que el usuario ha interactuado
        const userInteractions = await Post.find({
            $or: [
                { 'likes': user._id },
                { 'comentarios.usuario': user._id }
            ]
        }).distinct('categoria');

        // Recomendar posts similares
        return await Post.find({
            categoria: { $in: userInteractions },
            usuario: { $nin: [...user.siguiendo, user._id] }
        })
        .populate('usuario', 'nombre avatar')
        .sort({ likes: -1 })
        .limit(5);
    }

    static async getRecommendedDiligencias(user) {
        // Recomendar diligencias basadas en la ciudad y experiencia del usuario
        return await Diligencia.find({
            usuario: { $ne: user._id },
            'ubicacion.ciudad': user.ciudad,
            estado: 'Completada'
        })
        .populate('usuario', 'nombre')
        .sort({ puntos: -1 })
        .limit(5);
    }
} 