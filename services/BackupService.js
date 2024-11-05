const { exec } = require('child_process');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const util = require('util');
const execPromise = util.promisify(exec);

class BackupService {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_KEY
        });
        this.backupBucket = process.env.AWS_BACKUP_BUCKET;
    }

    async createBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(__dirname, '../backups', `backup-${timestamp}`);
            
            // Crear backup de MongoDB
            await this.createMongoBackup(backupPath);
            
            // Comprimir backup
            const zipPath = await this.compressBackup(backupPath);
            
            // Subir a S3
            await this.uploadToS3(zipPath, timestamp);
            
            // Limpiar archivos temporales
            await this.cleanup(backupPath, zipPath);
            
            return {
                success: true,
                timestamp,
                message: 'Backup completado exitosamente'
            };
        } catch (error) {
            console.error('Error en backup:', error);
            throw new Error('Error al crear backup');
        }
    }

    async createMongoBackup(backupPath) {
        const cmd = `mongodump --uri="${process.env.MONGODB_URI}" --out="${backupPath}"`;
        await execPromise(cmd);
    }

    async compressBackup(backupPath) {
        const zipPath = `${backupPath}.tar.gz`;
        const cmd = `tar -czf "${zipPath}" -C "${path.dirname(backupPath)}" "${path.basename(backupPath)}"`;
        await execPromise(cmd);
        return zipPath;
    }

    async uploadToS3(filePath, timestamp) {
        const fileStream = fs.createReadStream(filePath);
        const uploadParams = {
            Bucket: this.backupBucket,
            Key: `backup-${timestamp}.tar.gz`,
            Body: fileStream
        };

        await this.s3.upload(uploadParams).promise();
    }

    async cleanup(...paths) {
        for (const path of paths) {
            await fs.promises.rm(path, { recursive: true, force: true });
        }
    }

    async restoreBackup(backupId) {
        try {
            const backupFile = await this.downloadFromS3(backupId);
            await this.extractBackup(backupFile);
            await this.restoreMongoBackup(backupFile);
            
            return {
                success: true,
                message: 'Restauración completada exitosamente'
            };
        } catch (error) {
            console.error('Error en restauración:', error);
            throw new Error('Error al restaurar backup');
        }
    }

    async downloadFromS3(backupId) {
        const downloadParams = {
            Bucket: this.backupBucket,
            Key: backupId
        };

        const tempPath = path.join(__dirname, '../temp', backupId);
        const fileStream = fs.createWriteStream(tempPath);
        
        await new Promise((resolve, reject) => {
            this.s3.getObject(downloadParams)
                .createReadStream()
                .pipe(fileStream)
                .on('error', reject)
                .on('close', resolve);
        });

        return tempPath;
    }

    async extractBackup(backupFile) {
        const cmd = `tar -xzf "${backupFile}" -C "${path.dirname(backupFile)}"`;
        await execPromise(cmd);
    }

    async restoreMongoBackup(backupPath) {
        const extractedPath = backupPath.replace('.tar.gz', '');
        const cmd = `mongorestore --uri="${process.env.MONGODB_URI}" "${extractedPath}"`;
        await execPromise(cmd);
    }
} 