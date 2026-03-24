export const getToken = () => localStorage.getItem('token');
export const setToken = (token) => localStorage.setItem('token', token);
export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('student');
};
export const getStudent = () => JSON.parse(localStorage.getItem('student') || 'null');
export const setStudent = (s) => localStorage.setItem('student', JSON.stringify(s));
