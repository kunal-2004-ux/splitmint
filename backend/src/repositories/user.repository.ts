import prisma from '../config/database';

export interface CreateUserData {
    email: string;
    passwordHash: string;
}

export class UserRepository {
    async create(data: CreateUserData) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        });
    }
}

export const userRepository = new UserRepository();
