// components/OrganizationSidebar.tsx
'use client';

import React from 'react';
import { FaPlus } from 'react-icons/fa'; // Using Heroicons for icons

// Define the structure of an organization object
export interface Organization {
  _id: string;
  name: string;
  description: string;
}

interface OrganizationSidebarProps {
  organizations: Organization[];
  selectedOrganizationId: string | null;
  onSelectOrganization: (id: string) => void;
  onAddOrganization: () => void; // Function to trigger adding an org
  isLoading: boolean;
}

const OrganizationSidebar: React.FC<OrganizationSidebarProps> = ({
  organizations,
  selectedOrganizationId,
  onSelectOrganization,
  onAddOrganization,
  isLoading,
}) => {
  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Organizations</h2>

      {/* Add Organization Button */}
      <button
        onClick={onAddOrganization}
        className="w-full mb-4 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <FaPlus className="h-5 w-5 mr-2" aria-hidden="true" />
        Add Organization
      </button>

      {/* List of Organizations */}
      <div className="space-y-1">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading organizations...</p>
        ) : organizations.length === 0 ? (
          <p className="text-sm text-gray-500">No organizations found. Add one!</p>
        ) : (
          organizations.map((org, index) => (
            <button
              key={index}
              onClick={() => onSelectOrganization(org._id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out ${
                selectedOrganizationId === org._id
                  ? 'bg-indigo-100 text-indigo-700' // Selected style
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900' // Default style
              }`}
            >
              {org.name}
            </button>
          ))
        )}
      </div>
    </aside>
  );
};

export default OrganizationSidebar;