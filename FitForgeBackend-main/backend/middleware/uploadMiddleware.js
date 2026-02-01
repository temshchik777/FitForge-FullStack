const multer = require('multer');

// Локальная загрузка файлов
const upload = multer({
    dest: 'uploads/', // файлы будут сохраняться локально в папку uploads
    limits: {
        fileSize: 10 * 1024 * 1024, // максимум 10 МБ
        files: 5
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Разрешены только изображения (JPEG, PNG, GIF)'), false);
        }
    }
});

// Для удаления файлов локально (если нужно)
const deleteFile = (filePath) => {
    const fs = require('fs');
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) return reject(err);
            resolve({ success: true });
        });
    });
};

module.exports = { upload, deleteFile };
