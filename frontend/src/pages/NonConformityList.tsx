import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, NonConformity } from '../services/api';

export default function NonConformityList() {
  const [ncs, setNcs] = useState<NonConformity[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNCs();
  }, [filter]);

  const loadNCs = async () => {
    try {
      const data = await api.getNonConformities(filter || undefined);
      setNcs(data);
    } catch (err) {
      setError('Erro ao carregar não conformidades');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const openCount = ncs.filter(nc => nc.status === 'OPEN').length;
  const inProgressCount = ncs.filter(nc => nc.status === 'IN_PROGRESS').length;
  const resolvedCount = ncs.filter(nc => nc.status === 'RESOLVED').length;

  return (
    <div>
      <h1>Não Conformidades</h1>

      <div className="stats">
        <div className="stat-card">
          <h3>{openCount}</h3>
          <p>Abertas</p>
        </div>
        <div className="stat-card">
          <h3>{inProgressCount}</h3>
          <p>Em Andamento</p>
        </div>
        <div className="stat-card">
          <h3>{resolvedCount}</h3>
          <p>Resolvidas</p>
        </div>
        <div className="stat-card">
          <h3>{ncs.length}</h3>
          <p>Total</p>
        </div>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="status-filter" style={{ marginRight: '1rem' }}>
            <strong>Filtrar por status:</strong>
          </label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          >
            <option value="">Todos</option>
            <option value="OPEN">Abertas</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="RESOLVED">Resolvidas</option>
          </select>
        </div>

        {ncs.length === 0 ? (
          <p>Nenhuma não conformidade encontrada.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Código do Item</th>
                <th>Título</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Data de Criação</th>
                <th>Prazo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ncs.map((nc) => (
                <tr key={nc.id}>
                  <td><strong>{nc.checklistItem.code}</strong></td>
                  <td>{nc.title}</td>
                  <td>
                    {nc.status === 'OPEN' && <span className="badge badge-danger">Aberta</span>}
                    {nc.status === 'IN_PROGRESS' && <span className="badge badge-warning">Em Andamento</span>}
                    {nc.status === 'RESOLVED' && <span className="badge badge-success">Resolvida</span>}
                  </td>
                  <td>{nc.assignedTo?.name || 'Não atribuído'}</td>
                  <td>{new Date(nc.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>{nc.dueDate ? new Date(nc.dueDate).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>
                    <Link to={`/non-conformities/${nc.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                      Detalhes
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
