import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Shipment } from '../../types';

interface ShipmentsState {
  shipments: Shipment[];
  loading: boolean;
  error: string | null;
}

const initialState: ShipmentsState = {
  shipments: [
    {
      id: 'SHP001',
      origin: 'Bogotá',
      destination: 'Medellín',
      status: 'in_transit',
      items: [],
      estimatedDelivery: new Date(Date.now() + 86400000), // mañana
      driver: 'Juan Pérez',
      trackingNumber: 'TRK001234567',
    },
    {
      id: 'SHP002',
      origin: 'Cali',
      destination: 'Cartagena',
      status: 'pending',
      items: [],
      estimatedDelivery: new Date(Date.now() + 172800000), // pasado mañana
      trackingNumber: 'TRK001234568',
    },
    {
      id: 'SHP003',
      origin: 'Barranquilla',
      destination: 'Bucaramanga',
      status: 'delivered',
      items: [],
      estimatedDelivery: new Date(Date.now() - 86400000), // ayer
      actualDelivery: new Date(Date.now() - 43200000), // hace 12 horas
      driver: 'María González',
      trackingNumber: 'TRK001234569',
    },
  ],
  loading: false,
  error: null,
};

const shipmentsSlice = createSlice({
  name: 'shipments',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addShipment: (state, action: PayloadAction<Shipment>) => {
      state.shipments.push(action.payload);
    },
    updateShipment: (state, action: PayloadAction<Shipment>) => {
      const index = state.shipments.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.shipments[index] = action.payload;
      }
    },
    updateShipmentStatus: (state, action: PayloadAction<{id: string, status: Shipment['status']}>) => {
      const shipment = state.shipments.find(s => s.id === action.payload.id);
      if (shipment) {
        shipment.status = action.payload.status;
        if (action.payload.status === 'delivered') {
          shipment.actualDelivery = new Date();
        }
      }
    },
    deleteShipment: (state, action: PayloadAction<string>) => {
      state.shipments = state.shipments.filter(s => s.id !== action.payload);
    },
  },
});

export const { 
  setLoading, 
  setError, 
  addShipment, 
  updateShipment, 
  updateShipmentStatus, 
  deleteShipment 
} = shipmentsSlice.actions;

export default shipmentsSlice.reducer;