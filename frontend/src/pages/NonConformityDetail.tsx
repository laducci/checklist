import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function NonConformityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [nc, setNc] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    assignedToUserId: '',
    severity: '',
    responsible: '',
    rootCause: '',
    correctiveAction: '',
    dueDate: '',
  });

  // Função para calcular prazo baseado na severidade
  const calculateDueDate = (severity: string, createdAt: string) => {
    const severityDays: Record<string, number> = {
      CRITICA: 2,
      ALTA: 3,
      MEDIA: 4,
      BAIXA: 5,
    };
    const days = severityDays[severity] || 4;
    const created = new Date(createdAt);
    const dueDate = new Date(created);
    dueDate.setDate(dueDate.getDate() + days);
    return dueDate;
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      const [ncData, usersData] = await Promise.all([
        api.getNonConformityById(id),
        api.getUsers(),
      ]);
      setNc(ncData);
      setUsers(usersData);
      setFormData({
        status: ncData.status,
        assignedToUserId: ncData.assignedTo?.id || '',
        severity: ncData.severity || 'MEDIA',
        responsible: ncData.responsible || '',
        rootCause: ncData.rootCause || '',
        correctiveAction: ncData.correctiveAction || '',
        dueDate: ncData.dueDate ? ncData.dueDate.split('T')[0] : '',
      });
    } catch (err) {
      setError('Erro ao carregar não conformidade');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError('');

    try {
      await api.updateNonConformity(id!, {
        status: formData.status as any,
        assignedToUserId: formData.assignedToUserId || null,
        severity: formData.severity as any,
        responsible: formData.responsible || undefined,
        rootCause: formData.rootCause || undefined,
        correctiveAction: formData.correctiveAction || undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      });
      
      await loadData();
      setEditMode(false);
      alert('Não conformidade atualizada com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar não conformidade');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error && !nc) return <div className="alert alert-error">{error}</div>;
  if (!nc) return <div className="alert alert-error">Não conformidade não encontrada</div>;

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{ margin: 0 }}>Detalhes da Não Conformidade</h1>
        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
          <Link to="/non-conformities" className="btn btn-secondary">
            Voltar
          </Link>
          {!editMode && (
            <button onClick={() => setEditMode(true)} className="btn btn-primary">
              Editar
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h2>Informações da NC</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <p><strong>Status:</strong></p>
            {nc.status === 'OPEN' && <span className="badge badge-danger">Aberta</span>}
            {nc.status === 'IN_PROGRESS' && <span className="badge badge-warning">Em Andamento</span>}
            {nc.status === 'RESOLVED' && <span className="badge badge-success">Resolvida</span>}
          </div>
          <div>
            <p><strong>Severidade:</strong></p>
            {nc.severity === 'CRITICA' && <span className="badge badge-danger">Crítica</span>}
            {nc.severity === 'ALTA' && <span className="badge" style={{ backgroundColor: '#ff6b6b', color: 'white' }}>Alta</span>}
            {nc.severity === 'MEDIA' && <span className="badge badge-warning">Média</span>}
            {nc.severity === 'BAIXA' && <span className="badge" style={{ backgroundColor: '#51cf66', color: 'white' }}>Baixa</span>}
          </div>
          <div>
            <p><strong>Responsável (Sistema):</strong></p>
            <p>{nc.assignedTo?.name || 'Não atribuído'}</p>
          </div>
          <div>
            <p><strong>Responsável (Manual):</strong></p>
            <p>{nc.responsible || 'Não definido'}</p>
          </div>
          <div>
            <p><strong>Aberto por:</strong></p>
            <p>{nc.openedBy.name}</p>
          </div>
          <div>
            <p><strong>Data de Criação:</strong></p>
            <p>{new Date(nc.createdAt).toLocaleString('pt-BR')}</p>
          </div>
          <div>
            <p><strong>Prazo (baseado na severidade):</strong></p>
            <p>{calculateDueDate(nc.severity, nc.createdAt).toLocaleDateString('pt-BR')}</p>
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
              {nc.severity === 'CRITICA' && '(2 dias úteis)'}
              {nc.severity === 'ALTA' && '(3 dias úteis)'}
              {nc.severity === 'MEDIA' && '(4 dias úteis)'}
              {nc.severity === 'BAIXA' && '(5 dias úteis)'}
            </p>
          </div>
          <div>
            <p><strong>Email Enviado:</strong></p>
            {nc.emailSent ? (
              <span className="badge badge-success">Sim</span>
            ) : (
              <span className="badge" style={{ backgroundColor: '#868e96', color: 'white' }}>Não</span>
            )}
          </div>
          {nc.resolvedAt && (
            <div>
              <p><strong>Data de Resolução:</strong></p>
              <p>{new Date(nc.resolvedAt).toLocaleString('pt-BR')}</p>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Título:</strong></p>
          <p style={{ fontSize: '1.1rem' }}>{nc.title}</p>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Descrição:</strong></p>
          <p style={{ color: '#666' }}>{nc.description}</p>
        </div>

        {nc.rootCause && (
          <div style={{ marginBottom: '1rem' }}>
            <p><strong>Causa Raiz:</strong></p>
            <p style={{ color: '#666' }}>{nc.rootCause}</p>
          </div>
        )}

        {nc.correctiveAction && (
          <div>
            <p><strong>Ação Corretiva:</strong></p>
            <p style={{ color: '#666' }}>{nc.correctiveAction}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Item do Checklist Relacionado</h2>
        <p><strong>{nc.checklistItem.code}</strong> - {nc.checklistItem.title}</p>
        <p style={{ color: '#666', marginTop: '0.5rem' }}>{nc.checklistItem.description}</p>
      </div>

      <div className="card">
        <h2>Auditoria Relacionada</h2>
        <p><strong>Data:</strong> {new Date(nc.audit.performedAt).toLocaleString('pt-BR')}</p>
        <p><strong>Auditor:</strong> {nc.audit.performedBy.name}</p>
        <p><strong>Aderência:</strong> {nc.audit.overallAdherencePercentage.toFixed(1)}%</p>
        <div style={{ marginTop: '1rem' }}>
          <Link to={`/audits/${nc.audit.id}`} className="btn btn-secondary">
            Ver Auditoria Completa
          </Link>
        </div>
      </div>

      {editMode && (
        <div className="card">
          <h2>Editar Não Conformidade</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="OPEN">Aberta</option>
                <option value="IN_PROGRESS">Em Andamento</option>
                <option value="RESOLVED">Resolvida</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity">Severidade</label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                required
              >
                <option value="BAIXA">Baixa (5 dias)</option>
                <option value="MEDIA">Média (4 dias)</option>
                <option value="ALTA">Alta (3 dias)</option>
                <option value="CRITICA">Crítica (2 dias)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assignedTo">Responsável (Sistema)</label>
              <select
                id="assignedTo"
                value={formData.assignedToUserId}
                onChange={(e) => setFormData({ ...formData, assignedToUserId: e.target.value })}
              >
                <option value="">Não atribuído</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="responsible">Responsável (Manual)</label>
              <input
                type="text"
                id="responsible"
                value={formData.responsible}
                onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Prazo (Opcional)</label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="rootCause">Causa Raiz</label>
              <textarea
                id="rootCause"
                value={formData.rootCause}
                onChange={(e) => setFormData({ ...formData, rootCause: e.target.value })}
                placeholder="Descreva a causa raiz identificada"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="correctiveAction">Ação Corretiva</label>
              <textarea
                id="correctiveAction"
                value={formData.correctiveAction}
                onChange={(e) => setFormData({ ...formData, correctiveAction: e.target.value })}
                placeholder="Descreva a ação corretiva implementada ou planejada"
                rows={4}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="btn btn-secondary"
                disabled={updating}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={updating}
              >
                {updating ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
