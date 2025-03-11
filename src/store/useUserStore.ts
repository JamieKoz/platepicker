// stores/userStore.ts
import { defineStore } from 'pinia'
import { useUser } from '@clerk/vue'
import { watch } from 'vue'

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
}

export const useUserStore = defineStore('user', {
  state: () => ({
    isAdmin: false,
    userData: null as UserData | null,
    organizationData: null as OrganizationData | null,
    organizationMembers: [] as OrgMember[]
  }),
  
  actions: {
    async initializeUser() {
      const { user, isLoaded } = useUser();
      
      // If Clerk hasn't loaded yet, wait for it
      if (!isLoaded.value) {
        await new Promise<void>((resolve) => {
          const unwatch = watch(isLoaded, (loaded) => {
            if (loaded) {
              unwatch();
              resolve();
            }
          });
        });
      }
      
      if (user.value) {
        // Set user data from Clerk
        this.userData = {
          id: user.value.id,
          name: user.value.firstName || user.value.username || user.value.emailAddresses?.[0]?.emailAddress?.split('@')[0] || '',
          email: user.value.emailAddresses?.[0]?.emailAddress,
          imageUrl: user.value.imageUrl
        }
        
        // Check admin status and organization info
        this.isAdmin = false;
        
        if (user.value.organizationMemberships && user.value.organizationMemberships.length > 0) {
          const orgMembership = user.value.organizationMemberships[0];
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
        
        return {
          userData: this.userData,
          isAdmin: this.isAdmin,
          organizationData: this.organizationData
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
        organizationData: this.organizationData
      };
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
    getOrganizationId: (state) => state.organizationData?.id || null
  }
})
