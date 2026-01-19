const Post = require("../models/Post");
const User = require("../models/User");
const Award = require("../models/Award");
const queryCreator = require("../commonHelpers/queryCreator");
const filterParser = require("../commonHelpers/filterParser");
const _ = require("lodash");

// Функція для перевірки та видачі нагород
async function checkAndGrantAwards(userId) {
  try {
    const user = await User.findById(userId).populate('awards');
    const userPosts = await Post.find({ user: userId });
    const postCount = userPosts.length;

    // Підраховуємо загальну кількість лайків на всіх постах користувача
    const totalLikes = userPosts.reduce((sum, post) => sum + post.likes.length, 0);

    // Знаходимо всі нагороди в системі
    const allAwards = await Award.find({});
    const userAwardIds = user.awards.map(a => a._id.toString());

    // Нагорода за перший пост
    const firstPostAward = allAwards.find(a => a.title === "Перша Відзнака");
    if (firstPostAward && postCount >= 1 && !userAwardIds.includes(firstPostAward._id.toString())) {
      user.awards.push(firstPostAward._id);
      console.log(`🏆 Користувач ${userId} отримав нагороду: ${firstPostAward.title}`);
    }

    // Нагорода за 5 постів
    const fivePostsAward = allAwards.find(a => a.title === "Сильний Старт");
    if (fivePostsAward && postCount >= 5 && !userAwardIds.includes(fivePostsAward._id.toString())) {
      user.awards.push(fivePostsAward._id);
      console.log(`🏆 Користувач ${userId} отримав нагороду: ${fivePostsAward.title}`);
    }

    // Нагорода за 10 постів
    const tenPostsAward = allAwards.find(a => a.title === "Медаліст");
    if (tenPostsAward && postCount >= 10 && !userAwardIds.includes(tenPostsAward._id.toString())) {
      user.awards.push(tenPostsAward._id);
      console.log(`🏆 Користувач ${userId} отримав нагороду: ${tenPostsAward.title}`);
    }

    // Нагорода за 10 лайків
    const tenLikesAward = allAwards.find(a => a.title === "Улюбленець");
    if (tenLikesAward && totalLikes >= 10 && !userAwardIds.includes(tenLikesAward._id.toString())) {
      user.awards.push(tenLikesAward._id);
      console.log(`🏆 Користувач ${userId} отримав нагороду: ${tenLikesAward.title}`);
    }

    // Нагорода за 50 лайків
    const fiftyLikesAward = allAwards.find(a => a.title === "Зірка");
    if (fiftyLikesAward && totalLikes >= 50 && !userAwardIds.includes(fiftyLikesAward._id.toString())) {
      user.awards.push(fiftyLikesAward._id);
      console.log(`🏆 Користувач ${userId} отримав нагороду: ${fiftyLikesAward.title}`);
    }

    await user.save();
  } catch (error) {
    console.error("❌ Помилка при видачі нагород:", error);
  }
}

// controllers/post.js
exports.createPost = async (req, res) => {
  try {
    console.log("📥 Прийшли файли:", req.files);
    console.log("📥 Body:", req.body);
    console.log("📥 User:", req.user);
    
    // Получаем загруженные файлы (локальные или S3)
    const files = req.files;
    let imageUrls = [];
    
    if (files && files.length > 0) {
      imageUrls = files.map((file) => {
        // Для локальных файлов используем path, для S3 используем location
        const imagePath = file.location || `/uploads/${file.filename}`;
        console.log(`📸 Файл: ${file.originalname} -> ${imagePath}`);
        return imagePath;
      });
    }

    console.log("✅ Загруженные изображения:", imageUrls);
    console.log("✅ Контент:", req.body.content);
    console.log("✅ Пользователь:", req.user);

    // Создаем пост с правильными полями согласно модели
    const postData = {
      user: req.user.id, // поле user (не author)
      content: req.body.content,
      imageUrls: imageUrls, // поле imageUrls (не images)
      enabled: true,
      likes: [], // массив строк, не число
      date: new Date() // поле date (не createdAt)
    };

    console.log("💾 Сохраняем постData:", postData);

    // Сохраняем в MongoDB
    const newPost = new Post(postData);
    await newPost.save();

    // Получаем созданный пост с populate
    const populatedPost = await Post.findById(newPost._id)
      .populate("user", "firstName lastName email avatarUrl");

    console.log("✅ Пост сохранен в БД:", populatedPost);

    // Перевіряємо та видаємо нагороди
    await checkAndGrantAwards(req.user.id);

    res.status(201).json({
      message: "Пост создан успешно",
      post: populatedPost
    });
    
  } catch (error) {
    console.error("❌ Ошибка создания поста:", error);
    res.status(500).json({
      error: "Ошибка при создании поста",
      details: error.message,
    });
  }
};

// Остальные методы остаются без изменений...
exports.updatePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (!post) {
        return res.status(404).json({
          message: `Post with id "${req.params.id}" is not found.`,
        });
      }

      if (!(req.user.isAdmin || String(req.user.id) === String(post.user))) {
        return res.status(403).json({
          message: `You don't have permission to perform this action.`,
        });
      }

      const postData = _.cloneDeep(req.body);
      const updatedPost = queryCreator(postData);

      Post.findOneAndUpdate(
        { user: req.user.id, _id: req.params.id },
        { $set: updatedPost },
        { new: true },
      )
        .populate("user", "firstName lastName email avatarUrl")
        .then((post) => res.json(post))
        .catch((err) =>
          res.status(400).json({
            message: `Error happened on server: "${err}" `,
          }),
        );
    })
    .catch((err) =>
      res.status(400).json({
        message: `Error happened on server: "${err}" `,
      }),
    );
};

exports.updatePostLikes = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id });
    
    if (!post) {
      return res.status(404).json({
        message: `Post with id "${req.params.id}" is not found.`,
      });
    }

    const likes = post.likes || [];
    const likeIndex = likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      likes.splice(likeIndex, 1);
    } else {
      likes.push(req.user.id);
    }
    
    const updatedPost = queryCreator({ likes });

    const updatedPostDoc = await Post.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updatedPost },
      { new: true },
    ).populate("user", "firstName lastName email avatarUrl");

    // Перевіряємо нагороди для автора поста (не того хто лайкає!)
    if (post.user) {
      await checkAndGrantAwards(post.user.toString());
    }

    res.json(updatedPostDoc);
  } catch (err) {
    res.status(400).json({
      message: `Error happened on server: "${err}" `,
    });
  }
};

exports.deletePost = (req, res, next) => {
  Post.findOne({ _id: req.params.id }).then((post) => {
    if (!post) {
      return res.status(404).json({
        message: `Post with id "${req.params.id}" is not found.`,
      });
    }

    if (!(req.user.isAdmin || String(req.user.id) === String(post.user))) {
      return res.status(403).json({
        message: `You don't have permission to perform this action.`,
      });
    }

    Post.deleteOne({ _id: req.params.id })
      .then((deletedCount) =>
        res.status(200).json({
          message: `Post is successfully deleted from DB`,
        }),
      )
      .catch((err) =>
        res.status(400).json({
          message: `Error happened on server: "${err}" `,
        }),
      );
  });
};

exports.getPostById = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .populate("user", "firstName lastName email avatarUrl")
    .then((post) => {
      if (!post) {
        return res.status(404).json({
          message: `Post with id "${req.params.id}" is not found.`,
        });
      } else {
        res.json(post);
      }
    })
    .catch((err) =>
      res.status(400).json({
        message: `Error happened on server: "${err}" `,
      }),
    );
};

exports.getPostsFilterParams = async (req, res, next) => {
  const mongooseQuery = filterParser(req.query);
  const perPage = Number(req.query.perPage) || 10;
  const startPage = Number(req.query.startPage) || 1;
  const sort = req.query.sort || "date";

  try {
    const posts = await Post.find(mongooseQuery)
      .skip(startPage * perPage - perPage)
      .limit(perPage)
      .sort(sort)
      .populate("user", "firstName lastName email avatarUrl");

    const postsQuantity = await Post.find(mongooseQuery);

    res.json({ posts, postsQuantity: postsQuantity.length });
  } catch (err) {
    res.status(400).json({
      message: `Error happened on server: "${err}" `,
    });
  }
};