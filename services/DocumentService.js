const AWS = require('aws-sdk');
const Document = require('../models/Document');
const crypto = require('crypto');

class DocumentService {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY,
            region: process.env.AWS_REGION
        });
        this.bucketName = process.env.AWS_BUCKET_NAME;
    }

    async uploadDocument(file, userId, metadata) {
        try {
            const fileName = `${userId}/${crypto.randomBytes(16).toString('hex')}-${file.originalname}`;
            
            const uploadParams = {
                Bucket: this.bucketName,
                Key: fileName,
                Body: file.buffer,
                ContentType: file.mimetype,
                Metadata: {
                    userId: userId.toString(),
                    ...metadata
                }
            };

            const result = await this.s3.upload(uploadParams).promise();

            const document = new Document({
                usuario: userId,
                nombre: file.originalname,
                tipo: file.mimetype,
                tamaño: file.size,
                url: result.Location,
                key: fileName,
                metadata: metadata
            });

            await document.save();
            return document;
        } catch (error) {
            console.error('Error al subir documento:', error);
            throw new Error('Error al subir el documento');
        }
    }

    async getDocumentUrl(documentId, userId) {
        try {
            const document = await Document.findOne({
                _id: documentId,
                usuario: userId
            });

            if (!document) {
                throw new Error('Documento no encontrado');
            }

            const params = {
                Bucket: this.bucketName,
                Key: document.key,
                Expires: 3600 // URL válida por 1 hora
            };

            return await this.s3.getSignedUrlPromise('getObject', params);
        } catch (error) {
            console.error('Error al obtener URL del documento:', error);
            throw new Error('Error al acceder al documento');
        }
    }
} 