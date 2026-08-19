import { BloodInventory, BloodRequest, BloodRepository, BloodGroup, BloodRequestStatus } from '../interfaces/blood.interface.js';

class MockBloodRepository implements BloodRepository {
  private inventory: BloodInventory[] = [];
  private requests: BloodRequest[] = [];

  constructor() {
    this.seedBloodInventory();
  }

  private seedBloodInventory(): void {
    const now = new Date().toISOString();
    const groups: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    const stocks: Record<string, number> = {
      'O+': 24,
      'O-': 4,
      'A+': 18,
      'A-': 2,
      'B+': 30,
      'B-': 5,
      'AB+': 12,
      'AB-': 1,
    };

    for (const bg of groups) {
      this.inventory.push({
        id: `bld-001-${bg.replace('+', 'pos').replace('-', 'neg')}`,
        hospitalId: 'hosp-001',
        bloodGroup: bg,
        unitsAvailable: stocks[bg] || 10,
        unitsReserved: 2,
        updatedAt: now,
      });
    }
  }

  async findInventory(filters?: { hospitalId?: string; bloodGroup?: BloodGroup }): Promise<BloodInventory[]> {
    let result = [...this.inventory];
    if (filters) {
      if (filters.hospitalId) {
        result = result.filter((b) => b.hospitalId === filters.hospitalId);
      }
      if (filters.bloodGroup) {
        result = result.filter((b) => b.bloodGroup === filters.bloodGroup);
      }
    }
    return result;
  }

  async updateInventory(hospitalId: string, bloodGroup: BloodGroup, unitsAvailable: number): Promise<BloodInventory> {
    let item = this.inventory.find((b) => b.hospitalId === hospitalId && b.bloodGroup === bloodGroup);
    const now = new Date().toISOString();

    if (item) {
      item.unitsAvailable = unitsAvailable;
      item.updatedAt = now;
    } else {
      item = {
        id: `bld-${Date.now()}`,
        hospitalId,
        bloodGroup,
        unitsAvailable,
        unitsReserved: 0,
        updatedAt: now,
      };
      this.inventory.push(item);
    }

    return item;
  }

  async createRequest(data: Omit<BloodRequest, 'id' | 'createdAt' | 'status'>): Promise<BloodRequest> {
    const now = new Date().toISOString();
    const newRequest: BloodRequest = {
      ...data,
      id: `blr-${Date.now()}`,
      status: 'Pending',
      createdAt: now,
    };
    this.requests.push(newRequest);
    return newRequest;
  }

  async findRequests(filters?: { hospitalId?: string; status?: BloodRequestStatus }): Promise<BloodRequest[]> {
    let result = [...this.requests];
    if (filters) {
      if (filters.hospitalId) {
        result = result.filter((r) => r.hospitalId === filters.hospitalId);
      }
      if (filters.status) {
        result = result.filter((r) => r.status === filters.status);
      }
    }
    return result;
  }
}

export const bloodRepository: BloodRepository = new MockBloodRepository();
