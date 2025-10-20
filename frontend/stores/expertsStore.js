import { defineStore } from 'pinia'

export const useExpertsStore = defineStore('experts', {
  state: () => ({
    experts: process.client ? JSON.parse(localStorage.getItem('experts') || '[]') : [],
    currentExpert: process.client ? JSON.parse(localStorage.getItem('currentExpert') || 'null') : null,
    loading: false
  }),

  actions: {
    async addExpert(expert) {
      this.loading = true
      
      try {
        console.log('📤 Отправка данных на сервер...', expert);
        
        const response = await $fetch('http://localhost:4000/experts', {
          method: 'POST',
          body: expert
        })

        console.log('✅ Ответ от сервера:', response);
        
        // Сохраняем в локальное состояние
        this.experts.push(response)
        
        if (process.client) {
          localStorage.setItem('experts', JSON.stringify(this.experts))
        }

        return response
        
      } catch (error) {
        console.error('💥 Ошибка при создании эксперта:', error);
        
        // Fallback: сохраняем локально
        console.log('🔄 Сохранение локально...');
        const localExpert = {
          ...expert,
          id: Date.now().toString(),
          rating: 0,
          totalSessions: 0,
          adminVerified: false,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.experts.push(localExpert)
        
        if (process.client) {
          localStorage.setItem('experts', JSON.stringify(this.experts))
        }
        
        return localExpert;
      } finally {
        this.loading = false
      }
    },

    async loginExpert(loginData) {
      this.loading = true;
      try {
        const response = await $fetch('http://localhost:4000/experts/login', {
          method: 'POST',
          body: loginData
        });
        
        this.setCurrentExpert(response);
        return response;
      } catch (error) {
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setCurrentExpert(expert) {
      this.currentExpert = expert;
      if (process.client) {
        localStorage.setItem('currentExpert', JSON.stringify(expert));
      }
    },

    logoutExpert() {
      this.currentExpert = null;
      if (process.client) {
        localStorage.removeItem('currentExpert');
      }
    },

    async updateExpertProfile(expertId, updateData) {
      try {
        console.log('📡 Отправка обновления на сервер...', { expertId, updateData });
        
        // Используем POST эндпоинт для обновления
        const response = await $fetch(`http://localhost:4000/experts/${expertId}/update`, {
          method: 'POST',
          body: updateData
        });

        console.log('✅ Ответ от сервера:', response);
        
        // Обновляем локальное состояние
        const index = this.experts.findIndex(e => e.id === expertId);
        if (index !== -1) {
          this.experts[index] = { ...this.experts[index], ...response };
        }
        
        // Обновляем текущего эксперта если это он
        if (this.currentExpert && this.currentExpert.id === expertId) {
          this.currentExpert = { ...this.currentExpert, ...response };
          if (process.client) {
            localStorage.setItem('currentExpert', JSON.stringify(this.currentExpert));
          }
        }
        
        // Сохраняем в localStorage
        if (process.client) {
          localStorage.setItem('experts', JSON.stringify(this.experts));
        }

        return response;
      } catch (error) {
        console.error('❌ Ошибка обновления профиля:', error);
        
        // Fallback: локальное сохранение
        const index = this.experts.findIndex(e => e.id === expertId);
        if (index !== -1) {
          this.experts[index] = { ...this.experts[index], ...updateData };
          if (process.client) {
            localStorage.setItem('experts', JSON.stringify(this.experts));
          }
        }
        
        throw error;
      }
    },

    async requestModeration(expertId) {
      try {
        console.log('📋 Запрос модерации для эксперта:', expertId);
        
        const response = await $fetch(`http://localhost:4000/experts/${expertId}/moderation`, {
          method: 'POST'
        });

        console.log('✅ Ответ на запрос модерации:', response);
        
        // Обновляем локальное состояние
        const index = this.experts.findIndex(e => e.id === expertId);
        if (index !== -1) {
          this.experts[index] = { ...this.experts[index], ...response };
        }
        
        if (this.currentExpert && this.currentExpert.id === expertId) {
          this.currentExpert = { ...this.currentExpert, ...response };
          if (process.client) {
            localStorage.setItem('currentExpert', JSON.stringify(this.currentExpert));
          }
        }
        
        if (process.client) {
          localStorage.setItem('experts', JSON.stringify(this.experts));
        }

        return response;
      } catch (error) {
        console.error('❌ Ошибка запроса модерации:', error);
        throw error;
      }
    },

    async syncWithServer() {
      try {
        const response = await $fetch('http://localhost:4000/experts')
        
        // Обновляем локальное состояние данными с сервера
        this.experts = response.map(serverExpert => {
          const localExpert = this.experts.find(e => e.id === serverExpert.id);
          
          // Объединяем данные: приоритет у серверных, но сохраняем локальные reviews и sessions если они есть
          return {
            ...serverExpert,
            reviews: localExpert?.reviews || serverExpert.reviews || [],
            sessions: localExpert?.sessions || serverExpert.sessions || []
          };
        });
        
        if (process.client) {
          localStorage.setItem('experts', JSON.stringify(this.experts));
        }
      } catch (error) {
        console.error('Ошибка синхронизации с сервером:', error);
        
        // Fallback: используем локальные данные
        if (process.client) {
          const localExperts = localStorage.getItem('experts');
          if (localExperts) {
            this.experts = JSON.parse(localExperts);
          }
        }
      }
    },

    getExpertById(id) {
      return this.experts.find(e => e.id == id);
    },

    // Новый метод для получения экспертов по статусу (для админ-панели)
    getExpertsByStatus(status) {
      return this.experts.filter(expert => expert.status === status);
    },

    // Метод для получения ожидающих модерации экспертов
    getPendingExperts() {
      return this.experts.filter(expert => expert.status === 'pending');
    },

    // Метод для получения активных экспертов
    getActiveExperts() {
      return this.experts.filter(expert => expert.status === 'active');
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.currentExpert,
    
    // Новые геттеры для удобства
    currentExpertId: (state) => state.currentExpert?.id,
    
    isCurrentExpertAdminVerified: (state) => state.currentExpert?.adminVerified || false,
    
    // Геттер для проверки, может ли текущий эксперт редактировать профиль
    canEditProfile: (state) => {
      if (!state.currentExpert) return false;
      
      // Эксперт может редактировать свой профиль если:
      // - статус 'draft' (черновик)
      // - статус 'active' (активный)
      // - статус 'pending' (ожидает модерации)
      const editableStatuses = ['draft', 'active', 'pending'];
      return editableStatuses.includes(state.currentExpert.status);
    }
  }
});