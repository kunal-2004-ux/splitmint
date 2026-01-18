import prisma from '../config/database';

export interface CreateUserData {
    name: string;
    email: string;
    passwordHash: string;
}

export class UserRepository {
    async create(data: CreateUserData) {
        return prisma.user.create({
            data,
            select: {
                id: true,
                name: true,
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
                name: true,
                email: true,
                createdAt: true,
            },
        });
    }
}

export const userRepository = new UserRepository();
