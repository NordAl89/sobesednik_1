import { IsString, IsNumber, IsOptional, Min, IsNotEmpty, IsBoolean, IsIn } from 'class-validator';

export class CreateExpertDto {
  @IsString()
  @IsNotEmpty()
  login!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(18)
  age!: number;

  @IsNotEmpty()
  @IsIn(['male', 'female'])
  gender: 'male' | 'female';

  @IsString()
  availability!: string; // Изменили status на availability

  @IsString()
  @IsOptional()
  about?: string;

  @IsString()
  @IsOptional()
  allowedTopics?: string;

  @IsString()
  @IsOptional()
  forbiddenTopics?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsString()
  @IsNotEmpty()
  telegram!: string;

  @IsString()
  @IsOptional()
  otherMessengers?: string;

  @IsBoolean()
  @IsOptional()
  adultTopics?: boolean;

  @IsBoolean()
  @IsOptional()
  noForbiddenTopics?: boolean;

  @IsString()
  @IsOptional()
  paymentCode?: string;

  @IsString()
  @IsOptional()
  status?: string; // Оставили для статуса публикации
}