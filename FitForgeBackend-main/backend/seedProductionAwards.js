const mongoose = require('mongoose');
const Award = require('./models/Award');

// Подключение к production MongoDB Atlas
const mongoURI = "mongodb+srv://Chenk:zidetlive1431@fitforge-prod.8vp9mz8.mongodb.net/fitforge_db?retryWrites=true&w=majority&authSource=admin";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', async () => {
  console.log('Connected to production MongoDB Atlas');

  const awards = [
    {
      title: "Перша Відзнака",
      description: "Створив свій перший пост!",
      type: "achievement",
      threshold: 1,
      icon: "Badge",
      imageUrl: "../awardsImg/badge-svgrepo-com.svg",
      content: "Нагорода за перший пост - Ви створили свій перший пост!",
      color: "green"
    },
    {
      title: "Сильний Старт",
      description: "Створив 5 постів!",
      type: "achievement",
      threshold: 5,
      icon: "FlexedBiceps",
      imageUrl: "../awardsImg/flexed-biceps-medium-light-skin-tone-svgrepo-com.svg",
      content: "Сильний старт - Ви створили 5 постів!",
      color: "purple"
    },
    {
      title: "Медаліст",
      description: "Створив 10 постів!",
      type: "achievement",
      threshold: 10,
      icon: "Medal",
      imageUrl: "../awardsImg/medal-svgrepo-com.svg",
      content: "Медаліст - Ви створили 10 постів!",
      color: "gold"
    },
    {
      title: "Улюбленець",
      description: "Отримав 10 лайків на своїх постах!",
      type: "likes",
      threshold: 10,
      icon: "AlarmClock",
      imageUrl: "../awardsImg/alarm-clock-time-svgrepo-com.svg",
      content: "Улюбленець - Ви отримали 10 лайків!",
      color: "blue"
    },
    {
      title: "Зірка",
      description: "Отримав 50 лайків на своїх постах!",
      type: "likes",
      threshold: 50,
      icon: "Fire",
      imageUrl: "../awardsImg/fire-svgrepo-com.svg",
      content: "Зірка - Ви отримали 50 лайків!",
      color: "orange"
    }
  ];

  try {
    // Видаляємо старі нагороди
    await Award.deleteMany({});
    console.log('Deleted old awards');

    // Додаємо нові
    for (const award of awards) {
      const existingAward = await Award.findOne({ title: award.title });
      if (!existingAward) {
        await Award.create(award);
        console.log(`✓ Created award: ${award.title}`);
      } else {
        console.log(`⚠ Award already exists: ${award.title}`);
      }
    }

    console.log('✓ All awards successfully initialized in production!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
});
