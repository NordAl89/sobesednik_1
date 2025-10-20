import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expert } from './entities/expert.entity';
import { CreateExpertDto } from './dto/create-expert.dto';

@Injectable()
export class ExpertsService {
  constructor(
    @InjectRepository(Expert)
    private expertsRepository: Repository<Expert>,
  ) {}

  // Создание эксперта
  async create(createExpertDto: CreateExpertDto): Promise<Expert> {
    console.log('🎯 Создание эксперта с данными:', createExpertDto);

    // Проверяем уникальность логина
    const existingExpertByLogin = await this.expertsRepository.findOne({
      where: { login: createExpertDto.login }
    });

    if (existingExpertByLogin) {
      throw new ConflictException('Эксперт с таким логином уже существует');
    }

    // Создаем эксперта вручную
    const expert = new Expert();
    expert.login = createExpertDto.login;
    expert.password = createExpertDto.password;
    expert.name = createExpertDto.name;
    expert.age = createExpertDto.age;
    expert.availability = createExpertDto.availability;
    expert.about = createExpertDto.about || '';
    expert.allowedTopics = createExpertDto.allowedTopics || '';
    expert.forbiddenTopics = createExpertDto.forbiddenTopics || '';
    expert.price = createExpertDto.price;
    expert.telegram = createExpertDto.telegram;
    expert.otherMessengers = createExpertDto.otherMessengers || '';
    expert.adultTopics = createExpertDto.adultTopics || false;
    expert.noForbiddenTopics = createExpertDto.noForbiddenTopics || false;
    
    // Исправляем статус - приводим к правильному типу
    const validStatus = this.getValidStatus(createExpertDto.status);
    expert.status = validStatus;
    
    const savedExpert = await this.expertsRepository.save(expert);
    
    console.log('✅ Эксперт создан. ID:', savedExpert.id);
    return savedExpert;
  }

  // Создание эксперта с файлами
  async createWithFiles(
    createExpertDto: any, 
    mainPhoto: Express.Multer.File, 
    galleryFiles: Express.Multer.File[]
  ): Promise<Expert> {
    console.log('🎯 Создание эксперта с файлами:', createExpertDto);

    // Проверяем уникальность логина
    const existingExpertByLogin = await this.expertsRepository.findOne({
      where: { login: createExpertDto.login }
    });

    if (existingExpertByLogin) {
      throw new ConflictException('Эксперт с таким логином уже существует');
    }

    // Создаем эксперта
    const expert = new Expert();
    expert.login = createExpertDto.login;
    expert.password = createExpertDto.password;
    expert.name = createExpertDto.name;
    expert.age = createExpertDto.age;
    expert.availability = createExpertDto.availability;
    expert.about = createExpertDto.about || '';
    expert.telegram = createExpertDto.telegram;
    expert.otherMessengers = createExpertDto.otherMessengers || '';
    expert.allowedTopics = createExpertDto.allowedTopics || '';
    expert.forbiddenTopics = createExpertDto.forbiddenTopics || '';
    expert.price = createExpertDto.price;
    expert.adultTopics = createExpertDto.adultTopics || false;
    expert.noForbiddenTopics = createExpertDto.noForbiddenTopics || false;
    expert.paymentCode = createExpertDto.paymentCode;
    
    // Исправляем статус - для анкет с оплатой ставим 'pending'
    expert.status = 'pending';
    
    // Сохраняем пути к файлам
    if (mainPhoto) {
      expert.mainPhotoUrl = `/uploads/${mainPhoto.filename}`;
    }
    
    if (galleryFiles && galleryFiles.length > 0) {
      const galleryUrls = galleryFiles.map(file => `/uploads/${file.filename}`);
      expert.galleryUrls = JSON.stringify(galleryUrls);
    }
    
    const savedExpert = await this.expertsRepository.save(expert);
    console.log('✅ Эксперт создан с файлами. ID:', savedExpert.id);
    
    return savedExpert;
  }

  // Валидация эксперта для входа
  async validateExpert(login: string, password: string): Promise<Expert | null> {
    console.log('🔐 Попытка входа:', { login, password })
    
    const expert = await this.expertsRepository.findOne({ 
      where: { login } 
    });
    
    console.log('👤 Найденный эксперт:', expert)
    
    if (expert) {
      console.log('🔑 Проверка пароля:', {
        введенныйПароль: password,
        парольВБазе: expert.password,
        совпадают: expert.password === password
      })
    }
    
    if (expert && expert.password === password) {
      console.log('✅ Пароль верный')
      return expert;
    }
    
    console.log('❌ Неверный логин или пароль')
    return null;
  }

  // Получение профиля эксперта (без чувствительных данных)
  async getProfile(id: string): Promise<Expert> {
    const expert = await this.expertsRepository.findOne({ where: { id } });
    if (!expert) {
      throw new NotFoundException('Эксперт не найден');
    }
    return expert;
  }

  // Получение всех экспертов
  async findAll(): Promise<Expert[]> {
    return await this.expertsRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  // Получение одного эксперта по ID
  async findOne(id: string): Promise<Expert> {
    const expert = await this.expertsRepository.findOne({ where: { id } });
    if (!expert) {
      throw new NotFoundException('Эксперт не найден');
    }
    return expert;
  }

  // Удаление эксперта
  async remove(id: string): Promise<void> {
    const result = await this.expertsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Эксперт не найден');
    }
  }

  // Обновление эксперта
  async update(id: string, updateData: any): Promise<Expert> {
    console.log('🔄 Обновление эксперта ID:', id, 'Данные:', updateData);
    
    const expert = await this.expertsRepository.findOne({ where: { id } });
    if (!expert) {
      throw new NotFoundException('Эксперт не найден');
    }
    
    // Обновляем только разрешенные поля (исключаем id и логин)
    const { id: _, login: __, ...safeUpdateData } = updateData;
    
    // Если в updateData есть status, проверяем его валидность
    if (safeUpdateData.status) {
      safeUpdateData.status = this.getValidStatus(safeUpdateData.status);
    }
    
    // Обновляем поля
    Object.assign(expert, safeUpdateData);
    
    const updatedExpert = await this.expertsRepository.save(expert);
    console.log('✅ Успешно обновлен:', updatedExpert);
    
    return updatedExpert;
  }

  // Запрос модерации
  async requestModeration(expertId: string): Promise<Expert> {
    const expert = await this.expertsRepository.findOne({ where: { id: expertId } });
    if (!expert) {
      throw new NotFoundException('Эксперт не найден');
    }

    // Устанавливаем флаг, что эксперт запросил модерацию
    expert.adminVerified = false; // Сбрасываем, чтобы админ перепроверил
    expert.status = 'pending'; // Ставим статус на рассмотрение

    return await this.expertsRepository.save(expert);
  }

  // Одобрение эксперта администратором
  async approveExpert(expertId: string): Promise<Expert> {
    const expert = await this.expertsRepository.findOne({ where: { id: expertId } });
    if (!expert) {
      throw new NotFoundException('Эксперт не найден');
    }

    expert.adminVerified = true;
    expert.status = 'active';
    expert.publishedAt = new Date();
    expert.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 дней

    return await this.expertsRepository.save(expert);
  }

  // Отклонение эксперта администратором
  async rejectExpert(expertId: string, reason: string): Promise<Expert> {
    const expert = await this.expertsRepository.findOne({ where: { id: expertId } });
    if (!expert) {
      throw new NotFoundException('Эксперт не найден');
    }

    expert.status = 'rejected';
    // Можно добавить поле для хранения причины отклонения

    return await this.expertsRepository.save(expert);
  }

  // Вспомогательный метод для валидации статуса
  private getValidStatus(status: string): 'draft' | 'pending' | 'active' | 'expired' | 'rejected' {
    const validStatuses: ('draft' | 'pending' | 'active' | 'expired' | 'rejected')[] = [
      'draft', 'pending', 'active', 'expired', 'rejected'
    ];
    
    if (validStatuses.includes(status as any)) {
      return status as 'draft' | 'pending' | 'active' | 'expired' | 'rejected';
    }
    
    return 'draft'; // Значение по умолчанию
  }
}