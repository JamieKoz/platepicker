// stores/useRecipeGroupsStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/axios';
import type { RecipeGroup } from '@/types';

export const useRecipeGroupsStore = defineStore('recipeGroups', () => {
  // State
  const groups = ref<RecipeGroup[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentRecipeId = ref<number | null>(null);

  // Getters
  const groupOptions = computed(() => {
    const options = [
      { id: null, name: 'Main Ingredients', value: null }
    ];
    
    groups.value.forEach(group => {
      options.push({
        id: group.id,
        name: group.name,
        value: group.id
      });
    });
    
    return options;
  });

  const getGroupById = computed(() => {
    return (groupId: number | null) => {
      if (!groupId) return null;
      return groups.value.find(g => g.id === groupId) || null;
    };
  });

  const getGroupName = computed(() => {
    return (groupId: number | null) => {
      if (!groupId) return 'Main Ingredients';
      const group = getGroupById.value(groupId);
      return group?.name || 'Unknown Group';
    };
  });

  // Actions
  const setRecipeId = (recipeId: number) => {
    if (currentRecipeId.value !== recipeId) {
      currentRecipeId.value = recipeId;
      groups.value = []; // Clear groups when recipe changes
    }
  };

  const fetchGroups = async (recipeId: number) => {
    if (!recipeId) return;
    
    setRecipeId(recipeId);
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.get(`/recipes/${recipeId}/groups`);
      groups.value = response.data.data || [];
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch groups';
      console.error('Failed to fetch groups:', err);
    } finally {
      loading.value = false;
    }
  };

  const createGroup = async (recipeId: number, groupData: { name: string; description?: string }) => {
    console.log('wtf')
    if (!recipeId) throw new Error('Recipe ID is required');
    
    setRecipeId(recipeId);
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.post(`/recipes/${recipeId}/groups`, groupData);
      const newGroup = response.data.data;
      groups.value.push(newGroup);
      return newGroup;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create group';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateGroup = async (recipeId: number, groupId: number, groupData: { name: string; description?: string }) => {
    if (!recipeId || !groupId) throw new Error('Recipe ID and Group ID are required');
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.put(`/recipes/${recipeId}/groups/${groupId}`, groupData);
      const updatedGroup = response.data.data;
      
      const index = groups.value.findIndex(g => g.id === groupId);
      if (index !== -1) {
        groups.value[index] = updatedGroup;
      }
      
      return updatedGroup;
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to update group';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteGroup = async (recipeId: number, groupId: number) => {
    if (!recipeId || !groupId) throw new Error('Recipe ID and Group ID are required');
    
    loading.value = true;
    error.value = null;
    
    try {
      await api.delete(`/recipes/${recipeId}/groups/${groupId}`);
      groups.value = groups.value.filter(g => g.id !== groupId);
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete group';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reorderGroups = async (recipeId: number, reorderedGroups: { id: number; sort_order: number }[]) => {
    if (!recipeId) throw new Error('Recipe ID is required');
    
    loading.value = true;
    error.value = null;
    
    try {
      await api.post(`/recipes/${recipeId}/groups/reorder`, {
        groups: reorderedGroups
      });
      
      // Update local state
      groups.value.sort((a, b) => {
        const aOrder = reorderedGroups.find(g => g.id === a.id)?.sort_order || 0;
        const bOrder = reorderedGroups.find(g => g.id === b.id)?.sort_order || 0;
        return aOrder - bOrder;
      });
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to reorder groups';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
    groups.value = [];
    loading.value = false;
    error.value = null;
    currentRecipeId.value = null;
  };

  return {
    // State
    groups,
    loading,
    error,
    currentRecipeId,
    
    // Getters
    groupOptions,
    getGroupById,
    getGroupName,
    
    // Actions
    setRecipeId,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    reorderGroups,
    clearError,
    reset
  };
});
