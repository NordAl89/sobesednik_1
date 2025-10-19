import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UnauthorizedException 
} from '@nestjs/common';
import { ExpertsService } from './experts.service';
import { CreateExpertDto } from './dto/create-expert.dto';
import { LoginExpertDto } from './dto/login-expert.dto';
import { Patch } from '@nestjs/common';

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
    status: expert.status,
    about: expert.about,
    allowedTopics: expert.allowedTopics,
    forbiddenTopics: expert.forbiddenTopics,
    price: expert.price,
    mainPhoto: expert.mainPhoto,
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
      status: expert.status,
      about: expert.about,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      price: expert.price,
      mainPhoto: expert.mainPhoto,
      gallery: expert.gallery,
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
    status: expert.status,
    about: expert.about,
    allowedTopics: expert.allowedTopics,
    forbiddenTopics: expert.forbiddenTopics,
    price: expert.price,
    mainPhoto: expert.mainPhoto,
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
    status: expert.status,
    about: expert.about,
    allowedTopics: expert.allowedTopics,
    forbiddenTopics: expert.forbiddenTopics,
    price: expert.price,
    mainPhoto: expert.mainPhoto,
    rating: expert.rating,
    totalSessions: expert.totalSessions
  };
}
  @Get('profile/:id')
  async getProfile(@Param('id') id: string) {
    const expert = await this.expertsService.getProfile(id); // Используем getProfile
    
    // Возвращаем данные эксперта без пароля
    return {
      id: expert.id,
      login: expert.login,
      name: expert.name,
      age: expert.age,
      status: expert.status,
      about: expert.about,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      price: expert.price,
      mainPhoto: expert.mainPhoto,
      rating: expert.rating,
      totalSessions: expert.totalSessions,
      createdAt: expert.createdAt
    };
  }

  @Get()
  async findAll() {
    const experts = await this.expertsService.findAll();
    return experts.map(expert => ({
      id: expert.id,
      name: expert.name,
      age: expert.age,
      status: expert.status,
      about: expert.about,
      price: expert.price,
      mainPhoto: expert.mainPhoto,
      rating: expert.rating,
      totalSessions: expert.totalSessions
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const expert = await this.expertsService.findOne(id);
    return {
      id: expert.id,
      login: expert.login,
      name: expert.name,
      age: expert.age,
      status: expert.status,
      about: expert.about,
      allowedTopics: expert.allowedTopics,
      forbiddenTopics: expert.forbiddenTopics,
      price: expert.price,
      mainPhoto: expert.mainPhoto,
      gallery: expert.gallery,
      rating: expert.rating,
      totalSessions: expert.totalSessions,
      createdAt: expert.createdAt
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.expertsService.remove(id);
    return { message: 'Эксперт успешно удален' };
  }
}