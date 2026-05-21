import { UserEntity } from "@/models/users.entity";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from 'bcrypt';
import { Repository } from "typeorm";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async singup(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.users.create({ email, password_hash: passwordHash });
    return this.users.save(user);
  }

  async signin(email: string, password: string, role: string) {
    const user = await this.users.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }
    const token = jwt.sign({ userId: user.id, role }, process.env.JWT_SECRET);
    return token;
  }

  async verifyToken(token: string) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not set');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  }

  async getUserDetails(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}