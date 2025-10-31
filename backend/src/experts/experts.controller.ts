import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UnauthorizedException,
  Patch,
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ExpertsService } from './experts.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { LoginExpertDto } from './dto/login-expert.dto';

@Controller('experts')
export class ExpertsController {
  constructor(private readonly expertsService: ExpertsService) {}

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateExpertDto: any
  ) {
    console.log('📝 Обновление эксперта:', id, updateExpertDto);
    
    const expert = await this.expertsService.update(id, updateExpertDto);
    console.log('✅ Эксперт обновлен:', expert);
    
    return {
      id: expert.id,
      login: expert.login,
      name: expert.name,
      age: expert.age,
      gender: expert.gender,
      availability: expert.availability,
      about: expert.about,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      price: expert.price,
      mainPhotoUrl: expert.mainPhotoUrl,
      rating: expert.rating,
      totalSessions: expert.totalSessions
    };
  }

  @Post()
  async create(@Body() createExpertDto: CreateExpertDto) {
    console.log('📨 Получен POST запрос с данными:', createExpertDto);
    
    const expert = await this.expertsService.create(createExpertDto);
    console.log('✅ Создан эксперт:', expert);
    
    return {
      id: expert.id,
      login: expert.login,
      name: expert.name,
      age: expert.age,
      availability: expert.availability,
      about: expert.about,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      price: expert.price,
      mainPhotoUrl: expert.mainPhotoUrl,
      galleryUrls: expert.galleryUrls,
      createdAt: expert.createdAt
    };
  }

  @Post('with-files')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainPhoto', maxCount: 1 },
      { name: 'gallery', maxCount: 10 }
    ], {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
          cb(null, true);
        } else {
          cb(new Error('Only images and videos are allowed'), false);
        }
      },
    })
  )
  async createWithFiles(
    @UploadedFiles() files: { mainPhoto?: Express.Multer.File[], gallery?: Express.Multer.File[] },
    @Body() createExpertDto: CreateExpertDto
  ) {
    console.log('📨 Получен запрос с файлами:', createExpertDto);
    console.log('📁 Файлы:', files);

    const mainPhoto = files?.mainPhoto?.[0];
    const galleryFiles = files?.gallery || [];

    const expert = await this.expertsService.createWithFiles(
      createExpertDto, 
      mainPhoto, 
      galleryFiles
    );

    return {
      id: expert.id,
      login: expert.login,
      name: expert.name,
      age: expert.age,
      gender: expert.gender,
      availability: expert.availability,
      about: expert.about,
      telegram: expert.telegram,
      otherMessengers: expert.otherMessengers,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      price: expert.price,
      mainPhotoUrl: expert.mainPhotoUrl,
      galleryUrls: expert.galleryUrls ? JSON.parse(expert.galleryUrls) : [],
      rating: expert.rating,
      totalSessions: expert.totalSessions,
      adultTopics: expert.adultTopics,
      noForbiddenTopics: expert.noForbiddenTopics,
      status: expert.status,
      paymentCode: expert.paymentCode,
      createdAt: expert.createdAt
    };
  }

  @Post('login')
  async login(@Body() loginExpertDto: LoginExpertDto) {
    console.log('🚪 Запрос на вход:', loginExpertDto)
    
    const expert = await this.expertsService.validateExpert(
      loginExpertDto.login,
      loginExpertDto.password
    );

    if (!expert) {
      console.log('❌ Вход отклонен: неверные данные')
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    console.log('✅ Вход успешен для эксперта:', expert.name)
    
    return {
      id: expert.id,
      login: expert.login,
      name: expert.name,
      age: expert.age,
      availability: expert.availability,
      about: expert.about,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      price: expert.price,
      mainPhotoUrl: expert.mainPhotoUrl,
      rating: expert.rating,
      totalSessions: expert.totalSessions
    };
  }

  @Post(':id/update')
  async updateViaPost(
    @Param('id') id: string, 
    @Body() updateExpertDto: any
  ) {
    console.log('📝 Обновление эксперта через POST:', id, updateExpertDto);
    
    const expert = await this.expertsService.update(id, updateExpertDto);
    console.log('✅ Эксперт обновлен:', expert);
    
    return {
      id: expert.id,
      login: expert.login,
      name: expert.name,
      age: expert.age,
      availability: expert.availability,
      about: expert.about,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      price: expert.price,
      mainPhotoUrl: expert.mainPhotoUrl,
      rating: expert.rating,
      totalSessions: expert.totalSessions
    };
  }

  // 🚫 Блокировка анкеты админом
  @Post('admin/:id/block')
  async blockExpert(@Param('id') id: string) {
    console.log('🚫 Блокировка анкеты эксперта:', id);

    const expert = await this.expertsService.blockExpert(id);

    console.log('✅ Эксперт заблокирован:', expert);

    return {
      id: expert.id,
      status: expert.status,
      adminVerified: expert.adminVerified
    };
  }

  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    const expert = await this.expertsService.getProfile(id);
    
    return {
      id: expert.id,
      login: expert.login,
      name: expert.name,
      age: expert.age,
      availability: expert.availability,
      about: expert.about,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      price: expert.price,
      mainPhotoUrl: expert.mainPhotoUrl,
      rating: expert.rating,
      totalSessions: expert.totalSessions,
      adminVerified: expert.adminVerified,
      status: expert.status,
      telegram: expert.telegram,
      otherMessengers: expert.otherMessengers,
      adultTopics: expert.adultTopics,
      noForbiddenTopics: expert.noForbiddenTopics,
      createdAt: expert.createdAt
    };
  }

  @Get()
  async findAll() {
    const experts = await this.expertsService.findAll();
    return experts.map(expert => ({
      id: expert.id,
      login: expert.login,
      name: expert.name,
      age: expert.age,
      gender: expert.gender,
      availability: expert.availability,
      about: expert.about,
      price: expert.price,
      mainPhotoUrl: expert.mainPhotoUrl,
      rating: expert.rating,
      totalSessions: expert.totalSessions,
      status: expert.status,
      adminVerified: expert.adminVerified,
      telegram: expert.telegram,
      otherMessengers: expert.otherMessengers,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      adultTopics: expert.adultTopics,
      noForbiddenTopics: expert.noForbiddenTopics,
      paymentCode: expert.paymentCode,
      createdAt: expert.createdAt,
      updatedAt: expert.updatedAt
    }));
  }

  @Get('debug/:id')
  async debugExpert(@Param('id') id: string) {
    const expert = await this.expertsService.findOne(id);
    return {
      rawData: expert,
      createdAt: expert.createdAt,
      createdAtType: typeof expert.createdAt,
      login: expert.login
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const expert = await this.expertsService.findOne(id);
    return {
      id: expert.id,
      login: expert.login,
      name: expert.name,
      age: expert.age,
      availability: expert.availability,
      about: expert.about,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      price: expert.price,
      mainPhotoUrl: expert.mainPhotoUrl,
      galleryUrls: expert.galleryUrls,
      rating: expert.rating,
      totalSessions: expert.totalSessions,
      adminVerified: expert.adminVerified,
      status: expert.status,
      telegram: expert.telegram,
      otherMessengers: expert.otherMessengers,
      adultTopics: expert.adultTopics,
      noForbiddenTopics: expert.noForbiddenTopics,
      paymentCode: expert.paymentCode,
      createdAt: expert.createdAt
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.expertsService.remove(id);
    return { message: 'Эксперт успешно удален' };
  }

  @Post(':id/moderation')
  async requestModeration(@Param('id') id: string) {
    console.log('📋 Запрос модерации для эксперта:', id);
    
    const expert = await this.expertsService.requestModeration(id);
    console.log('✅ Статус модерации обновлен:', expert);
    
    return {
      id: expert.id,
      status: expert.status,
      adminVerified: expert.adminVerified
    };
  }

  // Одобрение эксперта
  @Post('admin/:id/approve')
  async approveExpert(@Param('id') id: string) {
    console.log('✅ Одобрение эксперта:', id);
    
    const expert = await this.expertsService.approveExpert(id);
    console.log('✅ Эксперт одобрен:', expert);
    
    return {
      id: expert.id,
      status: expert.status,
      adminVerified: expert.adminVerified,
      publishedAt: expert.publishedAt,
      expiresAt: expert.expiresAt
    };
  }

  // Отклонение эксперта
  @Post('admin/:id/reject')
  async rejectExpert(
    @Param('id') id: string,
    @Body() body: { reason: string }
  ) {
    console.log('❌ Отклонение эксперта:', id, 'Причина:', body.reason);
    
    const expert = await this.expertsService.rejectExpert(id, body.reason);
    console.log('✅ Эксперт отклонен:', expert);
    
    return {
      id: expert.id,
      status: expert.status
    };
  }
// уведомление телеграм
  @Post(':id/notify')
async notifyExpert(@Param('id') id: string, @Body('message') message: string) {
  await this.expertsService.notifyExpertViaTelegram(id, message);
  return { success: true };
}
}