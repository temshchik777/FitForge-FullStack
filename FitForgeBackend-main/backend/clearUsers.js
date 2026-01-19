const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const db = require('./config/keys').mongoURI;

async function clear() {
  try {
    await mongoose.connect(db, { useNewUrlParser: true, useFindAndModify: false });
    console.log('MongoDB Connected');

    const result = await User.deleteMany({});
    console.log(`🗑️ Удалено ${result.deletedCount} пользователей`);

  } catch (e) {
    console.error('Clear error:', e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

clear();
