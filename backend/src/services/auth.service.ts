import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository.js';
import { User, PublicUser, UserRole } from '../interfaces/user.interface.js';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  hospitalId?: string;
}

export interface AuthResponse {
  token: string;
  user: PublicUser;
}

export class AuthService {
  private static getJwtSecret(): string {
    return process.env.JWT_SECRET || 'medradar_default_fallback_secret';
  }

  private static getJwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || '7d';
  }

  public static sanitizeUser(user: User): PublicUser {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  public static generateToken(user: User): string {
    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
    };

    return jwt.sign(payload, this.getJwtSecret(), {
      expiresIn: this.getJwtExpiresIn() as jwt.SignOptions['expiresIn'],
    });
  }

  public static async login(email: string, password: string, requestedRole?: UserRole): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    if (requestedRole && user.role !== requestedRole) {
      const error: any = new Error(`Account role is '${user.role}', but '${requestedRole}' portal was selected`);
      error.statusCode = 403;
      error.code = 'ROLE_MISMATCH';
      throw error;
    }

    const token = this.generateToken(user);
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  public static async registerPatient(data: {
    name: string;
    email: string;
    mobile: string;
    password: string;
    location?: string;
  }): Promise<AuthResponse> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const error: any = new Error('Email address is already registered');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      passwordHash,
      role: 'patient',
      location: data.location,
    });

    const token = this.generateToken(user);
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  public static async registerHospital(data: {
    adminName: string;
    email: string;
    mobile: string;
    password: string;
    hospitalName: string;
  }): Promise<AuthResponse> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      const error: any = new Error('Email address is already registered');
      error.statusCode = 409;
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const hospitalId = `hosp-${Date.now()}`;
    const user = await userRepository.create({
      name: data.adminName,
      email: data.email,
      mobile: data.mobile,
      passwordHash,
      role: 'hospital_admin',
      hospitalId,
    });

    const token = this.generateToken(user);
    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  public static async getUserById(id: string): Promise<PublicUser> {
    const user = await userRepository.findById(id);
    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    return this.sanitizeUser(user);
  }
}
