import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, Audit } from '../services/api';

export default function AuditList() {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAudits();
  }, []);

  const loadAudits = async () => {
    try {
      const data = await api.getAudits();
      setAudits(data);
    } catch (err) {
      setError('Erro ao carregar auditorias');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Auditorias</h1>
        <Link to="/audits/new" className="btn btn-primary">
          Nova Auditoria
        </Link>
      </div>

      {audits.length === 0 ? (
        <div className="card">
          <p>Nenhuma auditoria realizada ainda.</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Auditor</th>
                <th>Aderência</th>
                <th>Não Conformidades</th>
                <th>Versão do Plano</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((audit) => (
                <tr key={audit.id}>
                  <td>{new Date(audit.performedAt).toLocaleString('pt-BR')}</td>
                  <td>{audit.performedBy.name}</td>
                  <td>
                    <span className={
                      audit.overallAdherencePercentage >= 80 ? 'badge badge-success' :
                      audit.overallAdherencePercentage >= 60 ? 'badge badge-warning' :
                      'badge badge-danger'
                    }>
                      {audit.overallAdherencePercentage.toFixed(1)}%
                    </span>
                  </td>
                  <td>{audit._count?.nonConformities || 0}</td>
                  <td>{audit.measurementPlanVersion || '-'}</td>
                  <td>
                    <Link to={`/audits/${audit.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      Detalhes
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
