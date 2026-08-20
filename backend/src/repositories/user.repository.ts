import bcrypt from 'bcryptjs';
import { User, UserRepository } from '../interfaces/user.interface.js';

class MockUserRepository implements UserRepository {
  private users: User[] = [];

  constructor() {
    this.seedDefaultUsers();
  }

  private seedDefaultUsers(): void {
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);
    const demoPasswordHash = bcrypt.hashSync('demo123', 10);
    const now = new Date().toISOString();

    this.users = [
      {
        id: 'usr-patient-001',
        name: 'Shubham Parkar',
        email: 'shubham@medradar.ai',
        passwordHash: demoPasswordHash,
        mobile: '9876543210',
        role: 'patient',
        location: 'Ratnagiri City',
        createdAt: now,
      },
      {
        id: 'usr-patient-002',
        name: 'Rahul Sharma',
        email: 'patient@medradar.ai',
        passwordHash: defaultPasswordHash,
        mobile: '9876543210',
        role: 'patient',
        location: 'Ratnagiri City',
        createdAt: now,
      },
      {
        id: 'usr-hosp-admin-001',
        name: 'Dr. Vivek Parkar',
        email: 'vivek@parkarhospital.org',
        passwordHash: demoPasswordHash,
        mobile: '9822012345',
        role: 'hospital_admin',
        hospitalId: 'hosp-001',
        createdAt: now,
      },
      {
        id: 'usr-hosp-admin-001b',
        name: 'Dr. Vivek Parkar',
        email: 'admin@parkarhospital.com',
        passwordHash: demoPasswordHash,
        mobile: '9822012345',
        role: 'hospital_admin',
        hospitalId: 'hosp-001',
        createdAt: now,
      },
      {
        id: 'usr-hosp-admin-002',
        name: 'Dr. Suresh Patil',
        email: 'admin@civilhospital.ai',
        passwordHash: defaultPasswordHash,
        mobile: '9876543211',
        role: 'hospital_admin',
        hospitalId: 'hosp-001',
        createdAt: now,
      },
      {
        id: 'usr-hosp-admin-003',
        name: 'Dr. Shreeram Admin',
        email: 'admin@shreeram.com',
        passwordHash: demoPasswordHash,
        mobile: '9876543219',
        role: 'hospital_admin',
        hospitalId: 'hosp-005',
        createdAt: now,
      },
      {
        id: 'usr-super-admin-001',
        name: 'MedRadar AI Admin',
        email: 'admin@medradar.ai',
        passwordHash: demoPasswordHash,
        mobile: '9876543212',
        role: 'super_admin',
        createdAt: now,
      },
      {
        id: 'usr-super-admin-002',
        name: 'District Health Officer',
        email: 'superadmin@medradar.ai',
        passwordHash: defaultPasswordHash,
        mobile: '9876543212',
        role: 'super_admin',
        createdAt: now,
      },
    ];
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    return user || null;
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }
}

// Single instance export.
// Database teammate: Replace this with MongoUserRepository implementation when ready!
export const userRepository: UserRepository = new MockUserRepository();
