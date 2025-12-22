# Документация по использованию Axios в проекте FitForge

## Содержание
1. [Введение](#введение)
2. [Конфигурация Axios](#конфигурация-axios)
3. [Структура API сервиса](#структура-api-сервиса)
4. [Перехватчики запросов и ответов](#перехватчики-запросов-и-ответов)
5. [Вспомогательные функции для API операций](#вспомогательные-функции-для-api-операций)
6. [Структура эндпоинтов API](#структура-эндпоинтов-api)
7. [Примеры использования](#примеры-использования)

## Введение

В проекте FitForge для взаимодействия с сервером используется библиотека Axios. Axios - это популярная JavaScript библиотека, которая позволяет делать HTTP запросы из браузера или Node.js. В этой документации описано, как Axios настроен и используется в проекте.

## Конфигурация Axios

Axios настроен в файле `/src/api/api.ts`. Основная конфигурация включает:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:4000', // Базовый URL для всех запросов
  headers: {
    'Content-Type': 'application/json', // Тип контента по умолчанию
  },
});
```

Эта конфигурация создает экземпляр Axios с базовым URL и заголовками, которые будут использоваться для всех запросов.

## Структура API сервиса

API сервис организован в виде объекта `apiService`, который экспортируется из файла `/src/api/api.ts`. Этот объект предоставляет методы для выполнения основных HTTP операций:

- `get(url)` - для GET запросов
- `post(url, data)` - для POST запросов
- `put(url, data)` - для PUT запросов
- `delete(url)` - для DELETE запросов

Каждый метод возвращает данные из ответа сервера, обрабатывая Promise и извлекая `response.data`.

## Перехватчики запросов и ответов

### Перехватчик запросов

Перехватчик запросов используется для автоматического добавления токена аутентификации к каждому запросу:

```javascript
api.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage, если он существует
    const token = localStorage.getItem('token');
    
    // Если токен существует, добавляем его в заголовки
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

Этот перехватчик проверяет наличие токена в localStorage и, если токен найден, добавляет его в заголовок Authorization каждого запроса.

### Перехватчик ответов

Перехватчик ответов обрабатывает ошибки, которые могут возникнуть при выполнении запросов:

```javascript
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Обработка распространенных ошибок
    if (error.response) {
      // Запрос был сделан, и сервер ответил кодом состояния,
      // который выходит за пределы диапазона 2xx
      console.error('API Error:', error.response.data);
      
      // Обработка 401 Unauthorized - перенаправление на страницу входа
      if (error.response.status === 401) {
        // Очистка токена и перенаправление на страницу входа
        localStorage.removeItem('token');
        window.location.href = Quries.CLIENT.AUTH.LOGIN;
      }
    } else if (error.request) {
      // Запрос был сделан, но ответ не был получен
      console.error('Network Error:', error.request);
    } else {
      // Что-то произошло при настройке запроса, что вызвало ошибку
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);
```

Этот перехватчик обрабатывает различные типы ошибок:
- Ошибки ответа сервера (например, 401 Unauthorized)
- Ошибки сети (когда запрос был отправлен, но ответ не был получен)
- Ошибки настройки запроса

В случае ошибки 401 (Unauthorized), перехватчик автоматически удаляет токен из localStorage и перенаправляет пользователя на страницу входа.

## Вспомогательные функции для API операций

Объект `apiService` предоставляет следующие методы для работы с API:

```javascript
export const apiService = {
  // GET запрос
  get: async (url: string) => {
    const response = await api.get(url);
    return response.data;
  },
  
  // POST запрос
  post: async (url: string, data: any) => {
    const response = await api.post(url, data);
    return response.data;
  },
  
  // PUT запрос
  put: async (url: string, data: any) => {
    const response = await api.put(url, data);
    return response.data;
  },
  
  // DELETE запрос
  delete: async (url: string) => {
    const response = await api.delete(url);
    return response.data;
  }
};
```

Эти методы упрощают работу с API, автоматически извлекая данные из ответа и обрабатывая Promise.

## Структура эндпоинтов API

Эндпоинты API определены в файле `/src/api/quries.ts` в виде объекта `Quries`. Этот объект содержит два основных раздела:

1. `API` - содержит эндпоинты для взаимодействия с сервером
2. `CLIENT` - содержит клиентские маршруты для навигации

Раздел `API` организован по ресурсам:
- `USERS` - эндпоинты для работы с пользователями
- `AWARDS` - эндпоинты для работы с наградами
- `POSTS` - эндпоинты для работы с постами
- `COMMENTS` - эндпоинты для работы с комментариями

Каждый ресурс содержит методы для стандартных CRUD операций (создание, чтение, обновление, удаление).

Пример структуры для ресурса `USERS`:

```javascript
USERS: {
    REGISTER: "/api/users",
    LOGIN: "/api/users/login",
    UPDATE: "/api/users",
    UPDATE_PASSWORD: "/api/users/update-password",
    GET_BY_ID: (id: string) => `/api/users/${id}`,
    GET_ALL: "/api/users",
    ADD_AWARD: (awardId: string) => `/api/users/awards/${awardId}`,
    DELETE_AWARD: (awardId: string) => `/api/users/awards/${awardId}`,
    ADD_FOLLOWER: (userId: string) => `/api/users/followers/${userId}`,
    DELETE_FOLLOWER: (userId: string) => `/api/users/followers/${userId}`,
},
```

## Примеры использования

### Пример авторизации пользователя

```javascript
const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
        const data = await apiService.post(Quries.API.USERS.LOGIN, {
            loginOrEmail: formData.email,
            password: formData.password
        });

        if (data.token) {
            localStorage.setItem('token', data.token);
            toast.success('Login successful!');
            window.location.href = ROUTS.HOME;
        } else {
            toast.error('Login failed. No token received.');
        }
    } catch (error) {
        console.error('Login error:', error);
        toast.error('Login failed. Please check your credentials.');
    } finally {
        setIsLoading(false);
    }
}
```

### Пример получения данных

```javascript
const fetchUserData = async (userId) => {
    try {
        const userData = await apiService.get(Quries.API.USERS.GET_BY_ID(userId));
        setUser(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
    }
};
```

### Пример обновления данных

```javascript
const updateUserProfile = async (profileData) => {
    try {
        const updatedUser = await apiService.put(Quries.API.USERS.UPDATE, profileData);
        setUser(updatedUser);
        toast.success('Profile updated successfully');
    } catch (error) {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
    }
};
```

### Пример удаления данных

```javascript
const deletePost = async (postId) => {
    try {
        await apiService.delete(Quries.API.POSTS.DELETE(postId));
        // Обновление списка постов после удаления
        fetchPosts();
        toast.success('Post deleted successfully');
    } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
    }
};
```

Эти примеры демонстрируют, как использовать `apiService` для выполнения различных операций с API.