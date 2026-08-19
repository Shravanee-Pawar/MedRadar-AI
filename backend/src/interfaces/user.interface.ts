export type UserRole = 'patient' | 'hospital_admin' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  mobile: string;
  role: UserRole;
  hospitalId?: string;
  location?: string;
  createdAt: string;
}

export type PublicUser = Omit<User, 'passwordHash'>;

/**
 * Interface contract for User database operations.
 * Database teammate can replace MockUserRepository with MongoUserRepository
 * implementing this exact interface.
 */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User>;
}
