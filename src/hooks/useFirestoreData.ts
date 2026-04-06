import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Client, CallRecord } from '@/types/client';
import { subscribeClients, subscribeCalls, addCall as addCallFn, addClient as addClientFn, deleteClient as deleteClientFn } from '@/lib/firestore-services';

export const useFirestoreData = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubClients = subscribeClients(user.uid, (c) => {
      setClients(c);
      setLoading(false);
    });
    const unsubCalls = subscribeCalls(user.uid, setCalls);

    return () => {
      unsubClients();
      unsubCalls();
    };
  }, [user]);

  const addCall = async (call: Omit<CallRecord, 'id'>) => {
    if (!user) return;
    await addCallFn(user.uid, call);
  };

  const addClient = async (client: Omit<Client, 'id'>) => {
    if (!user) return;
    await addClientFn(user.uid, client);
  };

  const deleteClient = async (clientId: string) => {
    if (!user) return;
    await deleteClientFn(user.uid, clientId);
  };

  return { clients, calls, loading, addCall, addClient, deleteClient };
};
