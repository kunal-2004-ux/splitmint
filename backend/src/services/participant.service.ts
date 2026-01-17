import { participantRepository } from '../repositories/participant.repository';
import { assertGroupOwnership } from './helpers/ownership';
import { ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export class ParticipantService {
    private readonly MAX_PARTICIPANTS = 4;

    async addParticipant(userId: string, groupId: string, name: string, color?: string) {
        // 1. Security Check: Assert Ownership
        await assertGroupOwnership(userId, groupId);

        // 2. Validate Input
        if (!name || name.trim().length === 0) {
            throw new ValidationError('Participant name is required');
        }

        if (name.length > 50) {
            throw new ValidationError('Participant name must not exceed 50 characters');
        }

        // 3. Business Rule: Check Limit
        const currentCount = await participantRepository.countByGroupId(groupId);
        if (currentCount >= this.MAX_PARTICIPANTS) {
            throw new ConflictError(`Group cannot have more than ${this.MAX_PARTICIPANTS} participants`);
        }

        // 4. Create Participant (Handle Unique Name Constraint)
        try {
            return await participantRepository.create({
                name: name.trim(),
                color,
                groupId,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictError('A participant with this name already exists in the group');
            }
            throw error;
        }
    }

    async getGroupParticipants(userId: string, groupId: string) {
        // 1. Security Check: Assert Ownership
        await assertGroupOwnership(userId, groupId);

        // 2. Fetch Data
        return participantRepository.findByGroupId(groupId);
    }

    async updateParticipant(userId: string, participantId: string, name?: string, color?: string) {
        // 1. Find Participant to get groupId
        const participant = await participantRepository.findById(participantId);
        if (!participant) {
            throw new NotFoundError('Participant not found');
        }

        // 2. Security Check: Assert Ownership of the Group
        await assertGroupOwnership(userId, participant.groupId);

        // 3. Validation
        if (name !== undefined) {
            if (name.trim().length === 0) throw new ValidationError('Name cannot be empty');
            if (name.length > 50) throw new ValidationError('Name must not exceed 50 characters');
        }

        // 4. Update
        try {
            return await participantRepository.update(participantId, {
                name: name?.trim(),
                color,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictError('A participant with this name already exists in the group');
            }
            throw error;
        }
    }

    async removeParticipant(userId: string, participantId: string) {
        // 1. Find Participant to get groupId
        const participant = await participantRepository.findById(participantId);
        if (!participant) {
            throw new NotFoundError('Participant not found');
        }

        // 2. Security Check: Assert Ownership
        await assertGroupOwnership(userId, participant.groupId);

        // 3. Delete
        await participantRepository.delete(participantId);
        return true;
    }
}

export const participantService = new ParticipantService();
