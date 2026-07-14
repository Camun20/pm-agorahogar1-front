import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ClipboardList, Plus, BarChart3, HelpCircle, CheckCircle, 
  Trash2, AlertCircle, Info, Calendar
} from 'lucide-react';

interface SurveyOption {
  id: string;
  text: string;
  votes: number;
}

interface SurveyQuestion {
  id: string;
  text: string;
  options: SurveyOption[];
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
  
  // Create Survey Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    {
      id: 'q1',
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
            text: '¿Cuál combinación de colores prefieres?',
            options: [
              { id: 'opt1', text: 'Gris Grafito y Blanco Nieve', votes: 24 },
              { id: 'opt2', text: 'Azul Oxford y Arena', votes: 15 },
              { id: 'opt3', text: 'Beige Clásico y Terracota', votes: 9 }
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

  // Handle answers
  const handleVote = (surveyId: string, questionId: string, optionId: string) => {
    const updated = surveys.map(survey => {
      if (survey.id === surveyId) {
        const updatedQuestions = survey.questions.map(q => {
          if (q.id === questionId) {
            const updatedOptions = q.options.map(opt => {
              if (opt.id === optionId) {
                return { ...opt, votes: opt.votes + 1 };
              }
              return opt;
            });
            return { ...q, options: updatedOptions };
          }
          return q;
        });
        return { ...survey, questions: updatedQuestions };
      }
      return survey;
    });

    setSurveys(updated);
    localStorage.setItem('lobbyapp_surveys', JSON.stringify(updated));

    const updatedAnswered = [...answeredSurveys, surveyId];
    setAnsweredSurveys(updatedAnswered);
    localStorage.setItem(`lobbyapp_answered_surveys_${user?.username}`, JSON.stringify(updatedAnswered));
  };

  // Add question to new survey
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}_${questions.length}`,
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
    updated[qIndex].options.push({
      id: `opt_${Date.now()}_${updated[qIndex].options.length}`,
      text: '',
      votes: 0
    });
    setQuestions(updated);
  };

  // Remove option from question
  const removeOption = (qIndex: number, optIndex: number) => {
    if (questions[qIndex].options.length <= 2) return;
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, i) => i !== optIndex);
    setQuestions(updated);
  };

  // Handle input changes
  const handleQuestionTextChange = (qIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].text = val;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIndex: number, optIndex: number, val: string) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = val;
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
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].text.trim()) {
          setSubmitError(`La opción ${j + 1} de la pregunta ${i + 1} está vacía.`);
          return;
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
        text: '',
        options: [
          { id: 'opt1', text: '', votes: 0 },
          { id: 'opt2', text: '', votes: 0 }
        ]
      }
    ]);
    setActiveTab('list');
  };

  const handleDeleteSurvey = (surveyId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta encuesta?')) {
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
          {isAdmin && (
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

      {activeTab === 'create' && isAdmin ? (
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
                <h3 className="text-sm font-bold text-indigo-400">Preguntas de Opción Múltiple</h3>
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
                  <div className="flex justify-between items-start gap-4">
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
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="p-2 mt-6 bg-slate-900 border border-slate-800 hover:bg-red-500/10 hover:border-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

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
                        {q.options.length > 2 && (
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
        /* List surveys */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Encuestas Disponibles</h2>
            {surveys.length > 0 ? (
              surveys.map((survey) => {
                const isVoted = answeredSurveys.includes(survey.id);
                return (
                  <div 
                    key={survey.id}
                    onClick={() => setSelectedSurvey(survey)}
                    className={`p-5 bg-slate-900/60 border rounded-2xl cursor-pointer hover:border-indigo-500/50 transition-all ${
                      selectedSurvey?.id === survey.id ? 'border-indigo-500 bg-slate-900' : 'border-slate-800/80'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-white text-base">{survey.title}</h3>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{survey.description}</p>
                        <div className="flex items-center gap-3 mt-3 text-xxs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Publicado: {survey.createdAt}
                          </span>
                          {isVoted ? (
                            <span className="flex items-center gap-0.5 text-emerald-400 font-semibold">
                              <CheckCircle className="w-3 h-3" /> Respondida
                            </span>
                          ) : (
                            <span className="text-amber-400 font-semibold">Pendiente de voto</span>
                          )}
                        </div>
                      </div>
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
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No hay encuestas activas en este momento.
              </div>
            )}
          </div>

          {/* Right details view / interactive vote card */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Detalles de Votación</h2>
            {selectedSurvey ? (
              <div className="bg-slate-900 border border-indigo-500/10 rounded-2xl p-5 space-y-4 shadow-xl">
                <div>
                  <h3 className="font-extrabold text-white text-base leading-tight">{selectedSurvey.title}</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{selectedSurvey.description}</p>
                </div>

                <div className="space-y-4 pt-3 border-t border-slate-800">
                  {selectedSurvey.questions.map((q) => {
                    const isVoted = answeredSurveys.includes(selectedSurvey.id);
                    const totalVotes = q.options.reduce((sum, o) => sum + o.votes, 0) || 1;

                    return (
                      <div key={q.id} className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-indigo-400" />
                          {q.text}
                        </h4>

                        <div className="space-y-2">
                          {q.options.map((opt) => {
                            const percent = Math.round((opt.votes / totalVotes) * 100);
                            return (
                              <div key={opt.id} className="space-y-1">
                                {isVoted || isAdmin ? (
                                  /* Voted / Admin view: show results and bars */
                                  <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1.5">
                                    <div className="flex justify-between text-xs font-medium">
                                      <span className="text-slate-300">{opt.text}</span>
                                      <span className="text-indigo-400">{opt.votes} votos ({percent}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                      <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${percent}%` }}></div>
                                    </div>
                                  </div>
                                ) : (
                                  /* Unvoted Resident View: Click to vote */
                                  <button
                                    onClick={() => handleVote(selectedSurvey.id, q.id, opt.id)}
                                    className="w-full text-left p-3 bg-slate-950 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                                  >
                                    {opt.text}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900/20 border border-slate-850 rounded-2xl text-slate-600 text-xs">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                Selecciona una encuesta de la lista para emitir tu voto o ver los resultados estadísticos en tiempo real.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Encuestas;
