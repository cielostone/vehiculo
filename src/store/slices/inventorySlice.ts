import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { InventoryItem } from '../../types';

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [
    {
      id: '1',
      name: 'Cajas de Cartón Grande',
      category: 'Embalaje',
      quantity: 150,
      minStock: 50,
      location: 'Almacén A-1',
      status: 'available',
      lastUpdated: new Date(),
    },
    {
      id: '2',
      name: 'Etiquetas de Envío',
      category: 'Documentación',
      quantity: 25,
      minStock: 100,
      location: 'Almacén B-2',
      status: 'low_stock',
      lastUpdated: new Date(),
    },
    {
      id: '3',
      name: 'Pallets de Madera',
      category: 'Transporte',
      quantity: 0,
      minStock: 20,
      location: 'Patio Exterior',
      status: 'out_of_stock',
      lastUpdated: new Date(),
    },
  ],
  loading: false,
  error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addItem: (state, action: PayloadAction<InventoryItem>) => {
      state.items.push(action.payload);
    },
    updateItem: (state, action: PayloadAction<InventoryItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateQuantity: (state, action: PayloadAction<{id: string, quantity: number}>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        item.lastUpdated = new Date();
        // Actualizar status basado en la cantidad
        if (item.quantity === 0) {
          item.status = 'out_of_stock';
        } else if (item.quantity <= item.minStock) {
          item.status = 'low_stock';
        } else {
          item.status = 'available';
        }
      }
    },
    deleteItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
});

export const { setLoading, setError, addItem, updateItem, updateQuantity, deleteItem } = inventorySlice.actions;
export default inventorySlice.reducer;