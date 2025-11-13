import { defineStore } from 'pinia'

export const useExpertsStore = defineStore('experts', {
  state: () => ({
    experts: process.client ? JSON.parse(localStorage.getItem('experts') || '[]') : [],
    currentExpert: process.client ? JSON.parse(localStorage.getItem('currentExpert') || 'null') : null,
    loading: false
  }),

  actions: {
    async addExpert(expert) {
      this.loading = true;
      
      try {
        console.log('📤 Отправка данных на сервер...', expert);

        if (!expert.paymentCode) {
          console.warn('⚠️ paymentCode отсутствует, генерируем локально');
          const randomDigits = Math.floor(100 + Math.random() * 900);
          expert.paymentCode = `${expert.login}${randomDigits}`;
        }

        const response = await $fetch('http://localhost:4000/experts', {
          method: 'POST',
          body: expert
        });

        console.log('✅ Ответ от сервера:', response);

        this.experts.push(response);

        if (process.client) {
          localStorage.setItem('experts', JSON.stringify(this.experts));
        }

        return response;
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
        };

        this.experts.push(localExpert);

        if (process.client) {
          localStorage.setItem('experts', JSON.stringify(this.experts));
        }

        return localExpert;
      } finally {
        this.loading = false;
      }
    },

   
    async addExpertWithFiles(formData) {
      this.loading = true;
      
      try {
        console.log('📤 Отправка данных с файлами на сервер...');

        const response = await $fetch('http://localhost:4000/experts/with-files', {
          method: 'POST',
          body: formData
        });

        console.log('✅ Эксперт создан с файлами:', response);

        this.experts.push(response);

        if (process.client) {
          localStorage.setItem('experts', JSON.stringify(this.experts));
        }

        return response;
      } catch (error) {
        console.error('💥 Ошибка при создании эксперта с файлами:', error);
        
        // Fallback: сохраняем локально без файлов
        console.log('🔄 Сохранение локально без файлов...');
        const expertData = {
          login: formData.get('login'),
          password: formData.get('password'),
          name: formData.get('name'),
          age: parseInt(formData.get('age')),
          gender: formData.get('gender'),
          availability: formData.get('availability'),
          about: formData.get('about'),
          telegram: formData.get('telegram'),
          otherMessengers: formData.get('otherMessengers'),
          allowedTopics: formData.get('allowedTopics'),
          forbiddenTopics: formData.get('forbiddenTopics'),
          price: parseFloat(formData.get('price')),
          adultTopics: formData.get('adultTopics') === 'true',
          noForbiddenTopics: formData.get('noForbiddenTopics') === 'true',
          paymentCode: formData.get('paymentCode'),
          status: 'pending',
          alwaysAvailable: formData.get('alwaysAvailable') === 'true',
          // verifiedExpert: formData.get('') === 'true',
        };

        return await this.addExpert(expertData);
      } finally {
        this.loading = false;
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
        
        const response = await $fetch(`http://localhost:4000/experts/${expertId}/update`, {
          method: 'POST',
          body: updateData
        });

        console.log('✅ Ответ от сервера:', response);
        
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
        
        this.experts = response.map(serverExpert => {
          const localExpert = this.experts.find(e => e.id === serverExpert.id);
          
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

    getExpertsByStatus(status) {
      return this.experts.filter(expert => expert.status === status);
    },

    getPendingExperts() {
      return this.experts.filter(expert => expert.status === 'pending');
    },

    getActiveExperts() {
      return this.experts.filter(expert => expert.status === 'active');
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.currentExpert,
    currentExpertId: (state) => state.currentExpert?.id,
    isCurrentExpertAdminVerified: (state) => state.currentExpert?.adminVerified || false,
    canEditProfile: (state) => {
      if (!state.currentExpert) return false;
      const editableStatuses = ['draft', 'active', 'pending'];
      return editableStatuses.includes(state.currentExpert.status);
    }
  }
});