import db from '@/lib/db';
import { Prisma, User } from '@prisma/client';

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return db.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return db.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return db.user.create({
      data,
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return db.user.update({
      where: { id },
      data,
    });
  }
}

export const userRepository = new UserRepository();
