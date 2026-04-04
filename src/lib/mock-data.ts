import { Client, CallRecord } from '@/types/client';

export const mockClients: Client[] = [
  { id: '1', name: 'João Silva', type: 'cpf', document: '123.456.789-00', email: 'joao@email.com', phone: '(11) 99999-1234', status: 'active', createdAt: new Date('2024-01-15'), lastCallAt: new Date('2024-03-20') },
  { id: '2', name: 'Maria Santos', type: 'cpf', document: '987.654.321-00', email: 'maria@email.com', phone: '(21) 98888-5678', status: 'prospect', createdAt: new Date('2024-02-10') },
  { id: '3', name: 'Tech Solutions Ltda', type: 'cnpj', document: '12.345.678/0001-90', company: 'Tech Solutions', email: 'contato@techsolutions.com', phone: '(11) 3333-4444', status: 'active', createdAt: new Date('2024-01-20'), lastCallAt: new Date('2024-03-18') },
  { id: '4', name: 'Global Services S.A.', type: 'cnpj', document: '98.765.432/0001-10', company: 'Global Services', email: 'comercial@globalservices.com', phone: '(21) 2222-3333', status: 'active', createdAt: new Date('2024-03-01'), lastCallAt: new Date('2024-03-19') },
  { id: '5', name: 'Carlos Oliveira', type: 'cpf', document: '111.222.333-44', email: 'carlos@email.com', phone: '(31) 97777-8888', status: 'inactive', createdAt: new Date('2023-11-05') },
  { id: '6', name: 'Inovação Digital EIRELI', type: 'cnpj', document: '55.666.777/0001-88', company: 'Inovação Digital', email: 'vendas@inovacaodigital.com', phone: '(41) 4444-5555', status: 'prospect', createdAt: new Date('2024-03-10') },
];

export const mockCalls: CallRecord[] = [
  { id: '1', clientId: '1', clientName: 'João Silva', date: new Date(), duration: 12, outcome: 'answered', notes: 'Interessado no plano premium', nextAction: 'Enviar proposta' },
  { id: '2', clientId: '3', clientName: 'Tech Solutions Ltda', date: new Date(), duration: 0, outcome: 'no_answer', notes: 'Não atendeu', nextAction: 'Ligar novamente amanhã' },
  { id: '3', clientId: '4', clientName: 'Global Services S.A.', date: new Date(), duration: 25, outcome: 'answered', notes: 'Fechamento de contrato agendado', nextAction: 'Reunião sexta-feira' },
  { id: '4', clientId: '2', clientName: 'Maria Santos', date: new Date(), duration: 5, outcome: 'callback', notes: 'Pediu para retornar à tarde' },
  { id: '5', clientId: '6', clientName: 'Inovação Digital EIRELI', date: new Date(Date.now() - 86400000), duration: 8, outcome: 'answered', notes: 'Primeiro contato realizado' },
];
