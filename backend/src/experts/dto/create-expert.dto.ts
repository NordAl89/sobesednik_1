export class CreateExpertDto {
  login: string;
  password: string;
  name: string;
  age: number;
  status: string;
  about: string;
  allowedTopics: string;
  forbiddenTopics: string;
  price: number;
  mainPhoto?: string;
  gallery?: string[];
}