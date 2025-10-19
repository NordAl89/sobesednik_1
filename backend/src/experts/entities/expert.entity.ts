import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';

@Entity('experts')
export class Expert {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  login!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column()
  age!: number;

  @Column({ default: 'Свободен' })
  status!: string;

  @Column('text', { nullable: true })
  about?: string;

  @Column('text', { nullable: true })
  allowedTopics?: string;

  @Column('text', { nullable: true })
  forbiddenTopics?: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column({ nullable: true })
  mainPhoto?: string;

  @Column('text', { default: '[]' })
  gallery!: string;

  @Column({ default: 0 })
  rating!: number;

  @Column({ default: 0 })
  totalSessions!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @BeforeInsert()
  generateId() {
    // Генерируем случайный 10-значный числовой ID
    // От 1000000000 до 9999999999
    const min = 1000000000;
    const max = 9999999999;
    this.id = Math.floor(min + Math.random() * (max - min)).toString();
  }
}