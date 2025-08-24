import { create } from 'zustand';
import {
  apiClient,
  Ticket,
  CreateTicketRequest,
  ListTicketsResponse,
} from '../services/api';

interface TicketStore {
  // State
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  loading: boolean;
  error: string | null;
  pagination: {
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
  };

  // Actions
  fetchTickets: () => Promise<void>;
  createTicket: (ticket: CreateTicketRequest) => Promise<void>;
  getTicket: (id: string) => Promise<void>;
  clearError: () => void;
  clearSelectedTicket: () => void;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  // Initial state
  tickets: [],
  selectedTicket: null,
  loading: false,
  error: null,
  pagination: {
    total_count: 0,
    page: 1,
    page_size: 10,
    total_pages: 0,
  },

  // Actions
  fetchTickets: async () => {
    set({ loading: true, error: null });

    try {
      const response: ListTicketsResponse = await apiClient.listTickets();
      set({
        tickets: response.tickets,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch tickets',
        loading: false,
      });
    }
  },

  createTicket: async (ticketData: CreateTicketRequest) => {
    set({ loading: true, error: null });

    try {
      const newTicket = await apiClient.createTicket(ticketData);

      // Add the new ticket to the beginning of the list
      const currentTickets = get().tickets;
      set({
        tickets: [newTicket, ...currentTickets],
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to create ticket',
        loading: false,
      });
      throw error; // Re-throw so the form can handle it
    }
  },

  getTicket: async (id: string) => {
    set({ loading: true, error: null });

    try {
      const ticket = await apiClient.getTicket(id);
      set({
        selectedTicket: ticket,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to get ticket',
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  clearSelectedTicket: () => set({ selectedTicket: null }),
}));
