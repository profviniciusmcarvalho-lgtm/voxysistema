export type ClientType = 'cpf' | 'cnpj';

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  document: string; // CPF or CNPJ
  company?: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  lastCallAt?: Date;
  status: 'active' | 'inactive' | 'prospect';
}

export interface CallRecord {
  id: string;
  clientId: string;
  clientName: string;
  date: Date;
  duration: number; // minutes
  outcome: 'answered' | 'no_answer' | 'voicemail' | 'busy' | 'callback';
  notes: string;
  nextAction?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  url?: string;
}
