const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const db = require('./config/keys').mongoURI;

const users = [
  {
    firstName: 'Іван',
    lastName: 'Петренко',
    login: 'ivanp',
    email: 'ivan@example.com',
    password: 'Password123!',
    gender: 'male',
    avatarUrl: '',
  },
  {
    firstName: 'Олена',
    lastName: 'Ковальчук',
    login: 'olenak',
    email: 'olena@example.com',
    password: 'Password123!',
    gender: 'female',
    avatarUrl: '',
  },
  {
    firstName: 'Максим',
    lastName: 'Сидоренко',
    login: 'maksym',
    email: 'maksym@example.com',
    password: 'Password123!',
    gender: 'male',
    avatarUrl: '',
  },
  {
    firstName: 'Дарина',
    lastName: 'Мельник',
    login: 'daryna',
    email: 'daryna@example.com',
    password: 'Password123!',
    gender: 'female',
    avatarUrl: '',
  },
  {
    firstName: 'Андрій',
    lastName: 'Шевченко',
    login: 'andriy',
    email: 'andriy@example.com',
    password: 'Password123!',
    gender: 'male',
    avatarUrl: '',
  },
  {
    firstName: 'Марія',
    lastName: 'Коваленко',
    login: 'maria',
    email: 'maria@example.com',
    password: 'Password123!',
    gender: 'female',
    avatarUrl: '',
  },
  {
    firstName: 'Тарас',
    lastName: 'Бондаренко',
    login: 'taras',
    email: 'taras@example.com',
    password: 'Password123!',
    gender: 'male',
    avatarUrl: '',
  },
  {
    firstName: 'Софія',
    lastName: 'Ткаченко',
    login: 'sofia',
    email: 'sofia@example.com',
    password: 'Password123!',
    gender: 'female',
    avatarUrl: '',
  },
  {
    firstName: 'Віктор',
    lastName: 'Лисенко',
    login: 'viktor',
    email: 'viktor@example.com',
    password: 'Password123!',
    gender: 'male',
    avatarUrl: '',
  },
  {
    firstName: 'Катерина',
    lastName: 'Іванова',
    login: 'kateryna',
    email: 'kateryna@example.com',
    password: 'Password123!',
    gender: 'female',
    avatarUrl: '',
  },
];

async function seed() {
  try {
    await mongoose.connect(db, { useNewUrlParser: true, useFindAndModify: false });
    console.log('MongoDB Connected');

    let created = 0;

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (exists) {
        console.log(`Skip: ${u.email} already exists`);
        continue;
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(u.password, salt);

      const user = new User({
        firstName: u.firstName,
        lastName: u.lastName,
        login: u.login,
        email: u.email,
        password: hash,
        gender: u.gender,
        avatarUrl: u.avatarUrl,
        enabled: true,
      });

      await user.save();
      console.log(`✅ Створено: ${u.firstName} ${u.lastName} (login: ${u.login}, password: ${u.password})`);
      created += 1;
    }

    console.log(`\n🎉 Готово! Створено ${created} користувачів.`);
    console.log('\n📋 Для входу використовуйте:');
    console.log('Login: будь-який з вище | Password: Password123!');
  } catch (e) {
    console.error('Seed error:', e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
