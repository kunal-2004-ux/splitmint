import { groupRepository } from '../repositories/group.repository';
import { ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';

export class GroupService {
    async createGroup(userId: string, name: string) {
        if (!name || name.trim().length === 0) {
            throw new ValidationError('Group name is required');
        }

        if (name.length > 50) {
            throw new ValidationError('Group name must not exceed 50 characters');
        }

        const group = await groupRepository.create({
            name: name.trim(),
            ownerId: userId,
        });

        // Remove ownerId from return object to avoid leaking implementation details
        const { ownerId, ...groupData } = group;
        return groupData;
    }

    async getUserGroups(userId: string) {
        return groupRepository.findByOwnerId(userId);
    }

    async getGroupById(userId: string, groupId: string) {
        const group = await groupRepository.findById(groupId);

        if (!group) {
            throw new NotFoundError('Group not found');
        }

        if (group.ownerId !== userId) {
            throw new ForbiddenError("You don't have permission to access this group");
        }

        // Remove ownerId from return object
        const { ownerId, ...groupData } = group;
        return groupData;
    }

    async updateGroup(userId: string, groupId: string, name: string) {
        if (!name || name.trim().length === 0) {
            throw new ValidationError('Group name is required');
        }

        if (name.length > 50) {
            throw new ValidationError('Group name must not exceed 50 characters');
        }

        // First check existence and ownership
        await this.getGroupById(userId, groupId);

        return groupRepository.update(groupId, { name: name.trim() });
    }

    async deleteGroup(userId: string, groupId: string) {
        // First check existence and ownership
        await this.getGroupById(userId, groupId);

        await groupRepository.delete(groupId);
        return true;
    }
}

export const groupService = new GroupService();
