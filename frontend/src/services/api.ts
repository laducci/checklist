const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ChecklistItem {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  order: number;
}

export interface Audit {
  id: string;
  performedAt: string;
  overallAdherencePercentage: number;
  measurementPlanVersion?: string;
  notes?: string;
  performedBy: User;
  _count?: {
    nonConformities: number;
  };
}

export interface AuditAnswer {
  id: string;
  answer: 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
  comment?: string;
  checklistItem: ChecklistItem;
}

export interface NonConformity {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  severity: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  rootCause?: string;
  correctiveAction?: string;
  responsible?: string;
  observations?: string;
  emailSent?: boolean;
  dueDate?: string;
  resolvedAt?: string;
  createdAt: string;
  checklistItem: ChecklistItem;
  assignedTo?: User;
  openedBy: User;
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Falha no login');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_URL}/users`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar usuários');
    return response.json();
  }

  async getChecklistItems(): Promise<ChecklistItem[]> {
    const response = await fetch(`${API_URL}/checklist-items`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar itens do checklist');
    return response.json();
  }

  async createAudit(data: {
    performedByUserId: string;
    measurementPlanVersion?: string;
    notes?: string;
    answers: Array<{
      checklistItemId: string;
      answer: 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
      comment?: string;
    }>;
  }) {
    const response = await fetch(`${API_URL}/audits`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao criar auditoria');
    return response.json();
  }

  async getAudits(): Promise<Audit[]> {
    const response = await fetch(`${API_URL}/audits`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar auditorias');
    return response.json();
  }

  async getAuditById(id: string) {
    const response = await fetch(`${API_URL}/audits/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar auditoria');
    return response.json();
  }

  async getAuditReport(id: string) {
    const response = await fetch(`${API_URL}/audits/${id}/report`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar relatório');
    return response.json();
  }

  async getNonConformities(status?: string): Promise<NonConformity[]> {
    const url = status 
      ? `${API_URL}/non-conformities?status=${status}`
      : `${API_URL}/non-conformities`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar não conformidades');
    return response.json();
  }

  async getNonConformityById(id: string) {
    const response = await fetch(`${API_URL}/non-conformities/${id}`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro ao buscar não conformidade');
    return response.json();
  }

  async updateNonConformity(id: string, data: {
    status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    severity?: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    assignedToUserId?: string | null;
    responsible?: string;
    rootCause?: string;
    correctiveAction?: string;
    dueDate?: string;
  }) {
    const response = await fetch(`${API_URL}/non-conformities/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao atualizar não conformidade');
    return response.json();
  }
}

export const api = new ApiService();
