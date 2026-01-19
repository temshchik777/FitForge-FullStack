const mongoose = require('mongoose');
require('dotenv').config();

const Post = require('./models/Post');
const db = require('./config/keys').mongoURI;

async function cleanBrokenPosts() {
  try {
    await mongoose.connect(db, { useNewUrlParser: true, useFindAndModify: false });
    console.log('MongoDB Connected');

    const result = await Post.deleteMany({ user: null });
    console.log(`🗑️ Удалено ${result.deletedCount} постов без user`);

  } catch (e) {
    console.error('Clean error:', e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

cleanBrokenPosts();
