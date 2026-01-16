import { Router } from 'express';
import { body, param } from 'express-validator';
import { groupController } from '../controllers/group.controller';
import { authenticate } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

// Apply authentication to all group routes
router.use(authenticate);

// Validation rules
const nameValidation = body('name')
    .trim()
    .notEmpty()
    .withMessage('Group name is required')
    .isLength({ max: 50 })
    .withMessage('Group name must not exceed 50 characters');

const idValidation = param('id')
    .isUUID()
    .withMessage('Invalid group ID');

// Routes
router.post(
    '/',
    [nameValidation, validate],
    groupController.create.bind(groupController)
);

router.get('/', groupController.list.bind(groupController));

router.get(
    '/:id',
    [idValidation, validate],
    groupController.get.bind(groupController)
);

router.put(
    '/:id',
    [idValidation, nameValidation, validate],
    groupController.update.bind(groupController)
);

router.delete(
    '/:id',
    [idValidation, validate],
    groupController.delete.bind(groupController)
);

export default router;
