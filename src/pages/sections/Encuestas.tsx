import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showConfirm } from '../../utils/alerts';
import { 
  ClipboardList, Plus, HelpCircle, CheckCircle, 
  Trash2, AlertCircle, Info, Calendar, ArrowLeft, Send
} from 'lucide-react';

interface SurveyOption {
  id: string;
  text: string;
  votes: number;
}

interface SurveyQuestion {
  id: string;
  type: 'multiple' | 'open';
  text: string;
  options?: SurveyOption[];
  answers?: string[]; // Holds text responses for open questions
}

interface Survey {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt: string;
}

export const Encuestas: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SuperAdmin' || user?.role === 'ResidentialAdmin';
  
  // States
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [answeredSurveys, setAnsweredSurveys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  
  // Voting Form Temp Answers (key = questionId, value = optionId or open text)
  const [tempAnswers, setTempAnswers] = useState<Record<string, string>>({});
  const [voteError, setVoteError] = useState<string | null>(null);

  // Create Survey Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    {
      id: 'q1',
      type: 'multiple',
      text: '',
      options: [
        { id: 'opt1', text: '', votes: 0 },
        { id: 'opt2', text: '', votes: 0 }
      ]
    }
  ]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('lobbyapp_surveys');
    const initialSurveys: Survey[] = [
      {
        id: '1',
        title: 'Pintura y Embellecimiento de Fachadas',
        description: 'Votación para elegir el color principal de la fachada exterior de las torres.',
        createdAt: '2026-07-10',
        questions: [
          {
            id: 'q1',
            type: 'multiple',
            text: '¿Cuál combinación de colores prefieres?',
            options: [
              { id: 'opt1', text: 'Gris Grafito y Blanco Nieve', votes: 24 },
              { id: 'opt2', text: 'Azul Oxford y Arena', votes: 15 },
              { id: 'opt3', text: 'Beige Clásico y Terracota', votes: 9 }
            ]
          },
          {
            id: 'q2',
            type: 'open',
            text: 'Sugerencias adicionales sobre el diseño de las fachadas o acabados (Abierta):',
            answers: [
              'Me gustaría que consideraran pintura lavable.',
              'Deberíamos mantener los colores originales si es posible.'
            ]
          }
        ]
      },
      {
        id: '2',
        title: 'Horarios de Zonas Comunes (BBQ y Gimnasio)',
        description: 'Encuesta para ajustar los horarios de reserva nocturnos del salón BBQ.',
        createdAt: '2026-07-12',
        questions: [
          {
            id: 'q1',
            type: 'multiple',
            text: '¿Hasta qué hora debería permitirse el uso del BBQ los fines de semana?',
            options: [
              { id: 'opt1', text: '10:00 PM', votes: 8 },
              { id: 'opt2', text: '11:00 PM', votes: 32 },
              { id: 'opt3', text: '12:00 AM (Medianoche)', votes: 45 }
            ]
          }
        ]
      }
    ];

    if (saved) {
      try {
        setSurveys(JSON.parse(saved));
      } catch {
        setSurveys(initialSurveys);
      }
    } else {
      localStorage.setItem('lobbyapp_surveys', JSON.stringify(initialSurveys));
      setSurveys(initialSurveys);
    }

    const answered = localStorage.getItem(`lobbyapp_answered_surveys_${user?.username}`);
    if (answered) {
      setAnsweredSurveys(JSON.parse(answered));
    }
  }, [user?.username]);

  // Handle entire survey submission
  const handleSubmitAnswers = (e: React.FormEvent) => {
    e.preventDefault();
    setVoteError(null);

    if (!selectedSurvey) return;

    // Validate that all questions are answered
    for (const q of selectedSurvey.questions) {
      const ans = tempAnswers[q.id];
      if (!ans || !ans.trim()) {
        setVoteError('Por favor responde a todas las preguntas antes de enviar.');
        return;
      }
    }

    // Process submission: update surveys list
    const updated = surveys.map(survey => {
      if (survey.id === selectedSurvey.id) {
        const updatedQuestions = survey.questions.map(q => {
          const ans = tempAnswers[q.id];
          if (q.type === 'multiple') {
            const updatedOptions = q.options?.map(opt => {
              if (opt.id === ans) {
                return { ...opt, votes: opt.votes + 1 };
              }
              return opt;
            }) || [];
            return { ...q, options: updatedOptions };
          } else {
            return {
              ...q,
              answers: [...(q.answers || []), ans.trim()]
            };
          }
        });
        return { ...survey, questions: updatedQuestions };
      }
      return survey;
    });

    setSurveys(updated);
    localStorage.setItem('lobbyapp_surveys', JSON.stringify(updated));

    // Save as answered
    const updatedAnswered = [...answeredSurveys, selectedSurvey.id];
    setAnsweredSurveys(updatedAnswered);
    localStorage.setItem(`lobbyapp_answered_surveys_${user?.username}`, JSON.stringify(updatedAnswered));

    // Re-set selected survey view
    const current = updated.find(s => s.id === selectedSurvey.id);
    if (current) setSelectedSurvey(current);

    setTempAnswers({});
    showSuccess('Respuestas Guardadas', 'Tus respuestas han sido registradas con éxito.');
  };

  // Add question to new survey
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}_${questions.length}`,
        type: 'multiple',
        text: '',
        options: [
          { id: `opt_${Date.now()}_0`, text: '', votes: 0 },
          { id: `opt_${Date.now()}_1`, text: '', votes: 0 }
        ]
      }
    ]);
  };

  // Remove question
  const removeQuestion = (qIndex: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };

  // Add option to question
  const addOption = (qIndex: number) => {
    const updated = [...questions];
    if (!updated[qIndex].options) {
      updated[qIndex].options = [];
    }
    updated[qIndex].options!.push({
      id: `opt_${Date.now()}_${updated[qIndex].options!.length}`,
      text: '',
      votes: 0
    });
    setQuestions(updated);
  };

  // Remove option from question
  const removeOption = (qIndex: number, optIndex: number) => {
    const updated = [...questions];
    if (updated[qIndex].options && updated[qIndex].options!.length <= 2) return;
    updated[qIndex].options = updated[qIndex].options!.filter((_, i) => i !== optIndex);
    setQuestions(updated);
  };

  // Handle input changes
  const handleQuestionTextChange = (qIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].text = val;
    setQuestions(updated);
  };

  const handleQuestionTypeChange = (qIndex: number, type: 'multiple' | 'open') => {
    const updated = [...questions];
    updated[qIndex].type = type;
    if (type === 'open') {
      delete updated[qIndex].options;
    } else {
      updated[qIndex].options = [
        { id: `opt_${Date.now()}_0`, text: '', votes: 0 },
        { id: `opt_${Date.now()}_1`, text: '', votes: 0 }
      ];
    }
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...questions];
    if (updated[qIndex].options) {
      updated[qIndex].options![optIndex].text = val;
    }
    setQuestions(updated);
  };

  const handleCreateSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim() || !description.trim()) {
      setSubmitError('Por favor introduce título y descripción.');
      return;
    }

    // Validate questions and options
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        setSubmitError(`La pregunta ${i + 1} no tiene texto.`);
        return;
      }
      if (questions[i].type === 'multiple') {
        const opts = questions[i].options || [];
        for (let j = 0; j < opts.length; j++) {
          if (!opts[j].text.trim()) {
            setSubmitError(`La opción ${j + 1} de la pregunta ${i + 1} está vacía.`);
            return;
          }
        }
      }
    }

    const newSurvey: Survey = {
      id: `survey_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      questions,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newSurvey, ...surveys];
    setSurveys(updated);
    localStorage.setItem('lobbyapp_surveys', JSON.stringify(updated));

    // Reset Form
    setTitle('');
    setDescription('');
    setQuestions([
      {
        id: 'q1',
        type: 'multiple',
        text: '',
        options: [
          { id: 'opt1', text: '', votes: 0 },
          { id: 'opt2', text: '', votes: 0 }
        ]
      }
    ]);
    setActiveTab('list');
  };

  const handleDeleteSurvey = async (surveyId: string) => {
    const isConfirmed = await showConfirm(
      '¿Eliminar encuesta?',
      '¿Estás seguro de que deseas eliminar esta encuesta?',
      'Sí, eliminar'
    );
    if (isConfirmed) {
      const updated = surveys.filter(s => s.id !== surveyId);
      setSurveys(updated);
      localStorage.setItem('lobbyapp_surveys', JSON.stringify(updated));
      if (selectedSurvey?.id === surveyId) {
        setSelectedSurvey(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
              <ClipboardList className="w-3.5 h-3.5" />
              Decisiones de Copropiedad
            </span>
            <h1 className="text-2xl font-extrabold text-white">Encuestas y Sondeos</h1>
            <p className="text-slate-400 text-sm mt-1">
              Participa en las votaciones del conjunto o diseña consultas para la comunidad.
            </p>
          </div>
          {isAdmin && !selectedSurvey && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Listado
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-indigo-400 hover:bg-slate-800/50'
                }`}
              >
                <Plus className="w-4 h-4" />
                Crear Encuesta
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedSurvey ? (
        /* FULL SCREEN DETAIL VIEW (replacing list side-by-side layout) */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <button
              onClick={() => { setSelectedSurvey(null); setVoteError(null); setTempAnswers({}); }}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Listado
            </button>
            <span className="text-xxs text-slate-500 font-mono">ID: {selectedSurvey.id}</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-white">{selectedSurvey.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{selectedSurvey.description}</p>
          </div>

          {/* If resident already answered */}
          {answeredSurveys.includes(selectedSurvey.id) && !isAdmin ? (
            <div className="p-6 bg-slate-950/80 border border-slate-850 rounded-2xl text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-white font-bold text-sm">Encuesta Respondida</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                ¡Gracias por participar! Has respondido a esta encuesta con éxito. Por motivos de privacidad, las respuestas consolidadas son gestionadas de manera interna por la administración.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAnswers} className="space-y-6 pt-4 border-t border-slate-850">
              {selectedSurvey.questions.map((q, index) => {
                const totalVotes = q.options?.reduce((sum, o) => sum + o.votes, 0) || 1;

                return (
                  <div key={q.id} className="p-5 bg-slate-950/50 border border-slate-850 rounded-xl space-y-4">
                    <h4 className="text-sm font-bold text-slate-200 flex items-start gap-2">
                      <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{index + 1}. {q.text}</span>
                    </h4>

                    {q.type === 'multiple' ? (
                      <div className="space-y-3 pl-7">
                        {/* Closed question options */}
                        {q.options?.map((opt) => {
                          const percent = Math.round((opt.votes / totalVotes) * 100);
                          
                          if (isAdmin) {
                            /* Admin View: Show results count and progress bar */
                            return (
                              <div key={opt.id} className="space-y-1.5 p-3 bg-slate-900 border border-slate-800 rounded-lg">
                                <div className="flex justify-between text-xs font-medium">
                                  <span className="text-slate-300">{opt.text}</span>
                                  <span className="text-indigo-400 font-semibold">{opt.votes} votos ({percent}%)</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                </div>
                              </div>
                            );
                          } else {
                            /* Unvoted Resident View: Radio buttons */
                            return (
                              <label key={opt.id} className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-white rounded-xl cursor-pointer transition select-none">
                                <input
                                  type="radio"
                                  name={`question_${q.id}`}
                                  value={opt.id}
                                  checked={tempAnswers[q.id] === opt.id}
                                  onChange={() => setTempAnswers({ ...tempAnswers, [q.id]: opt.id })}
                                  className="w-4 h-4 text-indigo-600 bg-slate-950 border-slate-800 focus:ring-indigo-500 focus:ring-offset-slate-900 focus:ring-2"
                                  required
                                />
                                <span className="text-xs font-medium">{opt.text}</span>
                              </label>
                            );
                          }
                        })}
                      </div>
                    ) : (
                      <div className="pl-7">
                        {/* Open ended question answers list (Admin) or textarea input (Resident) */}
                        {isAdmin ? (
                          <div className="space-y-2">
                            <h5 className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Respuestas Textuales Recibidas:</h5>
                            {q.answers && q.answers.length > 0 ? (
                              <ul className="space-y-2">
                                {q.answers.map((ans, aIdx) => (
                                  <li key={aIdx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 italic leading-relaxed">
                                    "{ans}"
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-xs text-slate-500 italic">Sin respuestas de texto recibidas aún.</p>
                            )}
                          </div>
                        ) : (
                          <textarea
                            value={tempAnswers[q.id] || ''}
                            onChange={(e) => setTempAnswers({ ...tempAnswers, [q.id]: e.target.value })}
                            placeholder="Escribe tu respuesta detallada aquí..."
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-xs text-slate-100 resize-none placeholder-slate-600 transition"
                            required
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {voteError && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs max-w-md">
                  <AlertCircle className="w-4 h-4" />
                  <span>{voteError}</span>
                </div>
              )}

              {!isAdmin && (
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedSurvey(null); setVoteError(null); setTempAnswers({}); }}
                    className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/10 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Enviar Respuestas
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      ) : activeTab === 'create' && isAdmin ? (
        /* Create Survey Component */
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-4">Diseñar Nueva Encuesta</h2>
          
          <form onSubmit={handleCreateSurvey} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Título de la Encuesta *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Renovación del Parque Infantil"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 uppercase font-semibold">Descripción / Contexto *</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explica detalladamente la propuesta o el propósito..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl outline-none text-sm text-slate-100"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-indigo-400">Preguntas de la Consulta</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1 text-xs bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Pregunta
                </button>
              </div>

              {questions.map((q, qIndex) => (
                <div key={q.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs text-slate-500 font-semibold uppercase">Pregunta {qIndex + 1} *</label>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                        placeholder="Escribe la pregunta..."
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none text-sm text-slate-100"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 md:mt-6">
                      <div className="space-y-1.5">
                        <select
                          value={q.type}
                          onChange={(e) => handleQuestionTypeChange(qIndex, e.target.value as 'multiple' | 'open')}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 text-xs rounded-lg outline-none cursor-pointer"
                        >
                          <option value="multiple">Opción Múltiple</option>
                          <option value="open">Respuesta Abierta</option>
                        </select>
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="p-2 bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                          title="Remover Pregunta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {q.type === 'multiple' && q.options && (
                    <div className="pl-4 border-l-2 border-slate-800 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">Opciones de respuesta</span>
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-1 rounded-md transition"
                        >
                          + Añadir Opción
                        </button>
                      </div>

                      {q.options.map((opt, optIndex) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <span className="text-xs text-slate-600 font-semibold">{optIndex + 1}.</span>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => handleOptionTextChange(qIndex, optIndex, e.target.value)}
                            placeholder={`Opción ${optIndex + 1}`}
                            className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg outline-none text-xs text-slate-100"
                            required
                          />
                          {q.options!.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(qIndex, optIndex)}
                              className="p-1.5 text-slate-500 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{submitError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg"
              >
                Publicar Encuesta
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* List surveys (Full width layout) */
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Encuestas Disponibles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveys.length > 0 ? (
              surveys.map((survey) => {
                const isVoted = answeredSurveys.includes(survey.id);
                return (
                  <div 
                    key={survey.id}
                    onClick={() => setSelectedSurvey(survey)}
                    className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-extrabold text-white text-lg tracking-tight">{survey.title}</h3>
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSurvey(survey.id);
                            }}
                            className="p-1.5 bg-slate-950 border border-slate-800 hover:border-red-500/25 hover:text-red-400 text-slate-500 rounded-lg transition"
                            title="Eliminar Encuesta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed line-clamp-3">{survey.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-xxs text-slate-500 pt-3 border-t border-slate-900">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Publicado: {survey.createdAt}
                      </span>
                      {isVoted ? (
                        <span className="flex items-center gap-0.5 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Respondida
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
                          Pendiente de voto
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No hay encuestas activas en este momento.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Encuestas;
