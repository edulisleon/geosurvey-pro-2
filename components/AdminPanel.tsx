
import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, SurveyConfig, VolunteerStatus, ChatMessage } from '../types';
import { getUsers, createUser, deleteUser } from '../services/auth';
import { getSurveyConfig, saveSurveyConfig, generateDrivePackage } from '../services/config.ts';
import { getMessages, sendMessage } from '../services/chat.ts';
import { 
  ArrowLeft, Plus, Trash2, Settings, Users, Save, Download, Edit, 
  Activity, MessageSquare, Send, MapPin, User as UserIcon
} from 'lucide-react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell } from 'recharts';

interface Props {
  onBack: () => void;
}

const AdminPanel: React.FC<Props> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'CHAT' | 'USERS' | 'SURVEY'>('MONITOR');
  
  // --- State for Users & Config ---
  const [users, setUsers] = useState<User[]>(getUsers());
  const [config, setConfig] = useState<SurveyConfig>(getSurveyConfig());
  
  // --- State for Monitor (Simulated) ---
  const [volunteerStatuses, setVolunteerStatuses] = useState<VolunteerStatus[]>([]);
  
  // --- State for Chat ---
  const [selectedChatUser, setSelectedChatUser] = useState<User | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- State for User Management ---
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // --- State for Survey Config ---
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // --- Simulation Effects ---
  
  // Simulate Real-time GPS updates for Monitor
  useEffect(() => {
    if (activeTab !== 'MONITOR') return;

    const generateMockLocations = () => {
      const volunteers = getUsers().filter(u => u.role === UserRole.VOLUNTEER);
      const statuses: VolunteerStatus[] = volunteers.map((v, i) => {
        // Generate a somewhat random position around a center point
        const time = Date.now();
        const angle = (time / 1000) + i; // Movement factor
        const radius = 0.005 + (Math.sin(time/2000 + i) * 0.001); 
        
        return {
          username: v.username,
          fullName: v.fullName,
          lastLocation: {
            lat: -25.2637 + (Math.cos(angle) * radius),
            lng: -57.5759 + (Math.sin(angle) * radius)
          },
          lastUpdate: time,
          status: i % 3 === 0 ? 'IDLE' : 'ACTIVE'
        };
      });
      setVolunteerStatuses(statuses);
    };

    generateMockLocations();
    const interval = setInterval(generateMockLocations, 3000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // Poll Messages for Chat
  useEffect(() => {
    if (activeTab === 'CHAT' && selectedChatUser) {
      const loadMsgs = () => {
        const msgs = getMessages('admin', selectedChatUser.username);
        setCurrentMessages(msgs);
      };
      loadMsgs();
      const interval = setInterval(loadMsgs, 2000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedChatUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);


  // --- Handlers ---

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedChatUser) return;
    
    sendMessage('admin', selectedChatUser.username, chatInput);
    setChatInput('');
    // Optimistic update
    setCurrentMessages(prev => [...prev, {
      id: 'temp', sender: 'admin', recipient: selectedChatUser.username, text: chatInput, timestamp: Date.now(), read: true
    }]);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      username: newUsername,
      fullName: newFullName,
      password: newPassword,
      role: UserRole.VOLUNTEER,
      isFirstLogin: true
    };

    if (createUser(newUser)) {
      setUsers(getUsers());
      setNewUsername('');
      setNewFullName('');
      setNewPassword('');
      alert("Usuario creado exitosamente");
    } else {
      alert("El nombre de usuario ya existe");
    }
  };

  const handleDeleteUser = (username: string) => {
    if (window.confirm(`¿Eliminar usuario ${username}?`)) {
      deleteUser(username);
      setUsers(getUsers());
    }
  };

  const handleQuestionChange = (qId: number, field: 'text' | 'option', value: string, optIndex?: number) => {
    const newQuestions = config.questions.map(q => {
      if (q.id === qId) {
        if (field === 'text') {
          return { ...q, text: value };
        } else if (field === 'option' && optIndex !== undefined) {
          const newOpts = [...q.options];
          newOpts[optIndex] = value;
          return { ...q, options: newOpts };
        }
      }
      return q;
    });
    setConfig({ ...config, questions: newQuestions });
    setUnsavedChanges(true);
  };

  const handleSaveConfig = () => {
    saveSurveyConfig(config);
    setUnsavedChanges(false);
    alert("Configuración guardada.");
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Navbar */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">Centro de Mando IDEHUPy</h1>
            <p className="text-xs text-slate-400">Panel de Administración</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="w-20 sm:w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-2 space-y-1 mt-4">
            <NavButton 
              active={activeTab === 'MONITOR'} 
              onClick={() => setActiveTab('MONITOR')}
              icon={<Activity />} 
              label="Monitor en Vivo" 
            />
            <NavButton 
              active={activeTab === 'CHAT'} 
              onClick={() => setActiveTab('CHAT')}
              icon={<MessageSquare />} 
              label="Mensajes" 
            />
             <NavButton 
              active={activeTab === 'USERS'} 
              onClick={() => setActiveTab('USERS')}
              icon={<Users />} 
              label="Voluntarios" 
            />
             <NavButton 
              active={activeTab === 'SURVEY'} 
              onClick={() => setActiveTab('SURVEY')}
              icon={<Settings />} 
              label="Configuración" 
            />
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          
          {/* --- TAB: LIVE MONITOR --- */}
          {activeTab === 'MONITOR' && (
            <div className="h-full flex flex-col">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="text-red-600 animate-pulse" /> Radar Táctico GPS
                </h2>
                <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border">
                  Actualización: Tiempo Real (3s)
                </span>
              </div>
              
              <div className="flex-1 bg-slate-900 rounded-2xl shadow-inner border border-slate-700 relative overflow-hidden">
                {/* Simulated Map Grid */}
                <div className="absolute inset-0 opacity-10" 
                     style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                </div>
                
                <div className="absolute inset-0 flex items-center justify-center">
                   {volunteerStatuses.length === 0 && (
                     <p className="text-slate-500">Esperando señal de voluntarios...</p>
                   )}
                </div>

                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis type="number" dataKey="lastLocation.lng" domain={['auto', 'auto']} hide />
                    <YAxis type="number" dataKey="lastLocation.lat" domain={['auto', 'auto']} hide />
                    <ZAxis range={[100, 100]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }} 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-800 text-white p-3 rounded shadow-xl border border-slate-600 text-xs">
                              <p className="font-bold text-amber-400">{data.fullName}</p>
                              <p>Estado: {data.status}</p>
                              <p className="font-mono mt-1 opacity-70">{data.lastLocation.lat.toFixed(4)}, {data.lastLocation.lng.toFixed(4)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Volunteers" data={volunteerStatuses}>
                      {volunteerStatuses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.status === 'ACTIVE' ? '#ef4444' : '#fbbf24'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>

                {/* Overlay Legend */}
                <div className="absolute bottom-4 left-4 bg-slate-800/80 backdrop-blur p-3 rounded-lg border border-slate-600 text-xs text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full bg-red-500 block"></span> Activo
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-400 block"></span> Inactivo
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* --- TAB: CHAT --- */}
          {activeTab === 'CHAT' && (
            <div className="h-full flex gap-4">
              {/* User List */}
              <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                  Voluntarios
                </div>
                <div className="overflow-y-auto flex-1">
                  {users.filter(u => u.role === UserRole.VOLUNTEER).map(u => (
                    <button
                      key={u.username}
                      onClick={() => setSelectedChatUser(u)}
                      className={`w-full p-4 text-left flex items-center gap-3 hover:bg-slate-50 border-b border-slate-100 transition-colors ${selectedChatUser?.username === u.username ? 'bg-red-50 border-l-4 border-l-red-600' : ''}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        {u.fullName.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm truncate text-slate-800">{u.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">@{u.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {selectedChatUser ? (
                  <>
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">Chat con {selectedChatUser.fullName}</h3>
                      <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                      {currentMessages.length === 0 && (
                        <div className="text-center text-slate-400 mt-10 text-sm">No hay mensajes previos.</div>
                      )}
                      {currentMessages.map(msg => {
                        const isMe = msg.sender === 'admin';
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-xl text-sm shadow-sm ${isMe ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
                              <p>{msg.text}</p>
                              <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-red-200' : 'text-slate-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                      <input 
                        className="flex-1 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                        placeholder="Escriba un mensaje..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                      />
                      <button type="submit" className="bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-800 transition-colors">
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                    <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                    <p>Seleccione un voluntario para iniciar el chat</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB: USERS --- */}
          {activeTab === 'USERS' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                  <div className="bg-red-100 p-2 rounded-lg">
                    <Plus className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Registrar Nuevo Voluntario</h2>
                </div>
                
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nombre Completo</label>
                    <input 
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      value={newFullName}
                      onChange={e => setNewFullName(e.target.value)}
                      required
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Usuario (Login)</label>
                      <input 
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value.trim())}
                        required
                        placeholder="ej: juan.perez"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Contraseña Inicial</label>
                      <input 
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        placeholder="Mínimo 4 caracteres"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                    Crear Credenciales
                  </button>
                </form>
              </div>

               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuarios Registrados ({users.length})
                </div>
                <div className="divide-y divide-slate-100">
                  {users.map(u => (
                    <div key={u.username} className="p-4 flex justify-between items-center hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${u.role === UserRole.ADMIN ? 'bg-amber-500' : 'bg-slate-400'}`}>
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{u.fullName}</p>
                          <p className="text-xs text-slate-500 font-mono">@{u.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {u.role === UserRole.ADMIN ? (
                          <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold border border-amber-200">ADMIN</span>
                        ) : (
                          <button 
                            onClick={() => handleDeleteUser(u.username)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- TAB: SURVEY CONFIG --- */}
          {activeTab === 'SURVEY' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex gap-2 justify-end mb-4 sticky top-0 bg-slate-50 py-2 z-10">
                 <button 
                  onClick={() => {
                    const content = generateDrivePackage();
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `PAQUETE_DISTRIBUCION.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 flex items-center justify-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" /> Generar Paquete
                </button>
                <button 
                  onClick={handleSaveConfig}
                  disabled={!unsavedChanges}
                  className={`px-4 py-2 font-bold rounded-lg flex items-center justify-center gap-2 text-sm transition-all ${unsavedChanges ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg' : 'bg-slate-200 text-slate-400'}`}
                >
                  <Save className="w-4 h-4" /> {unsavedChanges ? 'Guardar' : 'Guardado'}
                </button>
              </div>

              {config.questions.map((q) => (
                <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group">
                  <div className="absolute -left-3 top-6 bg-slate-800 text-white w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold shadow-lg z-10 border-2 border-white">
                     {q.id}
                  </div>
                  <div className="pl-4">
                    <label className="text-xs font-bold uppercase text-slate-400 mb-1 block">Pregunta</label>
                    <input 
                      className="w-full p-3 border border-slate-200 bg-slate-50 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-400 font-medium text-slate-800 mb-4"
                      value={q.text}
                      onChange={(e) => handleQuestionChange(q.id, 'text', e.target.value)}
                    />
                    <div className="space-y-3 mt-4 border-l-2 border-slate-100 pl-4">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className="relative">
                           <span className="absolute left-0 top-1/2 -translate-y-1/2 -ml-6 w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-bold">
                             {['A','B','C','D','E'][idx]}
                           </span>
                          <input 
                            className="w-full p-2 border border-slate-100 rounded focus:border-amber-400 outline-none text-sm"
                            value={opt}
                            onChange={(e) => handleQuestionChange(q.id, 'option', e.target.value, idx)}
                            placeholder={`Opción ${idx + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

const NavButton: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex flex-col sm:flex-row items-center gap-1 sm:gap-3 p-3 rounded-lg transition-all mb-1 ${active ? 'bg-red-50 text-red-600 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
  >
    <div className={active ? 'text-red-600' : 'text-slate-400'}>{icon}</div>
    <span className="text-[10px] sm:text-sm">{label}</span>
  </button>
);

export default AdminPanel;
