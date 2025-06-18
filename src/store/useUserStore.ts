// stores/userStore.ts
import { defineStore } from 'pinia'
import api from '@/api/axios'
import type { UserResource } from '@clerk/types'

// Define the organization member interface
interface OrgMember {
  id: string;
  name: string;
  email?: string;
  role: string;
  imageUrl?: string;
}

// Define the organization data interface
interface OrganizationData {
  id: string;
  name: string;
  members: OrgMember[];
}

// Define the user data interface
interface UserData {
  id: string;
  name: string;
  email: string | undefined;
  imageUrl?: string;
  organizationId?: string;
  organizationRole?: string;
  initialRecipesAssigned?: boolean;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    isAdmin: false,
    userData: null as UserData | null,
    organizationData: null as OrganizationData | null,
    organizationMembers: [] as OrgMember[],
    isNewUser: false
  }),
  
  actions: {
    // Modified to accept clerk user data directly
    async initializeUser(clerkUser: UserResource | null = null) {
      let isNewUserRegistration = false;
      
      if (clerkUser) {
        // Get previous stored user data if any
        const previousData = localStorage.getItem('clerkUserData');
        let previousUserId = null;
        let previousInitialRecipesAssigned = false;
        
        // Try to parse previous data to get the user ID
        if (previousData) {
          try {
            const parsedData = JSON.parse(previousData);
            previousUserId = parsedData.id;
            previousInitialRecipesAssigned = parsedData.initialRecipesAssigned || false;
          } catch (e) {
            console.error('Error parsing previous user data', e);
          }
        }
        
        // Check if this is actually a new user by comparing IDs
        if (!previousUserId || previousUserId !== clerkUser.id) {
          isNewUserRegistration = true;
          this.isNewUser = true;
          // Clear any stale localStorage data from previous users
          this.clearLocalStorage();
        }
        
        // Set user data from Clerk
        this.userData = {
          id: clerkUser.id,
          name: clerkUser.firstName || clerkUser.username || 
                (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0 ? 
                clerkUser.emailAddresses[0].emailAddress.split('@')[0] : ''),
          email: clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0 ? 
                clerkUser.emailAddresses[0].emailAddress : undefined,
          imageUrl: clerkUser.imageUrl,
          initialRecipesAssigned: !isNewUserRegistration && previousInitialRecipesAssigned
        }
        
        // Check admin status and organization info
        this.isAdmin = false;
        
        if (clerkUser.organizationMemberships && clerkUser.organizationMemberships.length > 0) {
          const orgMembership = clerkUser.organizationMemberships[0];
          this.isAdmin = orgMembership.role === "org:admin";
          
          // Add organization info to userData
          this.userData.organizationId = orgMembership.organization.id;
          this.userData.organizationRole = orgMembership.role;
          
          // Store basic organization data
          this.organizationData = {
            id: orgMembership.organization.id,
            name: orgMembership.organization.name,
            members: []  // Will be populated separately
          };
        }
        
        // Save user data to localStorage
        localStorage.setItem('clerkUserData', JSON.stringify(this.userData));
        localStorage.setItem('clerkUserId', clerkUser.id); 
        
        // If this is a new user, assign initial recipes
        if (isNewUserRegistration && !this.userData.initialRecipesAssigned) {
          await this.registerWithBackend();
          await this.assignInitialRecipes();
        }
        
        return {
          userData: this.userData,
          isAdmin: this.isAdmin,
          organizationData: this.organizationData,
          isNewUser: isNewUserRegistration
        };
      } else {
        // No clerk user provided - clear everything
        this.clearUser();
        this.clearLocalStorage();
        
        return {
          userData: null,
          isAdmin: false,
          organizationData: null,
          isNewUser: false
        };
      }
    },
    
    async assignInitialRecipes() {
      if (!this.userData || !this.userData.id) return;
      
      try {
        // Call your backend API
        const response = await api.post('/users/assign-initial-recipes', {
          userId: this.userData.id
        });
        
        if (response.status === 200) {
          // Mark as assigned in userData and save to localStorage
          if (this.userData) {
            this.userData.initialRecipesAssigned = true;
            localStorage.setItem('clerkUserData', JSON.stringify(this.userData));
          }
          console.log('Initial recipes assigned successfully');
        }
      } catch (error) {
        console.error('Failed to assign initial recipes:', error);
      }
    },
    
    // This method should be called from a component, not directly in the store
    setOrganizationMembers(members: OrgMember[]) {
      this.organizationMembers = members;
      
      if (this.organizationData) {
        this.organizationData.members = members;
        
        // Save to localStorage
        localStorage.setItem(`orgData_${this.organizationData.id}`, JSON.stringify(this.organizationData));
      }
    },

    async registerWithBackend() {
      if (!this.userData) return;

      try {
        const response = await api.post('/users/register-clerk-user', {
          id: this.userData.id,
          name: this.userData.name,
          email: this.userData.email,
          imageUrl: this.userData.imageUrl,
          isAdmin: this.isAdmin 
        });

        console.log('User registered with backend:', response.data);
        return response.data;
      } catch (error) {
        console.error('Failed to register user with backend:', error);
        throw error;
      }
    },

    clearLocalStorage() {
      // Clear all user-related localStorage items
      localStorage.removeItem('clerkUserData');
      localStorage.removeItem('clerkUserId');
      
      // Clear any organization data
      if (this.organizationData?.id) {
        localStorage.removeItem(`orgData_${this.organizationData.id}`);
      }
      
      // You might want to clear other user-related keys here
      // For example, if you store any other user preferences
    },

    clearUser() {
      this.userData = null;
      this.isAdmin = false;
      this.organizationData = null;
      this.organizationMembers = [];
      this.isNewUser = false;
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.userData,
    isUserAdmin: (state) => state.isAdmin,
    getOrganizationMembers: (state) => state.organizationMembers,
    getOrganizationId: (state) => state.organizationData?.id || null,
    isNewUserRegistration: (state) => state.isNewUser
  }
})
