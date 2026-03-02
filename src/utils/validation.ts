export const validatePhone = (phone: string) => {
  // Ethiopian phone number: 10 digits, starting with 07 or 09
  const regex = /^(07|09)\d{8}$/;
  return regex.test(phone);
};

export const validateName = (name: string) => {
  // Letters, spaces, dots, and hyphens
  const regex = /^[A-Za-z\s\.\-]+$/;
  return regex.test(name);
};

export const validateBirthDate = (date: string) => {
  if (!date) return false;
  const selectedDate = new Date(date);
  const today = new Date();
  return selectedDate <= today;
};

export const validateRequired = (value: any) => {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
};
