const express = require('express');
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// POST /api/upload - Загрузка изображения
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не был загружен' });
    }

    // Возвращаем URL для доступа к файлу
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      message: 'Файл успешно загружен',
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    res.status(500).json({ 
      message: 'Ошибка при загрузке файла', 
      error: error.message 
    });
  }
});

// Обработчик ошибок multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Размер файла превышает 5MB' });
    }
  }
  res.status(400).json({ message: error.message });
});

module.exports = router;