const User = require('../models/User');
const Post = require('../models/Post');
const Diligencia = require('../models/Diligencia');

class SearchService {
    static async searchAll(query, filters = {}) {
        const searchRegex = new RegExp(query, 'i');
        
        const results = await Promise.all([
            this.searchUsers(searchRegex, filters),
            this.searchPosts(searchRegex, filters),
            this.searchDiligencias(searchRegex, filters)
        ]);

        return {
            usuarios: results[0],
            posts: results[1],
            diligencias: results[2]
        };
    }

    static async searchUsers(searchRegex, filters) {
        const query = {
            $or: [
                { nombre: searchRegex },
                { ciudad: searchRegex }
            ]
        };

        if (filters.ciudad) {
            query.ciudad = filters.ciudad;
        }

        return await User.find(query)
            .select('-password')
            .limit(10);
    }

    static async searchPosts(searchRegex, filters) {
        const query = {
            $or: [
                { contenido: searchRegex },
                { categoria: searchRegex }
            ]
        };

        if (filters.categoria) {
            query.categoria = filters.categoria;
        }

        return await Post.find(query)
            .populate('usuario', 'nombre avatar')
            .sort({ fecha: -1 })
            .limit(20);
    }

    static async searchDiligencias(searchRegex, filters) {
        const query = {
            $or: [
                { titulo: searchRegex },
                { descripcion: searchRegex }
            ]
        };

        if (filters.estado) {
            query.estado = filters.estado;
        }

        return await Diligencia.find(query)
            .populate('usuario', 'nombre')
            .sort({ fechaCreacion: -1 })
            .limit(15);
    }
}

module.exports = SearchService; 