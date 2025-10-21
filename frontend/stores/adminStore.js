import { defineStore } from 'pinia'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    isAuthenticated: process.client ? localStorage.getItem('adminAuthenticated') === 'true' : false,
    loginTime: process.client ? localStorage.getItem('adminLoginTime') : null,
    loading: false
  }),

  actions: {
    async login(loginData) {
      this.loading = true;
      try {
        // Проверяем credentials
        if (loginData.login === 'conversation_admin' && loginData.password === '111') {
          this.isAuthenticated = true;
          this.loginTime = new Date().toISOString();
          
          // Сохраняем в localStorage
          if (process.client) {
            localStorage.setItem('adminAuthenticated', 'true');
            localStorage.setItem('adminLoginTime', this.loginTime);
          }
          
          return true;
        } else {
          throw new Error('Неверный логин или пароль');
        }
      } catch (error) {
        this.isAuthenticated = false;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.isAuthenticated = false;
      this.loginTime = null;
      if (process.client) {
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminLoginTime');
      }
    },

    checkAuth() {
      if (process.server) return false;

      const auth = localStorage.getItem('adminAuthenticated');
      const loginTime = localStorage.getItem('adminLoginTime');
      
      if (auth === 'true' && loginTime) {
        const loginDate = new Date(loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 8) {
          this.isAuthenticated = true;
          this.loginTime = loginTime;
          return true;
        } else {
          this.logout();
        }
      }
      return false;
    }
  },

  getters: {
    isAuth: (state) => state.isAuthenticated
  }
});