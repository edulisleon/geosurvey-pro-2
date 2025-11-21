import { User, UserRole } from '../types';

const USERS_KEY = 'geo_users';
const CURRENT_USER_KEY = 'geo_current_user';

// Initialize with Default Admin if no users exist
const initAuth = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    const defaultAdmin: User = {
      username: 'admin',
      password: 'admin123',
      role: UserRole.ADMIN,
      fullName: 'Administrador Principal',
      isFirstLogin: false,
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([defaultAdmin]));
  }
};

export const getUsers = (): User[] => {
  initAuth();
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const createUser = (newUser: User): boolean => {
  const users = getUsers();
  if (users.find(u => u.username === newUser.username)) {
    return false; // User exists
  }
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
};

export const deleteUser = (username: string): void => {
  let users = getUsers();
  users = users.filter(u => u.username !== username);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const login = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }
  return null;
};

export const logout = (): void => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(CURRENT_USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const changePassword = (username: string, newPass: string): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.username === username);
  if (index !== -1) {
    users[index].password = newPass;
    users[index].isFirstLogin = false; // Mark as initialized
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Update current session if needed
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.username === username) {
      currentUser.password = newPass;
      currentUser.isFirstLogin = false;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
  }
};