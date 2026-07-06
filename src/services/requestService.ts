import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { AccessRequest, RequestStatus } from '../types/request';

const COLLECTION_NAME = 'access_requests';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    emailVerified: boolean | null;
    isAnonymous: boolean | null;
    tenantId: string | null;
    providerInfo: {
      providerId: string | null;
      email: string | null;
    }[];
  };
}

/**
 * Standardized error handling for Firestore operations.
 * If a Firestore operation fails, logs and throws a rich JSON error.
 */
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email || null,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Creates a new project access request in Firestore.
 */
export async function createRequest(
  data: Omit<AccessRequest, 'id' | 'status' | 'createdAt' | 'reviewedAt' | 'reviewedBy'>
): Promise<AccessRequest> {
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = doc(colRef);

  const newRequest: AccessRequest = {
    id: docRef.id,
    name: data.name,
    email: data.email,
    organization: data.organization,
    purpose: data.purpose,
    requestedProject: data.requestedProject,
    status: 'pending',
    createdAt: Timestamp.now(),
  };

  try {
    await setDoc(docRef, newRequest);
    return newRequest;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${docRef.id}`);
  }
}

/**
 * Fetches a single access request by ID.
 */
export async function getRequest(id: string): Promise<AccessRequest | null> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return docSnap.data() as AccessRequest;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Fetches a list of access requests, optionally filtered by status or email.
 */
export async function getRequests(filters?: { status?: RequestStatus; email?: string }): Promise<AccessRequest[]> {
  const colRef = collection(db, COLLECTION_NAME);
  let q = query(colRef);

  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters?.email) {
    q = query(q, where('email', '==', filters.email));
  }

  try {
    const querySnapshot = await getDocs(q);
    const requests: AccessRequest[] = [];
    querySnapshot.forEach((doc) => {
      requests.push(doc.data() as AccessRequest);
    });
    return requests;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, COLLECTION_NAME);
  }
}

/**
 * Updates the status of an existing access request.
 */
export async function updateRequestStatus(
  id: string,
  status: RequestStatus,
  reviewedBy?: string
): Promise<AccessRequest> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const updateData = {
    status,
    reviewedAt: Timestamp.now(),
    reviewedBy: reviewedBy || auth.currentUser?.email || auth.currentUser?.uid || 'system',
  };

  try {
    await updateDoc(docRef, updateData);
    const updatedDoc = await getDoc(docRef);
    if (!updatedDoc.exists()) {
      throw new Error(`Request with ID ${id} not found after update`);
    }
    return updatedDoc.data() as AccessRequest;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Deletes an existing access request.
 */
export async function deleteRequest(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${id}`);
  }
}
