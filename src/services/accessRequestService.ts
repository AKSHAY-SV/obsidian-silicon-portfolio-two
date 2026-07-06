import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { AccessRequest } from '../types/accessRequest';

const COLLECTION_NAME = 'portfolio_access_requests';

export enum OperationType {
  SUBMIT = 'submit',
  GET_PENDING = 'get_pending',
  APPROVE = 'approve',
  REJECT = 'reject',
  GET_BY_EMAIL = 'get_by_email',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | null;
    email: string | null;
    emailVerified: boolean | null;
  };
}

/**
 * Standardized error handling for Firestore operations in AccessRequestService.
 * Logs and throws a rich, readable error object.
 */
function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
    },
  };
  console.error(`[Firestore Error - ${operationType}]`, JSON.stringify(errInfo, null, 2));
  throw new Error(`Firestore operation failed: ${errInfo.error}`);
}

/**
 * Submits a new access request to Firestore.
 * Automatically handles initializing the ID, status, and createdAt timestamp.
 * 
 * @param requestData - The user-provided portion of the AccessRequest
 * @returns {Promise<AccessRequest>} The fully created AccessRequest object
 */
export async function submitAccessRequest(
  requestData: Omit<AccessRequest, 'id' | 'status' | 'createdAt' | 'approvedAt' | 'rejectedAt'>
): Promise<AccessRequest> {
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = doc(colRef);

  const newRequest: AccessRequest = {
    id: docRef.id,
    name: requestData.name,
    email: requestData.email,
    university: requestData.university,
    purpose: requestData.purpose,
    status: 'pending',
    createdAt: Timestamp.now(),
  };

  try {
    await setDoc(docRef, newRequest);
    return newRequest;
  } catch (error) {
    handleFirestoreError(error, OperationType.SUBMIT, `${COLLECTION_NAME}/${docRef.id}`);
  }
}

/**
 * Retrieves all requests currently in 'pending' status, sorted by creation time (descending).
 * 
 * @returns {Promise<AccessRequest[]>} An array of pending AccessRequest objects
 */
export async function getPendingRequests(): Promise<AccessRequest[]> {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(
    colRef,
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  try {
    const querySnapshot = await getDocs(q);
    const requests: AccessRequest[] = [];
    querySnapshot.forEach((docSnap) => {
      requests.push({
        ...docSnap.data(),
        id: docSnap.id,
      } as AccessRequest);
    });
    return requests;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET_PENDING, COLLECTION_NAME);
  }
}

/**
 * Approves a pending access request. Updates status to 'approved' and records the approval timestamp.
 * 
 * @param id - The Firestore document ID of the request
 * @returns {Promise<void>}
 */
export async function approveRequest(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const updateData = {
    status: 'approved',
    approvedAt: Timestamp.now(),
    rejectedAt: null // Reset rejectedAt if approved later
  };

  try {
    // Confirm the document exists first
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Access request with ID ${id} does not exist.`);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.APPROVE, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Rejects a pending access request. Updates status to 'rejected' and records the rejection timestamp.
 * 
 * @param id - The Firestore document ID of the request
 * @returns {Promise<void>}
 */
export async function rejectRequest(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const updateData = {
    status: 'rejected',
    rejectedAt: Timestamp.now(),
    approvedAt: null // Reset approvedAt if rejected later
  };

  try {
    // Confirm the document exists first
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Access request with ID ${id} does not exist.`);
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.REJECT, `${COLLECTION_NAME}/${id}`);
  }
}

/**
 * Looks up the most recent access request matching the given email address.
 * 
 * @param email - The email address to search for
 * @returns {Promise<AccessRequest | null>} The latest AccessRequest object or null if not found
 */
export async function getRequestByEmail(email: string): Promise<AccessRequest | null> {
  const colRef = collection(db, COLLECTION_NAME);
  const q = query(
    colRef,
    where('email', '==', email),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  try {
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    const docSnap = querySnapshot.docs[0];
    return {
      ...docSnap.data(),
      id: docSnap.id,
    } as AccessRequest;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET_BY_EMAIL, COLLECTION_NAME);
  }
}
