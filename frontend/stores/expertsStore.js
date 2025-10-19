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
        const localExpert = {
          ...response
        }
        
        this.experts.push(localExpert)
        
        if (process.client) {
          localStorage.setItem('experts', JSON.stringify(this.experts))
        }

        return localExpert
        
      } catch (error) {
        console.error('💥 Ошибка при создании эксперта:', error);
        
        // Fallback: сохраняем локально
        console.log('🔄 Сохранение локально...');
        const localExpert = {
          ...expert,
          id: Date.now().toString(),
          rating: 0,
          totalSessions: 0,
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
    
    // Используем POST вместо PATCH
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
    console.error('❌ Ошибка обновления профиля:', error);
    throw error;
  }
},
    async syncWithServer() {
      try {
        const response = await $fetch('http://localhost:4000/experts')
        // Объединяем с локальными данными
        this.experts = response.map(serverExpert => {
          const localExpert = this.experts.find(e => e.id === serverExpert.id)
          return {
            ...serverExpert,
            // Сохраняем локальные поля если они есть
            reviews: localExpert?.reviews || [],
            sessions: localExpert?.sessions || []
          }
        })
        
        if (process.client) {
          localStorage.setItem('experts', JSON.stringify(this.experts))
        }
      } catch (error) {
        console.error('Ошибка синхронизации с сервером:', error)
      }
    },

    getExpertById(id) {
      return this.experts.find(e => e.id == id)
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.currentExpert,
  }
})