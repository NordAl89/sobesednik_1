import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expert } from './entities/expert.entity';
import { CreateExpertDto } from './dto/create-expert.dto';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class ExpertsService {
  constructor(
    @InjectRepository(Expert)
    private expertsRepository: Repository<Expert>,
    private readonly telegramService: TelegramService,     // <-- внедряем TelegramService
  ) {}

  // Создание эксперта (без файлов)
async create(createExpertDto: CreateExpertDto): Promise<Expert> {
  console.log('🎯 Создание эксперта с данными:', createExpertDto);

  const existingExpertByLogin = await this.expertsRepository.findOne({
    where: { login: createExpertDto.login },
  });

  if (existingExpertByLogin) {
    throw new ConflictException('Эксперт с таким логином уже существует');
  }

  const expert = new Expert();
  expert.login = createExpertDto.login;
  expert.password = createExpertDto.password;
  expert.name = createExpertDto.name;
  expert.age = createExpertDto.age;
  expert.gender = createExpertDto.gender;
  expert.availability = createExpertDto.availability;
  expert.about = createExpertDto.about || '';
  expert.allowedTopics = createExpertDto.allowedTopics || '';
  expert.forbiddenTopics = createExpertDto.forbiddenTopics || '';
  expert.price = createExpertDto.price;
  expert.telegram = createExpertDto.telegram
    ? createExpertDto.telegram.startsWith('@')
      ? createExpertDto.telegram
      : '@' + createExpertDto.telegram
    : null;
  expert.otherMessengers = createExpertDto.otherMessengers || '';
  expert.adultTopics = createExpertDto.adultTopics || false;
  expert.noForbiddenTopics = createExpertDto.noForbiddenTopics || false;
  expert.paymentCode = createExpertDto.paymentCode;
  expert.status = this.getValidStatus(createExpertDto.status);

  const savedExpert = await this.expertsRepository.save(expert);
  await this.saveData();

  // повторное получение — чтобы вернулись createdAt и updatedAt
  const fullExpert = await this.findOne(savedExpert.id);

  console.log('✅ Эксперт создан. ID:', fullExpert.id);
  return fullExpert;
}
// телеграм уведомление
 async notifyExpertViaTelegram(expertId: string, message: string) {
    const expert = await this.expertsRepository.findOne({ where: { id: expertId } });
    if (!expert || !expert.telegram) return;
    await this.telegramService.sendMessage(expert.telegram, message);
  }

// Создание эксперта с файлами
async createWithFiles(
  createExpertDto: any,
  mainPhoto: Express.Multer.File,
  galleryFiles: Express.Multer.File[],
): Promise<Expert> {
  console.log('🎯 Создание эксперта с файлами:', createExpertDto);

  const existingExpertByLogin = await this.expertsRepository.findOne({
    where: { login: createExpertDto.login },
  });

  if (existingExpertByLogin) {
    throw new ConflictException('Эксперт с таким логином уже существует');
  }

  const expert = new Expert();
  expert.login = createExpertDto.login;
  expert.password = createExpertDto.password;
  expert.name = createExpertDto.name;
  expert.age = createExpertDto.age;
  expert.gender = createExpertDto.gender;
  expert.availability = createExpertDto.availability;
  expert.about = createExpertDto.about || '';
  expert.telegram = createExpertDto.telegram
    ? createExpertDto.telegram.startsWith('@')
      ? createExpertDto.telegram
      : '@' + createExpertDto.telegram
    : null;
  expert.otherMessengers = createExpertDto.otherMessengers || '';
  expert.allowedTopics = createExpertDto.allowedTopics || '';
  expert.forbiddenTopics = createExpertDto.forbiddenTopics || '';
  expert.price = createExpertDto.price;
  expert.adultTopics = createExpertDto.adultTopics || false;
  expert.noForbiddenTopics = createExpertDto.noForbiddenTopics || false;
  expert.paymentCode = createExpertDto.paymentCode;
  expert.status = 'pending';

  if (mainPhoto) {
    expert.mainPhotoUrl = `/uploads/${mainPhoto.filename}`;
  }

  if (galleryFiles && galleryFiles.length > 0) {
    const galleryUrls = galleryFiles.map(file => `/uploads/${file.filename}`);
    expert.galleryUrls = JSON.stringify(galleryUrls);
  }

  const savedExpert = await this.expertsRepository.save(expert);
  await this.saveData();

  // обязательно получаем из базы с заполненными датами
  const fullExpert = await this.findOne(savedExpert.id);

  console.log('✅ Эксперт создан с файлами. ID:', fullExpert.id);
  return fullExpert;

  
}

  // Валидация эксперта для входа
  async validateExpert(login: string, password: string): Promise<Expert | null> {
    const expert = await this.expertsRepository.findOne({ where: { login } });
    if (expert && expert.password === password) {
      return expert;
    }
    return null;
  }

  async getProfile(id: string): Promise<Expert> {
    const expert = await this.findOne(id);
    return expert;
  }

  async findAll(): Promise<Expert[]> {
    return await this.expertsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Expert> {
    const expert = await this.expertsRepository.findOne({ where: { id } });
    if (!expert) throw new NotFoundException('Эксперт не найден');
    return expert;
  }

  async remove(id: string): Promise<void> {
    const result = await this.expertsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Эксперт не найден');
    }
    await this.saveData(); // заглушка
  }

  async update(id: string, updateData: any): Promise<Expert> {
    const expert = await this.findOne(id);
    const { id: _, login: __, ...safeUpdateData } = updateData;

    if (safeUpdateData.status) {
      safeUpdateData.status = this.getValidStatus(safeUpdateData.status);
    }

    Object.assign(expert, safeUpdateData);
    const updatedExpert = await this.expertsRepository.save(expert);
    await this.saveData(); // заглушка

    return updatedExpert;
  }

  async requestModeration(expertId: string): Promise<Expert> {
    const expert = await this.findOne(expertId);
    expert.adminVerified = false;
    expert.status = 'pending';
    const savedExpert = await this.expertsRepository.save(expert);
    await this.saveData(); // заглушка
    return savedExpert;
  }

  async approveExpert(expertId: string): Promise<Expert> {
    const expert = await this.findOne(expertId);
    expert.adminVerified = true;
    expert.status = 'active';
    expert.publishedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // срок жизни анкеты 30 дней
    expert.expiresAt = expiresAt;
    const savedExpert = await this.expertsRepository.save(expert);
    await this.saveData(); // заглушка
    return savedExpert;
  }

  async rejectExpert(expertId: string, reason: string): Promise<Expert> {
    const expert = await this.findOne(expertId);
    expert.status = 'rejected';
    const savedExpert = await this.expertsRepository.save(expert);
    await this.saveData(); // заглушка
    return savedExpert;
  }

  async blockExpert(id: string): Promise<Expert> {
    const expert = await this.findOne(id);
    expert.status = 'rejected'; // можно оставить 'rejected' чтобы соответствовать типу
    expert.adminVerified = false;
    expert.updatedAt = new Date();
    const savedExpert = await this.expertsRepository.save(expert);
    await this.saveData(); // заглушка
    return savedExpert;
  }

  // Проверка истекших анкет
  async checkAndRemoveExpiredExperts(): Promise<void> {
    const now = new Date();
    const expiredExperts = await this.expertsRepository
      .createQueryBuilder('expert')
      .where('expert.status = :status', { status: 'active' })
      .andWhere('expert.expiresAt < :now', { now })
      .getMany();

    for (const expert of expiredExperts) {
      await this.expertsRepository.remove(expert);
    }
  }

  // Метод запуска планировщика
  async startExpirationChecker(): Promise<void> {
    setInterval(() => this.checkAndRemoveExpiredExperts(), 60 * 1000); // каждую минуту
    await this.checkAndRemoveExpiredExperts(); // первая проверка сразу
    console.log('⏰ Планировщик удаления истекших анкет запущен');
  }


  // Вспомогательный метод для проверки статуса
  private getValidStatus(
    status: string,
  ): 'draft' | 'pending' | 'active' | 'expired' | 'rejected' {
    const validStatuses = ['draft', 'pending', 'active', 'expired', 'rejected'];
    return validStatuses.includes(status) ? (status as any) : 'draft';
  }

  // Заглушка saveData для TS
  private async saveData(): Promise<void> {
    return;
  }  
}
