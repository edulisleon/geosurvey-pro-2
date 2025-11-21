
import React, { useState, useEffect } from 'react';
import { AppView, UserRole } from './types';
import SurveySessionManager from './components/SurveySessionManager';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import UserGuide from './components/UserGuide';
import { getCurrentUser, logout, changePassword } from './services/auth';
import { ClipboardList, BarChart3, Plus, Menu, LogOut, Shield, HelpCircle, Download, Settings, Users } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [showMenu, setShowMenu] = useState(false);
  const [newPass, setNewPass] = useState('');

  // Initial Auth Check
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setView(AppView.HOME);
    } else {
      setView(AppView.LOGIN);
    }
  }, []);

  const handleLoginSuccess = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setView(AppView.HOME);
  };

  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setView(AppView.LOGIN);
    setShowMenu(false);
  };

  const handleChangePassword = () => {
    if (currentUser && newPass.length >= 4) {
      changePassword(currentUser.username, newPass);
      alert("Contraseña actualizada exitosamente.");
      setCurrentUser(getCurrentUser()); // Refresh state
      setNewPass('');
    } else {
      alert("La contraseña debe tener al menos 4 caracteres.");
    }
  };

  // Prompt for first login password change
  if (currentUser?.isFirstLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Cambio de Clave Requerido</h2>
          <p className="text-slate-600 mb-6">
            Hola {currentUser.fullName}. Como es tu primer ingreso, debes establecer una nueva contraseña segura.
          </p>
          <input 
            type="password"
            className="w-full p-3 border border-slate-300 rounded-lg mb-4"
            placeholder="Nueva contraseña"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
          />
          <button 
            onClick={handleChangePassword}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold"
          >
            Actualizar y Continuar
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case AppView.LOGIN:
        return <Login onLoginSuccess={handleLoginSuccess} />;
      case AppView.SURVEY:
        return (
          <SurveySessionManager 
            onComplete={() => setView(AppView.HOME)}
            onCancel={() => setView(AppView.HOME)}
          />
        );
      case AppView.DASHBOARD:
        return <Dashboard onBack={() => setView(AppView.HOME)} />;
      case AppView.ADMIN_PANEL:
        return <AdminPanel onBack={() => setView(AppView.HOME)} />;
      case AppView.USER_GUIDE:
        return <UserGuide onBack={() => setView(AppView.HOME)} />;
      case AppView.HOME:
      default:
        // --- ADMIN HOME VIEW ---
        if (currentUser?.role === UserRole.ADMIN) {
          return (
            <div className="p-6 flex flex-col h-full max-w-md mx-auto pt-20 items-center text-center">
              <div className="mb-8">
                 <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-900 rounded-full mb-4 shadow-xl border-4 border-amber-400">
                    <Shield className="w-10 h-10 text-white" />
                 </div>
                 <h1 className="text-2xl font-bold text-slate-900">Bienvenido, Administrador</h1>
                 <p className="text-slate-500">Sistema de Gestión Centralizado</p>
              </div>

              <button 
                onClick={() => setView(AppView.ADMIN_PANEL)}
                className="w-full bg-red-600 text-white p-6 rounded-2xl shadow-xl hover:bg-red-700 transition-all border-b-4 border-red-800 flex items-center justify-between group mb-4"
              >
                <div className="text-left">
                  <h3 className="text-xl font-bold">Ingresar al Panel</h3>
                  <p className="text-sm text-red-200">Monitor, Chat y Configuración</p>
                </div>
                <Settings className="w-8 h-8" />
              </button>
              
              <p className="text-xs text-slate-400 mt-4 max-w-xs">
                Las funciones de recolección de datos están deshabilitadas para este rol. Ingrese como Voluntario para realizar encuestas.
              </p>
            </div>
          );
        }

        // --- VOLUNTEER HOME VIEW ---
        return (
          <div className="p-6 flex flex-col h-full max-w-md mx-auto pt-8 pb-20">
            {/* Banner Info User */}
            <div className="bg-slate-800 text-slate-200 p-4 rounded-xl mb-6 flex justify-between items-center shadow-lg border border-slate-700">
              <div>
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Bienvenido</p>
                <p className="font-bold text-white text-lg">{currentUser?.fullName}</p>
              </div>
              <div className="bg-slate-700 p-2 rounded-lg border border-slate-600">
                 <ClipboardList className="w-6 h-6 text-emerald-400"/>
              </div>
            </div>

            <div className="mb-6 text-center">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                GeoSurveyPro <span className="text-red-600">IDEHUPy</span>
              </h1>
            </div>

            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                  <ClipboardList className="w-3 h-3" /> Operaciones de Campo
                </div>
                
                <button 
                  onClick={() => setView(AppView.SURVEY)}
                  className="group w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white p-6 rounded-2xl shadow-lg shadow-red-200 transition-all hover:-translate-y-1 border-b-4 border-red-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">Nueva Captura</p>
                      <h3 className="text-2xl font-bold">Iniciar Encuesta</h3>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full text-amber-100 group-hover:bg-white/30 transition-colors">
                      <Plus className="w-6 h-6" />
                    </div>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <button 
                    onClick={() => setView(AppView.DASHBOARD)}
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 h-32 hover:border-red-200 transition-colors"
                  >
                    <div className="bg-red-50 p-3 rounded-full">
                      <BarChart3 className="w-6 h-6 text-red-600" />
                    </div>
                    <span className="font-bold text-sm">Mis Reportes</span>
                  </button>

                  <button 
                    onClick={() => setView(AppView.USER_GUIDE)}
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 h-32 hover:border-amber-200 transition-colors"
                  >
                    <div className="bg-amber-50 p-3 rounded-full">
                      <HelpCircle className="w-6 h-6 text-amber-500" />
                    </div>
                    <span className="font-bold text-sm">Ayuda</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Install Hint */}
            <div className="mt-8 bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-3 text-xs text-amber-900">
              <Download className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>App Offline:</strong> Selecciona "Agregar a pantalla principal" en tu navegador para usar sin internet.
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-amber-200">
      {/* Sticky Header */}
      {view !== AppView.LOGIN && (
         <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer" onClick={() => setView(AppView.HOME)}>
             <div className="bg-red-600 p-1 rounded text-white">
               <ClipboardList className="w-4 h-4" />
             </div>
             <span>IDEHUPy</span>
           </div>
           <div className="relative">
             <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
               <Menu className="w-6 h-6" />
             </button>
             
             {/* Dropdown Menu */}
             {showMenu && (
               <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                 <div className="p-4 border-b border-slate-100 bg-slate-50">
                   <p className="text-xs text-slate-500 uppercase font-bold mb-1">Usuario Activo</p>
                   <p className="font-bold text-slate-800 truncate">{currentUser?.fullName}</p>
                   <p className="text-xs text-slate-400">@{currentUser?.username}</p>
                 </div>
                 <button 
                   onClick={handleLogout}
                   className="w-full text-left p-4 text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm font-medium transition-colors"
                 >
                   <LogOut className="w-4 h-4" /> Cerrar Sesión
                 </button>
               </div>
             )}
           </div>
         </div>
      )}
      
      <main className="h-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
