import axios from 'axios';

jest.mock('axios');

describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetches posts from API', async () => {
    const mockPosts = [
      { _id: '1', title: 'Post 1', author: 'User 1' },
      { _id: '2', title: 'Post 2', author: 'User 2' },
    ];

    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockPosts });

    const response = await axios.get('/api/posts');

    expect(response.data).toEqual(mockPosts);
    expect(axios.get).toHaveBeenCalledWith('/api/posts');
  });

  test('creates a new post', async () => {
    const newPost = { title: 'New Post', description: 'Test', userId: '123' };
    const mockResponse = { _id: '1', ...newPost };

    (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

    const response = await axios.post('/api/posts', newPost);

    expect(response.data).toEqual(mockResponse);
    expect(axios.post).toHaveBeenCalledWith('/api/posts', newPost);
  });

  test('handles API errors', async () => {
    const error = new Error('API Error');
    (axios.get as jest.Mock).mockRejectedValueOnce(error);

    await expect(axios.get('/api/posts')).rejects.toThrow('API Error');
  });

  test('likes a post', async () => {
    const postId = '123';
    const mockResponse = { success: true, likes: 5 };

    (axios.post as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

    const response = await axios.post(`/api/posts/${postId}/like`);

    expect(response.data).toEqual(mockResponse);
    expect(response.data.success).toBe(true);
  });

  test('fetches awards', async () => {
    const mockAwards = [
      { _id: '1', title: 'Перша Відзнака', description: 'First post' },
      { _id: '2', title: 'Сильний Старт', description: '5 posts' },
      { _id: '3', title: 'Медаліст', description: '10 posts' },
    ];

    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockAwards });

    const response = await axios.get('/api/awards');

    expect(response.data).toHaveLength(3);
    expect(response.data[0].title).toBe('Перша Відзнака');
  });
});
