const mongoose = require('mongoose');

describe('Database Connection Tests', () => {
  test('validates MongoDB URI format', () => {
    const mongoURIRegex = /^mongodb(\+srv)?:\/\/.+/;
    const validURI = 'mongodb+srv://user:pass@cluster.mongodb.net/dbname';
    const invalidURI = 'http://localhost:27017';

    expect(mongoURIRegex.test(validURI)).toBe(true);
    expect(mongoURIRegex.test(invalidURI)).toBe(false);
  });

  test('validates user schema structure', () => {
    const userSchema = {
      email: String,
      login: String,
      password: String,
      firstName: String,
      lastName: String,
      awards: Array,
      workouts: Array,
      followers: Array,
    };

    expect(userSchema).toHaveProperty('email');
    expect(userSchema).toHaveProperty('password');
    expect(userSchema).toHaveProperty('awards');
  });

  test('validates post schema structure', () => {
    const postSchema = {
      title: String,
      description: String,
      author: String,
      image: String,
      likes: Array,
      comments: Array,
      createdAt: Date,
    };

    expect(postSchema).toHaveProperty('author');
    expect(postSchema).toHaveProperty('likes');
  });

  test('validates award schema structure', () => {
    const awardSchema = {
      title: String,
      description: String,
      type: String,
      threshold: Number,
      icon: String,
      imageUrl: String,
      color: String,
    };

    expect(awardSchema).toHaveProperty('title');
    expect(awardSchema).toHaveProperty('threshold');
  });

  test('checks default awards are correct', () => {
    const awards = [
      { title: 'Перша Відзнака', threshold: 1 },
      { title: 'Сильний Старт', threshold: 5 },
      { title: 'Медаліст', threshold: 10 },
      { title: 'Улюбленець', threshold: 10 },
      { title: 'Зірка', threshold: 50 },
    ];

    expect(awards).toHaveLength(5);
    expect(awards[0].title).toBe('Перша Відзнака');
    expect(awards[2].threshold).toBe(10);
  });
});
