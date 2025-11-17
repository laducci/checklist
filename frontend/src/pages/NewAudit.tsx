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
      <h1>Nova Auditoria</h1>
      
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>Informações Gerais</h2>
          
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

        <div className="card">
          <h2>Checklist do Plano de Medição (15 critérios)</h2>
          <p style={{ color: '#666', marginBottom: '2rem' }}>
            Avalie cada critério abaixo:
          </p>

          {(() => {
            // Agrupar itens por categoria
            const grouped = checklistItems.reduce((acc, item) => {
              if (!acc[item.category]) acc[item.category] = [];
              acc[item.category].push(item);
              return acc;
            }, {} as Record<string, ChecklistItem[]>);

            return Object.entries(grouped).map(([category, items]) => (
              <div key={category} style={{ marginBottom: '3rem' }}>
                <h3 style={{ 
                  color: '#2563eb', 
                  borderBottom: '2px solid #2563eb', 
                  paddingBottom: '0.5rem',
                  marginBottom: '1.5rem',
                  fontSize: '1.1rem'
                }}>
                  {category}
                </h3>
                
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
            ));
          })()}
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate('/audits')}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Salvando...' : 'Finalizar Auditoria'}
          </button>
        </div>
      </form>
    </div>
  );
}
