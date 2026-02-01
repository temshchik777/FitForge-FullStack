module.exports = {
  // Поддерживаем оба варианта имен переменных окружения
  mongoURI:
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/fitforge_dev',
  secretOrKey:
    process.env.SECRET_OR_KEY ||
    process.env.SECRET_KEY ||
    'dev_secret_change_me',
};