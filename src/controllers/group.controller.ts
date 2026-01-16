import { Response, NextFunction } from 'express';
import { groupService } from '../services/group.service';
import { AuthRequest } from '../middlewares/auth';

export class GroupController {
    async create(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { name } = req.body;

            const group = await groupService.createGroup(userId, name);

            res.status(201).json({
                success: true,
                data: { group },
            });
        } catch (error) {
            next(error);
        }
    }

    async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;

            const groups = await groupService.getUserGroups(userId);

            res.status(200).json({
                success: true,
                data: { groups },
            });
        } catch (error) {
            next(error);
        }
    }

    async get(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { id } = req.params;

            const group = await groupService.getGroupById(userId, id);

            res.status(200).json({
                success: true,
                data: { group },
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { id } = req.params;
            const { name } = req.body;

            const group = await groupService.updateGroup(userId, id, name);

            res.status(200).json({
                success: true,
                data: { group },
            });
        } catch (error) {
            next(error);
        }
    }

    async delete(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { id } = req.params;

            await groupService.deleteGroup(userId, id);

            res.status(200).json({
                success: true,
                message: 'Group deleted successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const groupController = new GroupController();
