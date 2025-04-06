// components/CreateOrganizationForm.tsx
'use client';

import React, { useState } from 'react';
import { Organization } from '@/components/OrganizationSidebar/OrganizationSidebar'; // Import the Organization type

interface CreateOrganizationFormProps {
  onOrganizationCreated: (newOrganization: Organization) => void; // Callback on success
  onCancel: () => void; // Callback to cancel and switch view back
}

const CreateOrganizationForm: React.FC<CreateOrganizationFormProps> = ({
  onOrganizationCreated,
  onCancel,
}) => {
  const [orgName, setOrgName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orgName.trim()) {
      setSubmitError('Organization name cannot be empty.');
      setStatus('error');
      return;
    }
    setStatus('submitting');
    setSubmitError(null);

    console.log('Creating organization:', orgName);

    // --- TODO: Replace with your actual API call to create an organization ---
    try {
      // Simulate API call and getting back a new org object
      await new Promise(resolve => setTimeout(resolve, 700));
      const newOrg: Organization = {
        _id: "",
        name: orgName.trim(),
        description: description
      };

      // --- End of API call simulation ---

      console.log('Organization created:', newOrg);
      onOrganizationCreated(newOrg); // Pass the new org back to the parent
      // No need to reset status here, the parent will switch the view

    } catch (error) {
      console.error("Error creating organization:", error);
      setStatus('error');
      setSubmitError(error instanceof Error ? error.message : 'Failed to create organization.');
    } finally {
        // Only set back to idle if it wasn't successful (view didn't change)
        if (status !== 'idle') { // Check necessary if onOrganizationCreated didn't unmount this
            //setStatus('idle'); // Re-setting status might be handled by parent unmounting this
        }
    }
  };

  return (
     <div className="flex-grow p-6 md:p-8 bg-gray-50 min-h-screen"> {/* Match form container style */}
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 md:p-8"> {/* Smaller max-width */}
          <h2 className="text-xl font-semibold text-gray-800 mb-5">Add New Organization</h2>

          {status === 'error' && (
             <div className="mb-4 p-3 rounded bg-red-100 text-red-800 border border-red-200">
               Error: {submitError || 'Failed to create organization.'}
             </div>
           )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                id="orgName"
                name="orgName"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter organization name"
                disabled={status === 'submitting'}
              />
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter Description"
                disabled={status === 'submitting'}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button" // Important: type="button" to prevent form submission
                onClick={onCancel}
                disabled={status === 'submitting'}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  status === 'submitting'
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {status === 'submitting' ? 'Saving...' : 'Save Organization'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
};

export default CreateOrganizationForm;