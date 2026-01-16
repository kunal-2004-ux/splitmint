import { Router } from 'express';
import { body, param } from 'express-validator';
import { participantController } from '../controllers/participant.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

// Apply authentication
router.use(authenticate);

// Validation Rules
const nameValidation = body('name')
    .trim()
    .notEmpty()
    .withMessage('Participant name is required')
    .isLength({ max: 50 })
    .withMessage('Name must not exceed 50 characters');

const colorValidation = body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex code (e.g., #FF0000)');

const groupIdValidation = param('groupId')
    .isUUID()
    .withMessage('Invalid group ID');

const participantIdValidation = param('id')
    .isUUID()
    .withMessage('Invalid participant ID');

// Routes

// Add Participant to Group
router.post(
    '/groups/:groupId/participants',
    [groupIdValidation, nameValidation, colorValidation, validate],
    participantController.add.bind(participantController)
);

// List Participants in Group
router.get(
    '/groups/:groupId/participants',
    [groupIdValidation, validate],
    participantController.list.bind(participantController)
);

// Update Participant
router.put(
    '/participants/:id',
    [participantIdValidation, body('name').optional().trim().isLength({ max: 50 }), colorValidation, validate],
    participantController.update.bind(participantController)
);

// Remove Participant
router.delete(
    '/participants/:id',
    [participantIdValidation, validate],
    participantController.remove.bind(participantController)
);

export default router;
