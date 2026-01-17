import prisma from '../config/database';

export interface CreateGroupData {
    name: string;
    ownerId: string;
}

export interface UpdateGroupData {
    name: string;
}

export class GroupRepository {
    async create(data: CreateGroupData) {
        return prisma.group.create({
            data,
            select: {
                id: true,
                name: true,
                createdAt: true,
                ownerId: true, // Selected for service logic, controller will filter if needed
            },
        });
    }

    async findByOwnerId(ownerId: string) {
        return prisma.group.findMany({
            where: { ownerId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        });
    }

    async findById(id: string) {
        return prisma.group.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                createdAt: true,
                ownerId: true,
            },
        });
    }

    async update(id: string, data: UpdateGroupData) {
        return prisma.group.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                createdAt: true,
            },
        });
    }

    async delete(id: string) {
        return prisma.group.delete({
            where: { id },
        });
    }
}

export const groupRepository = new GroupRepository();
