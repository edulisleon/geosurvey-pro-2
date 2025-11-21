
import React, { useMemo } from 'react';
import { getDailyRecords } from '../services/db';
import { getCurrentUser } from '../services/auth';
import { ArrowLeft, Map, Share2 } from 'lucide-react';
import {
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  XAxis,
  YAxis
} from 'recharts';

interface Props {
  onBack: () => void;
}

const Dashboard: React.FC<Props> = ({ onBack }) => {
  const records = useMemo(() => getDailyRecords(), []);
  const currentUser = getCurrentUser();

  // Stats
  const total = records.length;
  const suspicious = records.filter(r => r.isSuspicious).length;

  // Map Data
  const mapData = records.map(r => ({
    x: r.startLocation.longitude,
    y: r.startLocation.latitude,
    z: 1,
    suspicious: r.isSuspicious
  }));

  const handleExport = async () => {
    if (records.length === 0) {
      alert("No hay datos para exportar hoy.");
      return;
    }

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Reporte_${currentUser?.username}_${dateStr}.json`;
    
    // Create a clean export structure flattening dynamic answers for easy CSV conversion later
    const exportData = records.map(r => ({
      ...r,
      // Flatten dynamic answers for better readability in raw JSON
      readableAnswers: Object.entries(r.responses.dynamicAnswers).map(([qId, ans]) => `P${qId}: ${ans}`).join(' | ')
    }));

    const jsonContent = JSON.stringify(exportData, null, 2);
    
    // Try Web Share API
    if (navigator.share) {
      const file = new File([jsonContent], fileName, { type: 'application/json' });
      try {
        await navigator.share({
          title: `Reporte Campo ${dateStr}`,
          text: `Reporte de encuestas del usuario ${currentUser?.fullName}`,
          files: [file]
        });
      } catch (err) {
        console.warn("Share API failed or cancelled, falling back to download", err);
        downloadFile(jsonContent, fileName);
      }
    } else {
      // Fallback
      downloadFile(jsonContent, fileName);
    }
  };

  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tablero Personal</h1>
          <p className="text-xs text-slate-500">Voluntario: {currentUser?.fullName}</p>
        </div>
        <button onClick={handleExport} className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm px-4 font-medium shadow-sm">
          <Share2 className="w-4 h-4 text-amber-200" />
          <span className="hidden sm:inline">Transmitir</span>
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-slate-800">
          <p className="text-slate-500 text-xs uppercase font-bold">Total Encuestas</p>
          <p className="text-3xl font-bold text-slate-900">{total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
          <p className="text-slate-500 text-xs uppercase font-bold">Sospechosas</p>
          <p className={`text-3xl font-bold ${suspicious > 0 ? 'text-red-500' : 'text-green-500'}`}>{suspicious}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        
        {/* Geo Scatter */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800 flex items-center gap-2">
               <Map className="w-4 h-4 text-red-600" /> 
               Rastro GPS de Hoy
             </h3>
          </div>
          <div className="h-64 w-full bg-slate-50 rounded-lg border border-slate-100">
            {mapData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis type="number" dataKey="x" name="Longitud" domain={['auto', 'auto']} hide />
                  <YAxis type="number" dataKey="y" name="Latitud" domain={['auto', 'auto']} hide />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} wrapperStyle={{ zIndex: 100 }} content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border shadow rounded text-xs">
                            <p>{data.suspicious ? 'Registro Sospechoso' : 'Registro Válido'}</p>
                          </div>
                        );
                      }
                      return null;
                  }} />
                  <Scatter name="Encuestas" data={mapData}>
                    {mapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.suspicious ? '#ef4444' : '#fbbf24'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">Sin datos de GPS hoy</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
