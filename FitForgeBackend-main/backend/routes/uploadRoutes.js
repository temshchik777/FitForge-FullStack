const express = require('express');
const router = express.Router();
const { upload, deleteFile } = require('../middleware/uploadMiddleware');

// Загрузка файлов
router.post('/upload', upload.array('images', 5), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'Файлы не загружены' });
        }
        
        // Возвращаем имена файлов (без пути)
        const fileNames = req.files.map(file => file.filename);
        
        res.status(200).json({ 
            success: true, 
            files: fileNames,
            message: 'Файлы успешно загружены'
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(400).json({ success: false, error: error.message });
    }
});

// Удаление файла
router.delete('/delete/:key', async (req, res) => {
    try {
        const { key } = req.params;
        if (!key) {
            return res.status(400).json({ success: false, error: 'Ключ файла не указан' });
        }
        await deleteFile(key);
        res.status(200).json({ success: true, message: 'Файл успешно удален' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;