import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { config } from '../config';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/errors';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export class AuthService {
    private readonly SALT_ROUNDS = 10;

    async register(data: RegisterData) {
        const { name, email, password } = data;

        if (!name || !email || !password) {
            throw new ValidationError('Name, email and password are required');
        }

        if (password.length < 6) {
            throw new ValidationError('Password must be at least 6 characters long');
        }

        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);

        const user = await userRepository.create({
            name,
            email,
            passwordHash,
        });

        const token = this.generateToken(user.id);

        return {
            user,
            token,
        };
    }

    async login(data: LoginData) {
        const { email, password } = data;

        if (!email || !password) {
            throw new ValidationError('Email and password are required');
        }

        const user = await userRepository.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const token = this.generateToken(user.id);

        return {
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
            },
            token,
        };
    }

    private generateToken(userId: string): string {
        return jwt.sign({ userId }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });
    }
}

export const authService = new AuthService();
