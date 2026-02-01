const mongoose = require('mongoose');
const Award = require('./models/Award');
const keys = require('./config/keys');

// Підключення до MongoDB
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.once('open', async () => {
  

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
   

    // Додаємо нові
    for (const award of awards) {
      const existingAward = await Award.findOne({ title: award.title });
      if (!existingAward) {
        await Award.create(award);
       
      } else {
       
      }
    }

    console.log(' Всі нагороди успішно ініціалізовано!');
    process.exit(0);
  } catch (error) {
    console.error(' Помилка:', error);
    process.exit(1);
  }
});
