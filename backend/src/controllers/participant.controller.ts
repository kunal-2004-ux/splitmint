import { Response, NextFunction } from 'express';
import { participantService } from '../services/participant.service';
import { AuthRequest } from '../middlewares/auth';

export class ParticipantController {
    async add(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { groupId } = req.params;
            const { name, color } = req.body;

            const participant = await participantService.addParticipant(userId, groupId, name, color);

            res.status(201).json({
                success: true,
                data: { participant },
            });
        } catch (error) {
            next(error);
        }
    }

    async list(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { groupId } = req.params;

            const participants = await participantService.getGroupParticipants(userId, groupId);

            res.status(200).json({
                success: true,
                data: { participants },
            });
        } catch (error) {
            next(error);
        }
    }

    async update(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { id } = req.params;
            const { name, color } = req.body;

            const participant = await participantService.updateParticipant(userId, id, name, color);

            res.status(200).json({
                success: true,
                data: { participant },
            });
        } catch (error) {
            next(error);
        }
    }

    async remove(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.userId!;
            const { id } = req.params;

            await participantService.removeParticipant(userId, id);

            res.status(200).json({
                success: true,
                message: 'Participant removed successfully',
            });
        } catch (error) {
            next(error);
        }
    }
}

export const participantController = new ParticipantController();
