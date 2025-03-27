// src/store/useCuisineStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/axios';
import type { PaginationMeta, PaginationLinks } from '@/types/pagination';
import type { Cuisine } from '@/types/cuisine';

export const useCuisineStore = defineStore('cuisine', () => {
  // State
  const cuisine = ref<Cuisine[]>([]);
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
  async function fetchCuisine(page = 1) {
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
      
      const response = await api.get('/cuisines', { params });
      // Handle different API response formats
      if (Array.isArray(response.data)) {
        // If API returns a simple array
        cuisine.value = response.data;
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
        cuisine.value = response.data.data || response.data;
        
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
      console.error("Error fetching cuisine:", error);
      loadError.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  async function searchCuisine(query: string) {
    currentSearch.value = query;
    return fetchCuisine(1);
  }

  function toggleSortDirection() {
    nameDirection.value = nameDirection.value === 'asc' ? 'desc' : 'asc';
    return fetchCuisine(1);
  }

  async function createCuisine(name: string) {
    try {
      if (!name.trim()) return null;
      
      const response = await api.post('/cuisine', { name: name.trim() });
      await fetchCuisine(meta.value.current_page);
      return response.data;
    } catch (error) {
      console.error("Error creating cuisine:", error);
      return null;
    }
  }

  async function updateCuisine(id: number, name: string) {
    try {
      if (!name.trim()) return false;
      
      await api.put(`/cuisine/${id}`, { name: name.trim() });
      await fetchCuisine(meta.value.current_page);
      return true;
    } catch (error) {
      console.error("Error updating cuisine:", error);
      return false;
    }
  }

  async function deleteCuisine(id: number) {
    try {
      await api.delete(`/cuisine/${id}`);
      await fetchCuisine(meta.value.current_page);
      return true;
    } catch (error) {
      console.error("Error deleting cuisine:", error);
      return false;
    }
  }

  return {
    // State
    cuisine,
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
    fetchCuisine,
    searchCuisine,
    toggleSortDirection,
    createCuisine,
    updateCuisine,
    deleteCuisine
  };
});
