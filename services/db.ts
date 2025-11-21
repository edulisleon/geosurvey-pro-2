import { SurveyRecord } from '../types';

const STORAGE_KEY = 'geo_survey_records';

export const saveRecord = (record: SurveyRecord): void => {
  const existing = getRecords();
  const updated = [...existing, record];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getRecords = (): SurveyRecord[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getDailyRecords = (): SurveyRecord[] => {
  const all = getRecords();
  const today = new Date().setHours(0, 0, 0, 0);
  return all.filter(r => new Date(r.startTime).setHours(0,0,0,0) === today);
};

export const clearRecords = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};