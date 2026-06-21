import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '@/repositories/user.repository';
import { RegisterInput, LoginInput } from '@/validators/auth.validator';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-trackflow-jwt-token-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export class UserService {
  async register(input: RegisterInput): Promise<Omit<User, 'password'>> {
    const existingUser = await userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await userRepository.createUser({
      name: input.name,
      email: input.email,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(input: LoginInput): Promise<{ user: Omit<User, 'password'>; token: string }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user);

    const { password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'password'> | null> {
    const user = await userRepository.findById(userId);
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  }
}

export const userService = new UserService();
