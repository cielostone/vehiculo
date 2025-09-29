import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WorkshopActivity } from '../../types';

interface ActivitiesState {
  activities: WorkshopActivity[];
  loading: boolean;
  error: string | null;
}

const initialState: ActivitiesState = {
  activities: [
    {
      id: 'ACT001',
      title: 'Gestión de Inventario Básico',
      description: 'Aprende los fundamentos de control de inventario y rotación de stock',
      type: 'exercise',
      difficulty: 'beginner',
      duration: 30,
      completed: true,
      score: 85,
      category: 'Inventario',
    },
    {
      id: 'ACT002',
      title: 'Planificación de Rutas de Entrega',
      description: 'Simulación de optimización de rutas para múltiples destinos',
      type: 'simulation',
      difficulty: 'intermediate',
      duration: 45,
      completed: false,
      category: 'Transporte',
    },
    {
      id: 'ACT003',
      title: 'Caso de Estudio: Crisis Logística',
      description: 'Analiza y resuelve un problema real de cadena de suministro',
      type: 'case_study',
      difficulty: 'advanced',
      duration: 60,
      completed: false,
      category: 'Resolución de Problemas',
    },
    {
      id: 'ACT004',
      title: 'Evaluación: Conceptos Fundamentales',
      description: 'Evaluación sobre los conceptos básicos de logística',
      type: 'evaluation',
      difficulty: 'beginner',
      duration: 20,
      completed: true,
      score: 92,
      category: 'Evaluación',
    },
  ],
  loading: false,
  error: null,
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addActivity: (state, action: PayloadAction<WorkshopActivity>) => {
      state.activities.push(action.payload);
    },
    updateActivity: (state, action: PayloadAction<WorkshopActivity>) => {
      const index = state.activities.findIndex(a => a.id === action.payload.id);
      if (index !== -1) {
        state.activities[index] = action.payload;
      }
    },
    completeActivity: (state, action: PayloadAction<{id: string, score: number}>) => {
      const activity = state.activities.find(a => a.id === action.payload.id);
      if (activity) {
        activity.completed = true;
        activity.score = action.payload.score;
      }
    },
    resetActivity: (state, action: PayloadAction<string>) => {
      const activity = state.activities.find(a => a.id === action.payload);
      if (activity) {
        activity.completed = false;
        activity.score = undefined;
      }
    },
  },
});

export const { 
  setLoading, 
  setError, 
  addActivity, 
  updateActivity, 
  completeActivity, 
  resetActivity 
} = activitiesSlice.actions;

export default activitiesSlice.reducer;