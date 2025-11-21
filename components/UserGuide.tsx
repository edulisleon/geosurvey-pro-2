import React from 'react';
import { ArrowLeft, Share2, Save, MapPin, WifiOff, Download } from 'lucide-react';

interface Props {
  onBack: () => void;
}

const UserGuide: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="p-4 max-w-3xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">Manual de Ayuda</h1>
      </div>

      <div className="space-y-6">
        {/* Intro */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-2">Bienvenido a GeoSurveyPro</h2>
          <p className="opacity-90">
            Esta aplicación permite recolectar datos en zonas sin internet, validar su ubicación GPS automáticamente y exportar reportes seguros.
          </p>
        </div>

        {/* Step 1: Install */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm">1</div>
            Instalación (Android/iOS)
          </h3>
          <p className="text-slate-600 mb-4">
            Para usar la app sin internet, debes guardarla en tu teléfono:
          </p>
          <ul className="list-disc list-inside text-sm text-slate-600 space-y-2">
            <li><strong>Android (Chrome):</strong> Toca el menú (⋮) y selecciona "Instalar aplicación" o "Agregar a pantalla principal".</li>
            <li><strong>iOS (Safari):</strong> Toca el botón Compartir <span className="inline-block bg-slate-200 p-1 rounded">⎋</span> y selecciona "Agregar a Inicio".</li>
          </ul>
        </section>

        {/* Step 2: Workflow */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
           <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm">2</div>
            Flujo de Trabajo
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <MapPin className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800">Inicio y GPS</h4>
                <p className="text-sm text-slate-600">
                  Al iniciar una encuesta, la app requerirá validar su posición con precisión de 15 metros. Si no tiene señal, muévase a un espacio abierto.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <WifiOff className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800">Modo Offline</h4>
                <p className="text-sm text-slate-600">
                  Puede realizar tantas encuestas como necesite sin internet. Los datos se guardan en la memoria interna de su dispositivo.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Save className="w-6 h-6 text-red-500 shrink-0" />
              <div>
                <h4 className="font-bold text-slate-800">Guardado Seguro</h4>
                <p className="text-sm text-slate-600">
                  Al finalizar, la app analiza el tiempo y distancia recorrida para validar que la encuesta fue real.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Export */}
        <section className="bg-white p-6 rounded-xl border border-slate-200">
           <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-sm">3</div>
            Transmitir Resultados
          </h3>
          <p className="text-slate-600 mb-4">
            Al terminar la jornada y tener acceso a internet:
          </p>
          <div className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-200">
            <ol className="list-decimal list-inside space-y-2">
              <li>Vaya al menú principal y seleccione <strong>"Ver Tablero"</strong>.</li>
              <li>Toque el botón <strong className="text-red-600"><Download className="w-4 h-4 inline"/> Exportar</strong> arriba a la derecha.</li>
              <li>Se abrirá el menú de compartir de su teléfono.</li>
              <li>Seleccione <strong>WhatsApp, Email o Telegram</strong> y envíe el archivo al Administrador.</li>
            </ol>
          </div>
        </section>

      </div>
    </div>
  );
};

export default UserGuide;