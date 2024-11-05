const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        let uploadPath = 'public/uploads/';
        
        switch(file.fieldname) {
            case 'avatar':
                uploadPath += 'avatars/';
                break;
            case 'post':
                uploadPath += 'posts/';
                break;
            case 'documento':
                uploadPath += 'documentos/';
                break;
            default:
                uploadPath += 'otros/';
        }
        
        cb(null, uploadPath);
    },
    filename: function(req, file, cb) {
        crypto.randomBytes(16, (err, buf) => {
            if (err) return cb(err);
            
            cb(null, buf.toString('hex') + path.extname(file.originalname));
        });
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'image/jpeg': true,
        'image/png': true,
        'application/pdf': true,
        'application/msword': true,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
    };

    if (allowedTypes[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
}); 