import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  email: string;

  @Column()
  password_hash: string;

  @Column({ default: 'user' })
  role: string;

  @CreateDateColumn()
  created_at: Date;
}