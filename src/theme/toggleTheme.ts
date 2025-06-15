export const toggleTheme = () => {
  const isDark = document.documentElement.classList.contains('dark');
  const newTheme = !isDark;
  
  document.documentElement.classList.toggle('dark', newTheme);
  localStorage.setItem('theme', newTheme ? 'dark' : 'light');
};
