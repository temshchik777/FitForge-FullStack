const User = require("../models/User");
const Post = require("../models/Post");

// Зберегти пост
exports.savePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Перевіряємо чи пост вже збережений
    if (user.savedPosts.includes(postId)) {
      return res.status(400).json({ message: "Post already saved" });
    }

    user.savedPosts.push(postId);
    await user.save();

    res.json({ message: "Post saved successfully", savedPosts: user.savedPosts });
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

// Видалити пост зі збережених
exports.unsavePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    await user.save();

    res.json({ message: "Post unsaved successfully", savedPosts: user.savedPosts });
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};

// Отримати всі збережені пости
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'savedPosts',
      populate: {
        path: 'user',
        select: 'firstName lastName email avatarUrl'
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.savedPosts);
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
};
