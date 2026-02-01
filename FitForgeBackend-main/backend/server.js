const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const globalConfigs = require('./routes/globalConfigs');
const users = require('./routes/user');
const posts = require('./routes/post');
const comments = require('./routes/comments');
const awards = require('./routes/awards');
const cors = require('cors');

const app = express();

// CORS повинен бути першим 
app.use(cors({
  origin: (origin, callback) => {
     // Дозволяємо запити з localhost і 127.0.0.1 для середовища розробки на портах 5173/5174
    const allowedOrigins = [/^http:\/\/localhost:517[3-4]$/, /^http:\/\/127\.0\.0\.1:517[3-4]$/];

    // Дозволені продакшн-домени з ENV 
    const envFrontend1 = process.env.FRONTEND_URL || null;
    const envFrontend2 = process.env.FRONTEND_URL_2 || null;
    const envRegex = process.env.FRONTEND_URL_REGEX || null; // опциональный regex
    const allowedStaticOrigins = [envFrontend1, envFrontend2].filter(Boolean);

    if (!origin) return callback(null, true); // allow same-origin or curl

    // Dev localhost
    if (allowedOrigins.some((re) => re.test(origin))) {
      return callback(null, true);
    }

    // ENV-списки 
    if (allowedStaticOrigins.includes(origin)) {
      return callback(null, true);
    }

    // ENV-regex
    if (envRegex) {
      try {
        const re = new RegExp(envRegex);
        if (re.test(origin)) return callback(null, true);
      } catch (e) {
       
      }
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Multer configuration for file uploads
const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/files', uploadRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Config
const db = require('./config/keys').mongoURI;
const Award = require('./models/Award');

// Функция для инициализации наград
async function initializeAwards() {
  try {
    const awardsCount = await Award.countDocuments();
    if (awardsCount === 0) {
      console.log('[INIT] No awards found. Creating default awards...');
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
      
      await Award.insertMany(awards);
      console.log('[INIT] ✓ Successfully created 5 default awards');
    } else {
      console.log(`[INIT] ✓ Found ${awardsCount} awards in database`);
    }
  } catch (error) {
    console.error('[INIT] Error initializing awards:', error.message);
  }
}

// Connect to MongoDB with improved settings
mongoose
  .connect(db, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    minPoolSize: 2,
    retryWrites: true,
    retryReads: true
  })
  .then(async () => {
    console.log('MongoDB Connected');
    // Инициализируем награды после успешного подключения
    await initializeAwards();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Не завершаємо процес: сервер продолжит работать без підключення до БД
  });

// Обработка ошибок подключения после инициализации
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// Use Routes
app.use('/api/configs', globalConfigs);
app.use('/api/users', users);
app.use('/api/posts', posts);
app.use('/api/comments', comments);
app.use('/api/awards', awards);


// //  static assets if in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static('client/build'));

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
//   });
// }

// У продакшні не роздаємо клієнтський білд із backend
// Фронтенд деплоїться окремо Vercel тому цей блок закоментований


// Обработка ошибок multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err && err.message.includes('изображения')) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

const port = process.env.PORT || 4000;

app.listen(port, () => console.log(` running on port ${port}`));


