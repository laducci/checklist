import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';

interface CategoryReport {
  category: string;
  totalQuestions: number;
  compliantCount: number;
  nonCompliantCount: number;
  notApplicableCount: number;
  adherencePercentage: number;
}

export default function AuditReport() {
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (!id) return;
    try {
      const data = await api.getAuditReport(id);
      setReport(data);
    } catch (err) {
      setError('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityLabel = (severity: string) => {
    const labels: Record<string, string> = {
      BAIXA: 'Baixa (5 dias)',
      MEDIA: 'Média (4 dias)',
      ALTA: 'Alta (3 dias)',
      CRITICA: 'Crítica (2 dias)',
    };
    return labels[severity] || severity;
  };

  const getSeverityClass = (severity: string) => {
    const classes: Record<string, string> = {
      BAIXA: 'badge-info',
      MEDIA: 'badge-warning',
      ALTA: 'badge-danger',
      CRITICA: 'badge-critical',
    };
    return classes[severity] || 'badge-secondary';
  };

  if (loading) return <div className="loading">Carregando relatório...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!report) return <div className="alert alert-error">Relatório não encontrado</div>;

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
        <h1 style={{ margin: 0 }}>Relatório Completo de Auditoria</h1>
        <div style={{ display: 'flex', gap: '1rem', flexShrink: 0 }}>
          <button onClick={() => window.print()} className="btn btn-primary">
            🖨️ Imprimir
          </button>
          <Link to={`/audits/${id}`} className="btn btn-secondary">
            Voltar
          </Link>
        </div>
      </div>

      {/* Informações da Auditoria */}
      <div className="card">
        <h2>Informações da Auditoria</h2>
        <table className="table">
          <tbody>
            <tr>
              <th>Auditor de QA</th>
              <td>{report.audit.performedBy.name}</td>
            </tr>
            <tr>
              <th>Data</th>
              <td>{new Date(report.audit.performedAt).toLocaleString('pt-BR')}</td>
            </tr>
            <tr>
              <th>Versão do Plano de Medição</th>
              <td>{report.audit.measurementPlanVersion || 'N/A'}</td>
            </tr>
            {report.audit.notes && (
              <tr>
                <th>Observações Gerais</th>
                <td>{report.audit.notes}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Resumo Geral */}
      <div className="card">
        <h2>Resumo da Auditoria</h2>
        <div className="stats">
          <div className="stat-card">
            <h3>{report.summary.overallAdherencePercentage.toFixed(1)}%</h3>
            <p>Aderência Total</p>
          </div>
          <div className="stat-card">
            <h3>{report.summary.compliantCount}</h3>
            <p>Respostas "Sim"</p>
          </div>
          <div className="stat-card">
            <h3>{report.summary.nonCompliantCount}</h3>
            <p>Respostas "Não"</p>
          </div>
          <div className="stat-card">
            <h3>{report.summary.notApplicableCount}</h3>
            <p>Não Aplicáveis</p>
          </div>
        </div>

        <table className="table" style={{ marginTop: '2rem' }}>
          <tbody>
            <tr>
              <th>Total de perguntas</th>
              <td>{report.summary.totalQuestions}</td>
            </tr>
            <tr>
              <th>Pontos avaliados</th>
              <td>{report.summary.evaluatedCount}</td>
            </tr>
            <tr>
              <th>Nº total de NCF abertas</th>
              <td>{report.summary.totalNonConformities}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Aderência por Área */}
      <div className="card">
        <h2>Aderência por Área / Categoria</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Área / Categoria</th>
              <th>Perguntas</th>
              <th>Conformes</th>
              <th>Não Conformes</th>
              <th>N/A</th>
              <th>Aderência (%)</th>
            </tr>
          </thead>
          <tbody>
            {report.categoriesReport.map((cat: CategoryReport) => (
              <tr key={cat.category}>
                <td><strong>{cat.category}</strong></td>
                <td>{cat.totalQuestions}</td>
                <td>{cat.compliantCount}</td>
                <td>{cat.nonCompliantCount}</td>
                <td>{cat.notApplicableCount}</td>
                <td>
                  <strong style={{ color: cat.adherencePercentage >= 80 ? '#22c55e' : cat.adherencePercentage >= 60 ? '#f59e0b' : '#ef4444' }}>
                    {cat.adherencePercentage.toFixed(1)}%
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Checklist Detalhado */}
      <div className="card">
        <h2>Checklist Detalhado</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Código</th>
              <th>Descrição</th>
              <th>Resultado</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {report.answers
              .sort((a: any, b: any) => a.checklistItem.order - b.checklistItem.order)
              .map((answer: any) => (
              <tr key={answer.id}>
                <td>{answer.checklistItem.order}</td>
                <td><strong>{answer.checklistItem.code}</strong></td>
                <td>{answer.checklistItem.description}</td>
                <td>
                  {answer.answer === 'COMPLIANT' && <span className="badge badge-success">Sim</span>}
                  {answer.answer === 'NON_COMPLIANT' && <span className="badge badge-danger">Não</span>}
                  {answer.answer === 'NOT_APPLICABLE' && <span className="badge">N/A</span>}
                </td>
                <td>{answer.comment || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda de Classificação */}
      <div className="card">
        <h2>Legenda - Classificação da NCF</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Classificação</th>
              <th>Prazo de Tratativa</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge badge-info">Baixa</span></td>
              <td>Resolver em até 5 dias</td>
              <td>Não conformidade com baixo impacto no processo de medição</td>
            </tr>
            <tr>
              <td><span className="badge badge-warning">Média</span></td>
              <td>Resolver em até 4 dias</td>
              <td>Não conformidade com impacto moderado, requer atenção</td>
            </tr>
            <tr>
              <td><span className="badge badge-danger">Alta</span></td>
              <td>Resolver em até 3 dias</td>
              <td>Não conformidade com alto impacto, necessita ação urgente</td>
            </tr>
            <tr>
              <td><span className="badge badge-critical">Crítica</span></td>
              <td>Resolver em até 2 dias</td>
              <td>Não conformidade crítica que compromete significativamente o processo</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Não Conformidades */}
      {report.nonConformities.length > 0 && (
        <div className="card">
          <h2>Não Conformidades Abertas ({report.nonConformities.length})</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Código Item</th>
                <th>Título</th>
                <th>Classificação</th>
                <th>Status</th>
                <th>Responsável</th>
                <th>Ação Corretiva</th>
              </tr>
            </thead>
            <tbody>
              {report.nonConformities.map((nc: any) => (
                <tr key={nc.id}>
                  <td><strong>{nc.checklistItem.code}</strong></td>
                  <td>{nc.title}</td>
                  <td>
                    <span className={`badge ${getSeverityClass(nc.severity)}`}>
                      {getSeverityLabel(nc.severity)}
                    </span>
                  </td>
                  <td>
                    {nc.status === 'OPEN' && <span className="badge badge-danger">Aberta</span>}
                    {nc.status === 'IN_PROGRESS' && <span className="badge badge-warning">Em Andamento</span>}
                    {nc.status === 'RESOLVED' && <span className="badge badge-success">Resolvida</span>}
                  </td>
                  <td>{nc.responsible || nc.assignedTo?.name || '-'}</td>
                  <td>{nc.correctiveAction || 'Pendente'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
          <strong>Documento gerado pela Plataforma de Auditoria de Qualidade</strong>
          <br />
          Baseado no Guia de Medição e Análise GUI.MA.01v01
        </p>
      </div>
    </div>
  );
}
