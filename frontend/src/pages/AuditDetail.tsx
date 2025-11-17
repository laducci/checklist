import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function AuditDetail() {
  const { id } = useParams<{ id: string }>();
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAudit();
  }, [id]);

  const loadAudit = async () => {
    if (!id) return;
    try {
      const data = await api.getAuditById(id);
      setAudit(data);
    } catch (err) {
      setError('Erro ao carregar auditoria');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!audit) return <div className="alert alert-error">Auditoria não encontrada</div>;

  const compliantCount = audit.answers.filter((a: any) => a.answer === 'COMPLIANT').length;
  const nonCompliantCount = audit.answers.filter((a: any) => a.answer === 'NON_COMPLIANT').length;
  const notApplicableCount = audit.answers.filter((a: any) => a.answer === 'NOT_APPLICABLE').length;

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
        <h1 style={{ margin: 0 }}>Detalhes da Auditoria</h1>
        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
          <Link 
            to={`/audits/${id}/report`} 
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: '500'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Relatório Completo
          </Link>
          <Link to="/audits" className="btn btn-secondary">
            Voltar
          </Link>
        </div>
      </div>

      <div className="stats">
        <div className="stat-card">
          <h3>{audit.overallAdherencePercentage.toFixed(1)}%</h3>
          <p>Aderência Geral</p>
        </div>
        <div className="stat-card">
          <h3>{compliantCount}</h3>
          <p>Itens Conformes</p>
        </div>
        <div className="stat-card">
          <h3>{nonCompliantCount}</h3>
          <p>Não Conformidades</p>
        </div>
        <div className="stat-card">
          <h3>{notApplicableCount}</h3>
          <p>Não Aplicáveis</p>
        </div>
      </div>

      <div className="card">
        <h2>Informações Gerais</h2>
        <p><strong>Data:</strong> {new Date(audit.performedAt).toLocaleString('pt-BR')}</p>
        <p><strong>Auditor:</strong> {audit.performedBy.name} ({audit.performedBy.email})</p>
        {audit.measurementPlanVersion && (
          <p><strong>Versão do Plano:</strong> {audit.measurementPlanVersion}</p>
        )}
        {audit.notes && (
          <div>
            <strong>Observações:</strong>
            <p style={{ marginTop: '0.5rem', color: '#666' }}>{audit.notes}</p>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Respostas do Checklist</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Item</th>
              <th>Resposta</th>
              <th>Comentário</th>
            </tr>
          </thead>
          <tbody>
            {audit.answers.map((answer: any) => (
              <tr key={answer.id}>
                <td><strong>{answer.checklistItem.code}</strong></td>
                <td>{answer.checklistItem.title}</td>
                <td>
                  {answer.answer === 'COMPLIANT' && (
                    <span className="badge badge-success">Conforme</span>
                  )}
                  {answer.answer === 'NON_COMPLIANT' && (
                    <span className="badge badge-danger">Não Conforme</span>
                  )}
                  {answer.answer === 'NOT_APPLICABLE' && (
                    <span className="badge badge-info">Não Aplicável</span>
                  )}
                </td>
                <td>{answer.comment || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {audit.nonConformities && audit.nonConformities.length > 0 && (
        <div className="card">
          <h2>Não Conformidades Geradas</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Código do Item</th>
                <th>Título</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {audit.nonConformities.map((nc: any) => (
                <tr key={nc.id}>
                  <td><strong>{nc.checklistItem.code}</strong></td>
                  <td>{nc.title}</td>
                  <td>
                    {nc.status === 'OPEN' && <span className="badge badge-danger">Aberta</span>}
                    {nc.status === 'IN_PROGRESS' && <span className="badge badge-warning">Em Andamento</span>}
                    {nc.status === 'RESOLVED' && <span className="badge badge-success">Resolvida</span>}
                  </td>
                  <td>{nc.assignedTo?.name || 'Não atribuído'}</td>
                  <td>
                    <Link to={`/non-conformities/${nc.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      Ver Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
