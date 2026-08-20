import { TransferRequest, TransferRepository, TransferStatus } from '../interfaces/transfer.interface.js';

class MockTransferRepository implements TransferRepository {
  private transfers: TransferRequest[] = [];

  constructor() {
    this.seedTransfers();
  }

  private seedTransfers(): void {
    const now = new Date().toISOString();
    this.transfers = [
      {
        id: 'TR-1042',
        patientReference: 'PAT-RAT-8821 (Polytrauma)',
        sendingHospitalId: 'hosp-004',
        sendingHospitalName: 'Sub-District Hospital Chiplun',
        receivingHospitalId: 'hosp-001',
        receivingHospitalName: 'District Civil Hospital Ratnagiri',
        priority: 'Critical',
        requiredDepartment: 'Neurosurgery',
        requiredSpecialist: 'Dr. Sneha Joshi',
        requiredResources: ['ICU Bed', 'Ventilator', 'Emergency Bay'],
        bloodRequirement: {
          bloodGroup: 'O+',
          units: 2,
        },
        assignedAmbulanceId: 'amb-001',
        assignedAmbulanceNumber: 'MH-08-AX-1081',
        status: 'In Transit',
        timeline: [
          { title: 'Transfer Initiated', timestamp: now, note: 'Patient requires emergency craniotomy' },
          { title: 'Transfer Accepted', timestamp: now, note: 'Accepted by Civil Hospital Triage' },
          { title: 'Ambulance Dispatched', timestamp: now, note: 'ALS Unit MH-08-AX-1081 en route' },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  async findAll(filters?: { hospitalId?: string; status?: TransferStatus }): Promise<TransferRequest[]> {
    let result = [...this.transfers];
    if (filters) {
      if (filters.hospitalId) {
        result = result.filter(
          (t) => t.sendingHospitalId === filters.hospitalId || t.receivingHospitalId === filters.hospitalId
        );
      }
      if (filters.status) {
        result = result.filter((t) => t.status === filters.status);
      }
    }
    return result;
  }

  async findById(id: string): Promise<TransferRequest | null> {
    const transfer = this.transfers.find((t) => t.id === id);
    return transfer || null;
  }

  async create(data: Omit<TransferRequest, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>): Promise<TransferRequest> {
    const now = new Date().toISOString();
    const newTransfer: TransferRequest = {
      ...data,
      id: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      timeline: [
        {
          title: 'Transfer Requested',
          timestamp: now,
          note: `Request sent from ${data.sendingHospitalName} to ${data.receivingHospitalName}`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    this.transfers.push(newTransfer);
    return newTransfer;
  }

  async updateStatus(id: string, status: TransferStatus, rejectionReason?: string, assignedAmbulanceId?: string): Promise<TransferRequest | null> {
    const transfer = await this.findById(id);
    if (!transfer) return null;

    const now = new Date().toISOString();
    transfer.status = status;
    if (rejectionReason) transfer.rejectionReason = rejectionReason;
    if (assignedAmbulanceId) transfer.assignedAmbulanceId = assignedAmbulanceId;
    transfer.updatedAt = now;

    transfer.timeline.push({
      title: `Transfer Status Updated: ${status}`,
      timestamp: now,
      note: rejectionReason ? `Reason: ${rejectionReason}` : `Status changed to ${status}`,
    });

    return transfer;
  }
}

export const transferRepository: TransferRepository = new MockTransferRepository();
