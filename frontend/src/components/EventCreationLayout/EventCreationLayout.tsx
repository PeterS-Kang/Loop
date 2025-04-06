// components/EventCreationLayout.tsx
'use client'; // Ensure this is marked as a Client Component

import React, { useState, useEffect } from 'react';

// --- Routing ---
// Use the correct import based on your Next.js version/router:
// App Router (app directory):
import { useRouter } from 'next/navigation';
// Pages Router (pages directory):
// import { useRouter } from 'next/router';
// --- End Routing ---

import OrganizationSidebar, { Organization } from '@/components/OrganizationSidebar/OrganizationSidebar';
import CreateEventForm from '@/components/CreateEventForm/CreateEventForm';
import CreateOrganizationForm from '@/components/CreateOrganizationForm/CreateOrganizationForm';

const EventCreationLayout: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'event' | 'organization'>('event');

  // --- Authentication Check ---
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Track auth status
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true); // Loading state for the check

  const fetchOrganizations = async() => {
    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL
    const endpoint = "/org/user"
    const token = localStorage.getItem("access_token")

    if (!token) {
        return
    }
    
    try {
        const response = await fetch(flaskApiUrl + endpoint, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        })
    
        if (response.ok) {
            const data = await response.json()
            console.log("data:", data)
            setOrganizations(data.organizations)
            setIsLoadingOrgs(false)
        }
    } catch (error) {
        console.error("Error fetching organizations")
    }
  }

  useEffect(() => {
    // This code runs only on the client side after the component mounts
    if (typeof window !== 'undefined') { // Ensure window/localStorage is available
      const token = localStorage.getItem('access_token');

      if (!token) {
        console.log('No access token found in localStorage. Redirecting to /auth...');
        // Use replace to prevent user from navigating back to the protected page
        router.replace('/auth');
      } else {
        // Token exists, assume authenticated for this basic check
        console.log('Access token found. Allowing access.');
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
      }
    }
    // Add router to dependency array if your linter/rules require it
  }, [router]);
  // --- End Authentication Check ---


  // Fetch organizations only if authenticated (optional optimization)
  useEffect(() => {
    if (isAuthenticated) { // Only fetch if the auth check passed
        setIsLoadingOrgs(true);
        fetchOrganizations()
    }
  }, [isAuthenticated]); // Re-run if authentication status changes (though it won't change back in this flow)


  // Handlers (keep as before)
  const handleSelectOrganization = (id: string) => {
    setSelectedOrganizationId(id);
    setViewMode('event');
  };
  const handleAddOrganizationClick = () => {
    setViewMode('organization');
    setSelectedOrganizationId(null);
  };
  const handleOrganizationCreated = async(newOrganization: Organization) => {
    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
    const endpoint = "/org/create";
    const token = localStorage.getItem("access_token");

    if (!token) {
        return
    }

    try {
        const orgData = {
            name: newOrganization.name,
            description: newOrganization.description
        }
        const response = await fetch(flaskApiUrl + endpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orgData)
        })

        if (response.ok) {
            const data = await response.json()
            const org = data.organization;
            setOrganizations(prevOrgs => [...prevOrgs, org]);
            setSelectedOrganizationId(newOrganization._id);
            setViewMode('event');
        }
    } catch (error) {
        console.error("Error creating organization:", error)
    }
  };


  const handleCancelCreateOrganization = () => {
    setViewMode('event');
  };


  // --- Render Loading or Null during Auth Check ---
  // Prevent rendering the main UI before authentication check is complete
  // or while redirecting.
  if (isCheckingAuth) {
    // You can return null or a loading spinner component
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
    // return null;
  }
  // --- End Render Loading ---


  // Render the main layout only if authenticated
  // (This check might seem redundant if redirect happens, but belts and suspenders)
  if (!isAuthenticated) {
      // Should have been redirected, but return null just in case to avoid rendering sensitive UI
      return null;
  }

  // --- Original Return Statement (Main Layout) ---
  return (
    <div className="flex h-screen bg-gray-100">
      <OrganizationSidebar
        organizations={organizations}
        selectedOrganizationId={selectedOrganizationId}
        onSelectOrganization={handleSelectOrganization}
        onAddOrganization={handleAddOrganizationClick}
        isLoading={isLoadingOrgs}
      />
      <main className="flex-grow overflow-y-auto">
        {viewMode === 'event' ? (
          <CreateEventForm selectedOrganizationId={selectedOrganizationId} />
        ) : (
          <CreateOrganizationForm
            onOrganizationCreated={handleOrganizationCreated}
            onCancel={handleCancelCreateOrganization}
          />
        )}
      </main>
    </div>
  );
};

export default EventCreationLayout;