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
        
        // Set user data from Clerk
        this.userData = {
          id: clerkUser.id,
          name: clerkUser.firstName || clerkUser.username || 
                (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0 ? 
                clerkUser.emailAddresses[0].emailAddress.split('@')[0] : ''),
          email: clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0 ? 
                clerkUser.emailAddresses[0].emailAddress : undefined,
          imageUrl: clerkUser.imageUrl,
          initialRecipesAssigned: false
        }
        
        if (!previousData || !previousData.includes(clerkUser.id)) {
          isNewUserRegistration = true;
          this.isNewUser = true;
        } else {
          // Try to parse previous data
          try {
            const parsedData = JSON.parse(previousData);
            // Preserve the initialRecipesAssigned status if it exists
            if (parsedData && parsedData.initialRecipesAssigned) {
              this.userData.initialRecipesAssigned = true;
            }
          } catch (e) {
            console.error('Error parsing previous user data', e);
          }
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
        
        // If this is a new user, assign initial recipes
        if (isNewUserRegistration && !this.userData.initialRecipesAssigned) {
          // this.assignInitialRecipes();
        }
        
        return {
          userData: this.userData,
          isAdmin: this.isAdmin,
          organizationData: this.organizationData,
          isNewUser: isNewUserRegistration
        };
      }
      
      // Try to get from localStorage as fallback
      try {
        this.userData = null;
        this.isAdmin = false;
        this.organizationData = null;
        
        const storedData = JSON.parse(localStorage.getItem('clerkUserData') || '{}');
        if (storedData && storedData.id) {
          this.userData = storedData as UserData;
          this.isAdmin = storedData.isAdmin === 1;
          
          // Try to load organization data from localStorage if admin
          if (this.isAdmin && storedData.organizationId) {
            const storedOrgData = JSON.parse(localStorage.getItem(`orgData_${storedData.organizationId}`) || '{}');
            if (storedOrgData && storedOrgData.id) {
              this.organizationData = storedOrgData as OrganizationData;
              this.organizationMembers = storedOrgData.members || [];
            }
          }
        } 
      } catch (e) {
        console.error('Error loading user data from localStorage', e);
        this.userData = null;
        this.isAdmin = false;
        this.organizationData = null;
      }
      
      return {
        userData: this.userData,
        isAdmin: this.isAdmin,
        organizationData: this.organizationData,
        isNewUser: false
      };
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
    
    clearUser() {
      this.userData = null;
      this.isAdmin = false;
      this.organizationData = null;
      this.organizationMembers = [];
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
