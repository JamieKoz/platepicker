// src/store/useDietaryStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/axios';
import type { PaginationMeta, PaginationLinks } from '@/types/pagination';
import type { Dietary } from '@/types/dietary';

export const useDietaryStore = defineStore('dietary', () => {
  // State
  const dietary = ref<Dietary[]>([]);
  const loadError = ref(false);
  const isLoading = ref(false);
  const meta = ref<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
    from: 0,
    to: 0,
    prev_page_url: null,
    next_page_url: null
  });
  const links = ref<PaginationLinks>({
    prev: null,
    next: null
  });
  const currentSearch = ref('');
  const nameDirection = ref<'asc' | 'desc'>('asc');

  // Getters
  const hasPrevPage = computed(() => !!links.value.prev);
  const hasNextPage = computed(() => !!links.value.next);
  const currentPage = computed(() => meta.value.current_page);
  const lastPage = computed(() => meta.value.last_page);
  
  // Actions
  async function fetchDietary(page = 1) {
    try {
      isLoading.value = true;
      loadError.value = false;
      
    const params: Record<string, string | number> = {
        page,
        sort_direction: nameDirection.value,
        sort_field: 'name'
      };
      
      if (currentSearch.value) {
        params['search'] = currentSearch.value;
      }
      
      const response = await api.get('/dietary', { params });
      // Handle different API response formats
      if (Array.isArray(response.data)) {
        // If API returns a simple array
        dietary.value = response.data;
        meta.value = {
          current_page: 1,
          last_page: 1,
          per_page: response.data.length,
          total: response.data.length,
          from: 1,
          to: response.data.length,
          prev_page_url: null,
          next_page_url: null
        };
        links.value = { prev: null, next: null };
      } else {
        // If API returns paginated data
        dietary.value = response.data.data || response.data;
        
        // Handle pagination metadata if available
        if (response.data.meta || response.data.current_page) {
          meta.value = {
            current_page: response.data.current_page || response.data.meta?.current_page || 1,
            last_page: response.data.last_page || response.data.meta?.last_page || 1,
            per_page: response.data.per_page || response.data.meta?.per_page || 10,
            total: response.data.total || response.data.meta?.total || 0,
            from: response.data.from || response.data.meta?.from || 0,
            to: response.data.to || response.data.meta?.to || 0,
            prev_page_url: response.data.prev_page_url || response.data.links?.prev || null,
            next_page_url: response.data.next_page_url || response.data.links?.next || null
          };
          
          links.value = {
            prev: response.data.prev_page_url || response.data.links?.prev || null,
            next: response.data.next_page_url || response.data.links?.next || null
          };
        }
      }
    } catch (error) {
      console.error("Error fetching dietary:", error);
      loadError.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  async function searchDietary(query: string) {
    currentSearch.value = query;
    return fetchDietary(1);
  }

  function toggleSortDirection() {
    nameDirection.value = nameDirection.value === 'asc' ? 'desc' : 'asc';
    return fetchDietary(1);
  }

  async function createDietary(name: string) {
    try {
      if (!name.trim()) return null;
      
      const response = await api.post('/dietary', { name: name.trim() });
      await fetchDietary(meta.value.current_page);
      return response.data;
    } catch (error) {
      console.error("Error creating dietary:", error);
      return null;
    }
  }

  async function updateDietary(id: number, name: string) {
    try {
      if (!name.trim()) return false;
      
      await api.put(`/dietary/${id}`, { name: name.trim() });
      await fetchDietary(meta.value.current_page);
      return true;
    } catch (error) {
      console.error("Error updating dietary:", error);
      return false;
    }
  }

  async function deleteDietary(id: number) {
    try {
      await api.delete(`/dietary/${id}`);
      await fetchDietary(meta.value.current_page);
      return true;
    } catch (error) {
      console.error("Error deleting dietary:", error);
      return false;
    }
  }

  return {
    // State
    dietary,
    loadError,
    isLoading,
    meta,
    links,
    currentSearch,
    nameDirection,
    
    // Getters
    hasPrevPage,
    hasNextPage,
    currentPage,
    lastPage,
    
    // Actions
    fetchDietary,
    searchDietary,
    toggleSortDirection,
    createDietary,
    updateDietary,
    deleteDietary
  };
});
