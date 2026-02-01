export const validateEmail = (email: string) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
  return re.test(String(email).trim());
};

export const validatePassword = (password: string, opts: { min?: number; max?: number } = {}) => {
  const min = opts.min ?? 7;
  const max = opts.max ?? 30;
  const re = /^[a-zA-Z0-9]+$/;
  return (
    typeof password === 'string' &&
    re.test(password) &&
    password.length >= min &&
    password.length <= max
  );
};

export const validateName = (name: string) => {
  const nameRegex = /^[a-zA-Zа-яА-ЯІіЇїЄєҐґ]+$/;
  return !!name && nameRegex.test(name.trim());
};

export const validateLogin = (login: string) => {
  // латиница и цифры, 3..20 символов
  const re = /^[a-zA-Z0-9]{3,20}$/;
  return re.test(login.trim());
};

export const validatePostContent = (content: string) => {
  return content.trim().length > 0;
};

export const validateImageSize = (file: File, maxMB = 5) => {
  return file.size <= maxMB * 1024 * 1024;
};
