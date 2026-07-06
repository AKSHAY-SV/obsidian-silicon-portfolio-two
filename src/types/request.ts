import { Timestamp } from 'firebase/firestore';

export type RequestStatus = 'pending' | 'under_review' | 'approved' | 'declined';

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  organization: string;
  purpose: string;
  requestedProject: string;
  status: RequestStatus;
  createdAt: Timestamp | Date | string;
  reviewedAt?: Timestamp | Date | string | null;
  reviewedBy?: string | null;
}
