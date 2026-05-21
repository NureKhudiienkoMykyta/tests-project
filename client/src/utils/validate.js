export const validatePassword = (password) => {
  const passwordRegex = /^[\w]{8,16}$/;
  return passwordRegex.test(password);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isNotEmpty = (value) => {
  return value.trim().length > 0;
};
