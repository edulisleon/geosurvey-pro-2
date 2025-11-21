
import React, { useState, useEffect } from 'react';
import { GPS_ACCURACY_THRESHOLD_METERS, MetaLocation, SurveyRecord, SurveyResponses, MIN_DURATION_SECONDS, MAX_DISTANCE_METERS, SurveyConfig } from '../types';
import { getCurrentLocation, calculateDistance } from '../services/geoUtils';
import { saveRecord } from '../services/db';
import { getCurrentUser } from '../services/auth';
import { getSurveyConfig } from '../services/config.ts';
import { Loader2, MapPin, AlertTriangle, CheckCircle2, Save, Navigation, FileText } from 'lucide-react';

interface Props {
  onComplete: () => void;
  onCancel: () => void;
}

const SurveySessionManager: React.FC<Props> = ({ onComplete, onCancel }) => {
  // State
  const [phase, setPhase] = useState<'INIT' | 'ACTIVE' | 'SAVING'>('INIT');
  const [gpsStatus, setGpsStatus] = useState<'IDLE' | 'SEARCHING' | 'LOCKED' | 'POOR_SIGNAL' | 'ERROR'>('IDLE');
  const [currentLocation, setCurrentLocation] = useState<MetaLocation | null>(null);
  const [startLocation, setStartLocation] = useState<MetaLocation | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [route, setRoute] = useState<MetaLocation[]>([]);
  
  // Config State
  const [config, setConfig] = useState<SurveyConfig | null>(null);

  // Form State
  const [citizenName, setCitizenName] = useState('');
  const [comments, setComments] = useState('');
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<number, string>>({});

  // Init
  useEffect(() => {
    const loadedConfig = getSurveyConfig();
    setConfig(loadedConfig);
  }, []);

  // Background Tracking Service Logic
  useEffect(() => {
    let intervalId: number | null = null;

    if (phase === 'ACTIVE') {
      getCurrentLocation().then(loc => setRoute(prev => [...prev, loc])).catch(console.error);

      intervalId = window.setInterval(async () => {
        try {
          const loc = await getCurrentLocation();
          console.log("Background Location Captured:", loc);
          setRoute(prev => [...prev, loc]);
        } catch (e) {
          console.warn("Background tracking failed temporarily", e);
        }
      }, 60000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [phase]);

  // Phase A: Initialization & Geo-Locking
  const attemptGeoLock = async () => {
    setGpsStatus('SEARCHING');
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location);

      if (location.accuracy <= GPS_ACCURACY_THRESHOLD_METERS) {
        setGpsStatus('LOCKED');
      } else {
        setGpsStatus('POOR_SIGNAL');
      }
    } catch (error) {
      console.error(error);
      setGpsStatus('ERROR');
    }
  };

  const startSurvey = () => {
    if (currentLocation && gpsStatus === 'LOCKED') {
      setStartLocation(currentLocation);
      setStartTime(Date.now());
      setRoute([currentLocation]); 
      setPhase('ACTIVE');
    }
  };

  // Phase C: Closing & Validation
  const finishSurvey = async () => {
    if (!startLocation) return;
    setPhase('SAVING');

    try {
      const currentUser = getCurrentUser();
      const endLocation = await getCurrentLocation(); 
      const endTime = Date.now();

      const durationSeconds = (endTime - startTime) / 1000;
      const distanceMeters = calculateDistance(startLocation, endLocation);

      let isSuspicious = false;
      const reasons: string[] = [];

      if (durationSeconds < MIN_DURATION_SECONDS) {
        isSuspicious = true;
        reasons.push('Duración muy corta');
      }

      if (distanceMeters > MAX_DISTANCE_METERS) {
        isSuspicious = true;
        reasons.push('Desplazamiento excesivo');
      }

      const finalRoute = [...route, endLocation];

      const responses: SurveyResponses = {
        citizenName,
        comments,
        dynamicAnswers
      };

      const record: SurveyRecord = {
        id: crypto.randomUUID(),
        userId: currentUser ? currentUser.username : 'unknown',
        startLocation,
        endLocation,
        route: finalRoute,
        startTime,
        endTime,
        durationSeconds,
        distanceMeters,
        responses,
        isSuspicious,
        suspiciousReason: reasons.join(', '),
      };

      saveRecord(record);
      
      setTimeout(() => {
        onComplete();
      }, 800);

    } catch (e) {
      alert("Error al cerrar encuesta: Fallo de GPS");
      setPhase('ACTIVE');
    }
  };

  // Helper to check completion
  const isFormValid = () => {
    if (!citizenName) return false;
    if (!config) return false;
    // Check if all questions have an answer
    for (const q of config.questions) {
      if (!dynamicAnswers[q.id]) return false;
    }
    return true;
  };

  // Render Phase A
  if (phase === 'INIT') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-6">
        <div className="bg-red-100 p-4 rounded-full">
          <MapPin className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Iniciar Nueva Encuesta</h2>
        <p className="text-slate-600">
          Verificando señal GPS (Meta: &lt; {GPS_ACCURACY_THRESHOLD_METERS}m)
        </p>

        <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          {gpsStatus === 'IDLE' && (
            <button 
              onClick={attemptGeoLock}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Verificar Señal GPS
            </button>
          )}
          {gpsStatus === 'SEARCHING' && (
            <div className="flex items-center justify-center space-x-2 text-red-600">
              <Loader2 className="animate-spin" />
              <span>Adquiriendo Satélites...</span>
            </div>
          )}
          {gpsStatus === 'POOR_SIGNAL' && (
            <div className="space-y-4">
               <div className="flex items-center justify-center text-amber-500 space-x-2">
                <AlertTriangle />
                <span className="font-bold">Baja Precisión: {Math.round(currentLocation?.accuracy || 0)}m</span>
              </div>
              <button onClick={attemptGeoLock} className="w-full py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium">Reintentar</button>
            </div>
          )}
          {gpsStatus === 'ERROR' && (
            <div className="text-red-500">
              <p>Error de GPS.</p>
              <button onClick={attemptGeoLock} className="mt-2 underline">Reintentar</button>
            </div>
          )}
          {gpsStatus === 'LOCKED' && (
            <div className="space-y-4">
               <div className="flex items-center justify-center text-green-600 space-x-2">
                <CheckCircle2 />
                <span className="font-bold">Señal Bloqueada: {Math.round(currentLocation?.accuracy || 0)}m</span>
              </div>
              <button 
                onClick={startSurvey}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-bold shadow-lg hover:bg-red-700 transform transition hover:-translate-y-1 border-b-4 border-red-800"
              >
                COMENZAR ENCUESTA
              </button>
            </div>
          )}
        </div>
        <button onClick={onCancel} className="text-slate-400 text-sm hover:text-slate-600">Cancelar</button>
      </div>
    );
  }

  // Render Phase B: Execution
  if (phase === 'ACTIVE' && config) {
    return (
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-slate-50 z-10 py-2">
          <h2 className="text-xl font-bold text-slate-800">Formulario</h2>
          <div className="flex items-center gap-2 text-xs font-mono bg-amber-100 px-2 py-1 rounded text-amber-800 border border-amber-200">
            <Navigation className="w-3 h-3 animate-pulse" />
            {Math.round((Date.now() - startTime) / 1000)}s
          </div>
        </div>

        <div className="space-y-6">
          {/* Static Fields */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-slate-500" />
              <h3 className="font-bold text-slate-700">Datos Básicos</h3>
            </div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Ciudadano</label>
            <input 
              type="text" 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Nombre Completo"
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
            />
          </div>

          {/* Dynamic Questions */}
          {config.questions.map((q, index) => (
             <div key={q.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex items-start gap-3 mb-3">
                 <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-full mt-0.5">
                   P{index + 1}
                 </span>
                 <p className="font-bold text-slate-800 text-lg leading-tight">{q.text}</p>
               </div>
               
               <div className="space-y-2 mt-4">
                 {q.options.map((opt, optIdx) => (
                   <label 
                    key={optIdx} 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${dynamicAnswers[q.id] === opt ? 'bg-red-50 border-red-500 ring-1 ring-red-500' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
                   >
                     <input 
                       type="radio"
                       name={`q-${q.id}`}
                       value={opt}
                       checked={dynamicAnswers[q.id] === opt}
                       onChange={() => setDynamicAnswers(prev => ({ ...prev, [q.id]: opt }))}
                       className="w-4 h-4 text-red-600 focus:ring-red-500"
                     />
                     <span className="text-slate-700">{opt}</span>
                   </label>
                 ))}
               </div>
             </div>
          ))}

          {/* Comments */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones Finales</label>
            <textarea 
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 h-24 resize-none"
              placeholder="Comentarios adicionales..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            ></textarea>
          </div>

          <button 
            onClick={finishSurvey}
            disabled={!isFormValid()}
            className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-b-4 border-slate-950"
          >
            <Save className="w-5 h-5 text-amber-400" />
            FINALIZAR Y VALIDAR
          </button>
        </div>
      </div>
    );
  }

  // Phase C: Saving
  if (phase === 'SAVING') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-slate-700">Validando Integridad de Datos...</h3>
      </div>
    );
  }

  return null;
};

export default SurveySessionManager;
