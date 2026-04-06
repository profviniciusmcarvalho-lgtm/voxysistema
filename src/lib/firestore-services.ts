import {
  collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy, Timestamp, onSnapshot,
  type DocumentData, type QuerySnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { Client, CallRecord, UploadedFile } from '@/types/client';

// ── Helpers ──
const toDate = (t: Timestamp | Date) => t instanceof Timestamp ? t.toDate() : t;

const clientFromDoc = (d: DocumentData, id: string): Client => ({
  id,
  name: d.name,
  type: d.type,
  document: d.document,
  company: d.company,
  email: d.email,
  phone: d.phone,
  address: d.address,
  notes: d.notes,
  status: d.status,
  createdAt: toDate(d.createdAt),
  lastCallAt: d.lastCallAt ? toDate(d.lastCallAt) : undefined,
});

const callFromDoc = (d: DocumentData, id: string): CallRecord => ({
  id,
  clientId: d.clientId,
  clientName: d.clientName,
  date: toDate(d.date),
  duration: d.duration,
  outcome: d.outcome,
  notes: d.notes,
  nextAction: d.nextAction,
});

// ── Clients ──
export const getClients = async (userId: string): Promise<Client[]> => {
  const q = query(collection(db, 'users', userId, 'clients'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map(d => clientFromDoc(d.data(), d.id));
};

export const subscribeClients = (userId: string, cb: (clients: Client[]) => void) => {
  const q = query(collection(db, 'users', userId, 'clients'), orderBy('name'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => clientFromDoc(d.data(), d.id)));
  });
};

export const addClient = async (userId: string, client: Omit<Client, 'id'>) => {
  const data = { ...client, createdAt: Timestamp.fromDate(client.createdAt) };
  if (data.lastCallAt) (data as any).lastCallAt = Timestamp.fromDate(data.lastCallAt as Date);
  return addDoc(collection(db, 'users', userId, 'clients'), data);
};

export const updateClient = async (userId: string, clientId: string, data: Partial<Client>) => {
  const ref = doc(db, 'users', userId, 'clients', clientId);
  const payload: any = { ...data };
  if (payload.createdAt) payload.createdAt = Timestamp.fromDate(payload.createdAt);
  if (payload.lastCallAt) payload.lastCallAt = Timestamp.fromDate(payload.lastCallAt);
  return updateDoc(ref, payload);
};

export const deleteClient = async (userId: string, clientId: string) => {
  return deleteDoc(doc(db, 'users', userId, 'clients', clientId));
};

// ── Calls ──
export const getCalls = async (userId: string): Promise<CallRecord[]> => {
  const q = query(collection(db, 'users', userId, 'calls'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => callFromDoc(d.data(), d.id));
};

export const subscribeCalls = (userId: string, cb: (calls: CallRecord[]) => void) => {
  const q = query(collection(db, 'users', userId, 'calls'), orderBy('date', 'desc'));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map(d => callFromDoc(d.data(), d.id)));
  });
};

export const addCall = async (userId: string, call: Omit<CallRecord, 'id'>) => {
  const data = { ...call, date: Timestamp.fromDate(call.date) };
  return addDoc(collection(db, 'users', userId, 'calls'), data);
};

// ── Files ──
export const getFiles = async (userId: string): Promise<UploadedFile[]> => {
  const q = query(collection(db, 'users', userId, 'files'), orderBy('uploadedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return { id: d.id, name: data.name, type: data.type, size: data.size, uploadedAt: toDate(data.uploadedAt), url: data.url } as UploadedFile;
  });
};

export const addFile = async (userId: string, file: Omit<UploadedFile, 'id'>) => {
  const data = { ...file, uploadedAt: Timestamp.fromDate(file.uploadedAt) };
  return addDoc(collection(db, 'users', userId, 'files'), data);
};

export const deleteFile = async (userId: string, fileId: string) => {
  return deleteDoc(doc(db, 'users', userId, 'files', fileId));
};


