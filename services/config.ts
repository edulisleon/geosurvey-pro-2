
import { SurveyConfig, SurveyQuestion } from '../types';

const CONFIG_KEY = 'geo_survey_config';

// Default configuration with 10 placeholder questions
const DEFAULT_CONFIG: SurveyConfig = {
  title: 'Encuesta Base',
  questions: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    text: `Pregunta ${i + 1}: Ingrese el texto de la pregunta aquí`,
    options: [
      'Opción A',
      'Opción B',
      'Opción C',
      'Opción D',
      'Opción E'
    ]
  }))
};

export const getSurveyConfig = (): SurveyConfig => {
  const data = localStorage.getItem(CONFIG_KEY);
  if (!data) {
    // Initialize default if empty
    localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
    return DEFAULT_CONFIG;
  }
  return JSON.parse(data);
};

export const saveSurveyConfig = (config: SurveyConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const generateDrivePackage = (): string => {
  const config = getSurveyConfig();
  const date = new Date().toLocaleDateString();
  
  return `
PAQUETE DE DISTRIBUCIÓN - GEOSURVEYPRO IDEHUPY
Fecha de Generación: ${date}
------------------------------------------------

INSTRUCCIONES PARA VOLUNTARIOS:
1. Abra el siguiente enlace en su navegador Chrome (Android) o Safari (iOS):
   [URL_DE_TU_APP_AQUI]

2. Utilice las credenciales proporcionadas por el administrador.

3. CONFIGURACIÓN DE LA ENCUESTA ACTUAL:
   El sistema cargará automáticamente las siguientes preguntas definidas por el administrador.

------------------------------------------------
RESUMEN DE PREGUNTAS ACTIVAS:
${config.questions.map(q => `\n[P${q.id}] ${q.text}\n   - ${q.options.join('\n   - ')}`).join('\n')}
------------------------------------------------
`.trim();
};
