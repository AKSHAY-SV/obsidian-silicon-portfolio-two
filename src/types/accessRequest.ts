import { Timestamp } from 'firebase/firestore';

export interface AccessRequest {
  id?: string;
  name: string;
  email: string;
  university: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp | null;
  approvedAt?: Timestamp | null;
  approvedBy?: string | null;
  rejectedAt?: Timestamp | null;
  rejectedBy?: string | null;
}
