import { groupRepository } from '../../repositories/group.repository';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

/**
 * Verifies that a user is the owner of a specific group.
 * Throws NotFoundError if group doesn't exist.
 * Throws ForbiddenError if user is not the owner.
 *
 * @param userId - The ID of the authenticated user
 * @param groupId - The ID of the group to check
 */
export const assertGroupOwnership = async (userId: string, groupId: string): Promise<void> => {
    const group = await groupRepository.findById(groupId);

    if (!group) {
        throw new NotFoundError('Group not found');
    }

    if (group.ownerId !== userId) {
        throw new ForbiddenError("You don't have permission to access this group");
    }
};
