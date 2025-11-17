import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, ChecklistItem } from '../services/api';

export default function NewAudit() {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, { answer: string; comment: string }>>({});
  const [measurementPlanVersion, setMeasurementPlanVersion] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadChecklistItems();
  }, []);

  const loadChecklistItems = async () => {
    try {
      const items = await api.getChecklistItems();
      setChecklistItems(items);
      
      // Inicializar respostas
      const initialAnswers: Record<string, { answer: string; comment: string }> = {};
      items.forEach(item => {
        initialAnswers[item.id] = { answer: '', comment: '' };
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError('Erro ao carregar checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (itemId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], answer },
    }));
  };

  const handleCommentChange = (itemId: string, comment: string) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], comment },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todas as perguntas foram respondidas
    const unanswered = checklistItems.filter(item => !answers[item.id].answer);
    if (unanswered.length > 0) {
      setError(`Por favor, responda todos os itens do checklist (${unanswered.length} pendentes)`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const user = api.getCurrentUser();
      if (!user) throw new Error('Usuário não encontrado');

      const auditData = {
        performedByUserId: user.id,
        measurementPlanVersion: measurementPlanVersion || undefined,
        notes: notes || undefined,
        answers: checklistItems.map(item => ({
          checklistItemId: item.id,
          answer: answers[item.id].answer as 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE',
          comment: answers[item.id].comment || undefined,
        })),
      };

      const audit = await api.createAudit(auditData);
      
      // Contar NCs criadas
      const ncCount = auditData.answers.filter(a => a.answer === 'NON_COMPLIANT').length;
      if (ncCount > 0) {
        toast.success(`Auditoria criada! ${ncCount} email(s) de NC enviado(s).`, {
          duration: 4000,
        });
      } else {
        toast.success('Auditoria criada com sucesso!');
      }
      
      navigate(`/audits/${audit.id}`);
    } catch (err) {
      setError('Erro ao criar auditoria');
      toast.error('Erro ao criar auditoria');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div>
          <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>Nova Auditoria</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
            Preencha as informações e avalie todos os critérios do checklist
          </p>
        </div>
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{
          background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#1f2937',
            fontSize: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Informações Gerais
          </h2>
          
          <div className="form-group">
            <label htmlFor="version">Versão do Plano de Medição (opcional)</label>
            <input
              type="text"
              id="version"
              value={measurementPlanVersion}
              onChange={(e) => setMeasurementPlanVersion(e.target.value)}
              placeholder="Ex: v1.0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Observações (opcional)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações gerais sobre a auditoria"
            />
          </div>
        </div>

        <div className="card" style={{
          background: 'linear-gradient(to bottom, #ffffff, #f9fafb)',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <div>
              <h2 style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#1f2937',
                fontSize: '1.25rem',
                margin: 0,
                marginBottom: '0.5rem'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                </svg>
                Checklist do Plano de Medição
              </h2>
              <p style={{ color: '#6b7280', margin: 0, fontSize: '0.9rem' }}>
                Avalie cada um dos 15 critérios organizados em 4 blocos
              </p>
            </div>
            <span style={{
              background: '#2563eb',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              15 critérios
            </span>
          </div>

          {(() => {
            // Agrupar itens por categoria
            const grouped = checklistItems.reduce((acc, item) => {
              if (!acc[item.category]) acc[item.category] = [];
              acc[item.category].push(item);
              return acc;
            }, {} as Record<string, ChecklistItem[]>);

            // Ordenar categorias para manter a ordem correta dos blocos
            const orderedCategories = [
              'BLOCO 1 - Estabelecimento dos Objetivos de Medição',
              'BLOCO 2 - Especificação das Medidas',
              'BLOCO 3 - Coleta e Armazenamento dos Dados',
              'BLOCO 4 - Análise, Interpretação e Comunicação'
            ];

            return orderedCategories.filter(cat => grouped[cat]).map((category) => {
              const items = grouped[category];
              return (
              <div key={category} style={{ marginBottom: '3rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  padding: '1rem 1.5rem',
                  borderRadius: '0.5rem',
                  marginBottom: '1.5rem',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                }}>
                  <h3 style={{ 
                    margin: 0,
                    fontSize: '1.05rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 11 12 14 22 4"></polyline>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                    {category}
                  </h3>
                </div>
                
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Código</th>
                      <th>Critério</th>
                      <th style={{ width: '300px' }}>Resposta</th>
                      <th style={{ width: '200px' }}>Comentário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td><strong>{item.code}</strong></td>
                        <td>
                          <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{item.title}</strong>
                          <span style={{ fontSize: '0.9rem', color: '#666' }}>{item.description}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name={`answer-${item.id}`}
                                value="COMPLIANT"
                                checked={answers[item.id]?.answer === 'COMPLIANT'}
                                onChange={() => handleAnswerChange(item.id, 'COMPLIANT')}
                              />
                              <span className="badge badge-success">Conforme</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name={`answer-${item.id}`}
                                value="NON_COMPLIANT"
                                checked={answers[item.id]?.answer === 'NON_COMPLIANT'}
                                onChange={() => handleAnswerChange(item.id, 'NON_COMPLIANT')}
                              />
                              <span className="badge badge-danger">Não Conforme</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                              <input
                                type="radio"
                                name={`answer-${item.id}`}
                                value="NOT_APPLICABLE"
                                checked={answers[item.id]?.answer === 'NOT_APPLICABLE'}
                                onChange={() => handleAnswerChange(item.id, 'NOT_APPLICABLE')}
                              />
                              <span className="badge">N/A</span>
                            </label>
                          </div>
                        </td>
                        <td>
                          <textarea
                            value={answers[item.id]?.comment || ''}
                            onChange={(e) => handleCommentChange(item.id, e.target.value)}
                            placeholder="Opcional"
                            rows={3}
                            style={{ width: '100%', fontSize: '0.9rem', padding: '0.5rem' }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          });}
          )()}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '2px solid #e5e7eb'
        }}>
          <button
            type="button"
            onClick={() => navigate('/audits')}
            className="btn btn-secondary"
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              background: submitting ? '#9ca3af' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: submitting ? 'none' : '0 2px 4px rgba(37, 99, 235, 0.3)'
            }}
          >
            {submitting ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
                Salvando...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 11 12 14 22 4"></polyline>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                Finalizar Auditoria
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
