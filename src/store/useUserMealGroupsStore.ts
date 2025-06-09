// stores/useUserMealGroupsStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/api/axios';
import type { RecipeGroup } from '@/types/recipeGroup';

export const useUserMealGroupsStore = defineStore('userMealGroups', () => {
  // State
  const groups = ref<RecipeGroup[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentUserMealId = ref<number | null>(null);

  // Getters
    const groupOptions = computed(() => {
        const options: Array<{ id: number | null; name: string; value: number | null }> = [
            { id: null, name: 'Main Ingredients', value: null }
        ];

        groups.value.forEach((group: RecipeGroup) => {
            if (group.id !== undefined) {  // Only add groups that have an ID
                options.push({
                    id: group.id,
                    name: group.name,
                    value: group.id
                });
            }
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
  const setUserMealId = (userMealId: number) => {
    if (currentUserMealId.value !== userMealId) {
      currentUserMealId.value = userMealId;
      groups.value = []; // Clear groups when user meal changes
    }
  };

  const fetchGroups = async (userMealId: number) => {
    if (!userMealId) return;
    
    setUserMealId(userMealId);
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.get(`/user-meals/${userMealId}/groups`);
      groups.value = response.data.data || [];
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch groups';
      console.error('Failed to fetch user meal groups:', err);
    } finally {
      loading.value = false;
    }
  };

  const createGroup = async (userMealId: number, groupData: { name: string; description?: string }) => {
    if (!userMealId) throw new Error('User Meal ID is required');
    
    setUserMealId(userMealId);
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.post(`/user-meals/${userMealId}/groups`, groupData);
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

  const updateGroup = async (userMealId: number, groupId: number, groupData: { name: string; description?: string }) => {
    if (!userMealId || !groupId) throw new Error('User Meal ID and Group ID are required');
    
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.put(`/user-meals/${userMealId}/groups/${groupId}`, groupData);
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

  const deleteGroup = async (userMealId: number, groupId: number) => {
    if (!userMealId || !groupId) throw new Error('User Meal ID and Group ID are required');
    
    loading.value = true;
    error.value = null;
    
    try {
      await api.delete(`/user-meals/${userMealId}/groups/${groupId}`);
      groups.value = groups.value.filter(g => g.id !== groupId);
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to delete group';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const reorderGroups = async (userMealId: number, reorderedGroups: { id: number; sort_order: number }[]) => {
    if (!userMealId) throw new Error('User Meal ID is required');
    
    loading.value = true;
    error.value = null;
    
    try {
      await api.post(`/user-meals/${userMealId}/groups/reorder`, {
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
    currentUserMealId.value = null;
  };

  return {
    // State
    groups,
    loading,
    error,
    currentUserMealId,
    
    // Getters
    groupOptions,
    getGroupById,
    getGroupName,
    
    // Actions
    setUserMealId,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    reorderGroups,
    clearError,
    reset
  };
});
