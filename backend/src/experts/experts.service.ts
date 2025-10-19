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
    expert.status = createExpertDto.status;
    expert.about = createExpertDto.about || '';
    expert.allowedTopics = createExpertDto.allowedTopics || '';
    expert.forbiddenTopics = createExpertDto.forbiddenTopics || '';
    expert.price = createExpertDto.price;
    
    const savedExpert = await this.expertsRepository.save(expert);
    
    console.log('✅ Эксперт создан. ID:', savedExpert.id);
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

  // Добавьте этот метод в класс ExpertsService в experts.service.ts
async update(id: string, updateData: any): Promise<Expert> {
  console.log('🔄 Обновление эксперта ID:', id, 'Данные:', updateData);
  
  const expert = await this.expertsRepository.findOne({ where: { id } });
  if (!expert) {
    throw new NotFoundException('Эксперт не найден');
  }
  
  // Обновляем только разрешенные поля (исключаем id и логин)
  const { id: _, login: __, ...safeUpdateData } = updateData;
  
  // Обновляем поля
  Object.assign(expert, safeUpdateData);
  
  const updatedExpert = await this.expertsRepository.save(expert);
  console.log('✅ Успешно обновлен:', updatedExpert);
  
  return updatedExpert;
}
}