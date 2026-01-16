import prisma from '../config/database';

export interface CreateParticipantData {
    name: string;
    color?: string;
    groupId: string;
}

export interface UpdateParticipantData {
    name?: string;
    color?: string;
}

export class ParticipantRepository {
    async create(data: CreateParticipantData) {
        return prisma.participant.create({
            data,
            select: {
                id: true,
                name: true,
                color: true,
                groupId: true,
                createdAt: true,
            },
        });
    }

    async findByGroupId(groupId: string) {
        return prisma.participant.findMany({
            where: { groupId },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                name: true,
                color: true,
                groupId: true,
                createdAt: true,
            },
        });
    }

    async findById(id: string) {
        return prisma.participant.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                color: true,
                groupId: true,
                createdAt: true,
            },
        });
    }

    async update(id: string, data: UpdateParticipantData) {
        return prisma.participant.update({
            where: { id },
            data,
            select: {
                id: true,
                name: true,
                color: true,
                groupId: true,
                createdAt: true,
            },
        });
    }

    async delete(id: string) {
        return prisma.participant.delete({
            where: { id },
        });
    }

    async countByGroupId(groupId: string) {
        return prisma.participant.count({
            where: { groupId },
        });
    }
}

export const participantRepository = new ParticipantRepository();
