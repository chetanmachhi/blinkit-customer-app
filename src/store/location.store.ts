import { create } from "zustand";
import { IAddress, ICoordinates, IStore, StoreServiceability } from "../api/types";
import { setClientStoreId } from "../api/client";
import { storage } from "../utils/storage";
import { STORAGE_KEYS } from "../config/constants";

interface LocationState {
  activeStore: IStore | null;
  coordinates: ICoordinates | null;
  selectedAddress: IAddress | null;
  serviceability: StoreServiceability | null;
  isServiceable: boolean;
  setActiveStore: (store: IStore | null) => Promise<void>;
  setCoordinates: (coords: ICoordinates | null) => Promise<void>;
  setSelectedAddress: (address: IAddress | null) => Promise<void>;
  setServiceability: (info: StoreServiceability | null) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  activeStore: null,
  coordinates: null,
  selectedAddress: null,
  serviceability: null,
  isServiceable: true,

  setActiveStore: async (store) => {
    setClientStoreId(store ? store._id : null);
    if (store) {
      await storage.set(STORAGE_KEYS.ACTIVE_STORE, store);
    } else {
      await storage.remove(STORAGE_KEYS.ACTIVE_STORE);
    }
    set({ activeStore: store });
  },

  setCoordinates: async (coordinates) => {
    if (coordinates) {
      await storage.set(STORAGE_KEYS.COORDINATES, coordinates);
    } else {
      await storage.remove(STORAGE_KEYS.COORDINATES);
    }
    set({ coordinates });
  },

  setSelectedAddress: async (selectedAddress) => {
    if (selectedAddress) {
      await storage.set(STORAGE_KEYS.SELECTED_ADDRESS, selectedAddress);
      set({
        selectedAddress,
        coordinates: selectedAddress.coordinates,
      });
    } else {
      await storage.remove(STORAGE_KEYS.SELECTED_ADDRESS);
      set({ selectedAddress: null });
    }
  },

  setServiceability: (serviceability) => {
    set({
      serviceability,
      isServiceable: serviceability ? serviceability.serviceable : true,
    });
  },
}));
