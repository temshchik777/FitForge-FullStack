export const Quries = {
    API: {
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
        UPLOAD: {
            IMAGES: "/api/upload/images",
            DELETE_IMAGE: "/api/upload/delete",
        },
        COMMENTS: {
            CREATE: "/api/comments",
            UPDATE: (id: string) => `/api/comments/${id}`,
            DELETE: (id: string) => `/api/comments/${id}`,
            GET_ALL: "/api/comments",
            GET_BY_USER: (userId: string) => `/api/comments/user/${userId}`,
            GET_BY_POST: (postId: string) => `/api/comments/post/${postId}`,
        },
    },

    CLIENT: {
        HOME: "/",
        AUTH: {
            LOGIN: "/login",
            REGISTER: "/register",
            FORGOT_PASSWORD: "/forgot-password",
        },
        PROFILE: {
            DASHBOARD: "/profile",
            SETTINGS: "/profile/settings",
            FOLLOWERS: "/profile/followers",
            POSTS: "/profile/posts",
            AWARDS: "/profile/awards",
        },
        USERS: {
            LIST: "/users",
            DETAIL: (id: string) => `/users/${id}`,
        },
        POSTS: {
            LIST: "/posts",
            DETAIL: (id: string) => `/posts/${id}`,
            CREATE: "/posts/create",
            EDIT: (id: string) => `/posts/${id}/edit`,
        },
        AWARDS: {
            LIST: "/awards",
            DETAIL: (id: string) => `/awards/${id}`,
        },
        ADMIN: {
            DASHBOARD: "/admin",
            USERS: "/admin/users",
            POSTS: "/admin/posts",
            AWARDS: "/admin/awards",
            AWARDS_CREATE: "/admin/awards/create",
            AWARDS_EDIT: (id: string) => `/admin/awards/${id}/edit`,
        },
        ABOUT: "/about",
        CONTACT: "/contact",
    },
};