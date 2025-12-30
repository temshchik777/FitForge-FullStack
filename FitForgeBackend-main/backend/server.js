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

// CORS должен быть первым
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// Connect to MongoDB
mongoose
  .connect(db, { useNewUrlParser: true, useFindAndModify: false })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

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

//  static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

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


