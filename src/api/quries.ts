export const Quries = {
  API: {
    USERS: {
      REGISTER: "/api/users",
      LOGIN: "/api/users/login",
      UPDATE: "/api/users",
      UPDATE_PASSWORD: "/api/users/update-password",
      GET_CURRENT: "/api/users/current",
      GET_BY_ID: (id: string) => `/api/users/${id}`,
      GET_ALL: "/api/users",
      ADD_AWARD: (awardId: string) => `/api/users/awards/${awardId}`,
      DELETE_AWARD: (awardId: string) => `/api/users/awards/${awardId}`,
      ADD_FOLLOWER: (userId: string) => `/api/users/followers/${userId}`,
      DELETE_FOLLOWER: (userId: string) => `/api/users/followers/${userId}`,
      SAVE_POST: (postId: string) => `/api/users/saved/${postId}`,
      UNSAVE_POST: (postId: string) => `/api/users/saved/${postId}`,
      GET_SAVED_POSTS: "/api/users/saved",
    },
    AWARDS: {
      CREATE: "/api/awards",
      UPDATE: (id: string) => `/api/awards/${id}`,
      DELETE: (id: string) => `/api/awards/${id}`,
      GET_ALL: "/api/awards",
      GET_BY_ID: (id: string) => `/api/awards/${id}`,
    },
    POSTS: {
      CREATE: "/api/posts",
      UPDATE: (id: string) => `/api/posts/${id}`,
      UPDATE_LIKES: (id: string) => `/api/posts/${id}`,
      DELETE: (id: string) => `/api/posts/${id}`,
      GET_ALL: "/api/posts",
      GET_BY_ID: (id: string) => `/api/posts/${id}`,
    },
    COMMENTS: {
      CREATE: "/api/comments",
      UPDATE: (id: string) => `/api/comments/${id}`,
      DELETE: (id: string) => `/api/comments/${id}`,
      GET_ALL: "/api/comments",
      GET_BY_USER: (userId: string) => `/api/comments/user/${userId}`,
      GET_BY_POST: (postId: string) => `/api/comments/post/${postId}`,
    },
    UPLOAD: {
      IMAGES: "/api/files/upload",
      DELETE_IMAGE: "/api/files/delete",
    },
  },
  CLIENT: {
    AUTH: {
      LOGIN: "/login",
      REGISTER: "/register",
    },
    PROFILE: {
      HOME: "/profile",
      SETTINGS: "/settings",
    },
  },
};