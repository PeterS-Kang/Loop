// components/CreateEventForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import LocationPickerModal from '@/components/LocationPickerModal/LocationPickerModal'; // Ensure this path is correct

// Interface for the form data state - Updated
interface EventFormData {
  title: string;
  startDateTime: string; // Combined start date and time
  endDateTime: string;   // Combined end date and time
  description: string;
}

// Define LatLng separately
interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface CreateEventFormProps {
  selectedOrganizationId: string | null;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ selectedOrganizationId }) => {
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Updated initial state
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    startDateTime: '',
    endDateTime: '',
    description: '',
  });
  const [selectedCoords, setSelectedCoords] = useState<LatLngLiteral | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<string>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setStatus('idle');
    setSubmitError(null);
    // Optionally clear location on org change
    // setSelectedCoords(null);
  }, [selectedOrganizationId]);

  // handleChange remains the same, works for datetime-local too
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLocationSelect = (location: LatLngLiteral) => {
    setSelectedCoords(location);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setSubmitError(null);

    if (!selectedOrganizationId) {
        setStatus('error');
        setSubmitError('Please select an organization first.');
        return;
    }
    if (!selectedCoords) {
        setStatus('error');
        setSubmitError('Please select a location on the map.');
        return;
    }

    // Basic validation: Check if end date/time is after start date/time
    if (formData.startDateTime && formData.endDateTime && formData.endDateTime <= formData.startDateTime) {
        setStatus('error');
        setSubmitError('End date and time must be after the start date and time.');
        return;
    }

    const dateObject_startTime = new Date(formData.startDateTime)
    const dateObject_endTime = new Date(formData.endDateTime)
    console.log(formData.startDateTime, dateObject_startTime)
    console.log(formData.endDateTime, dateObject_endTime)

    // Prepare data for submission - using startDateTime and endDateTime
    const eventDataToSubmit = {
      title: formData.title,
      description: formData.description,
      startTime: dateObject_startTime, // Adjust key names if backend expects different ones (e.g., startDateTime)
      endTime: dateObject_endTime,     // Adjust key names if backend expects different ones (e.g., endDateTime)
      organizationId: selectedOrganizationId,
      latitude: selectedCoords.lat,
      longitude: selectedCoords.lng,
    };

    console.log('Event Data Submitted:', eventDataToSubmit);

    try {
      const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
      const endpoint = "/event/create";
      const token = localStorage.getItem("access_token");

      if (!token || !flaskApiUrl) {
        throw new Error("Missing API URL or authentication token.");
      }

      const response = await fetch(flaskApiUrl + endpoint, {
        method: "POST",
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventDataToSubmit) // Send the updated structure
      });

      if (!response.ok) {
          let errorMsg = `Error creating event: ${response.status}`;
          try {
              const errData = await response.json();
              errorMsg = errData.message || errData.msg || errorMsg;
          } catch (e) { /* Ignore parsing error */ }
          throw new Error(errorMsg);
      }

      const data = await response.json();
      console.log("Event creation response:", data);

      setStatus('success');
      // Reset form with updated fields
      setFormData({ title: '', startDateTime: '', endDateTime: '', description: '' });
      setSelectedCoords(null);

      setTimeout(() => setStatus('idle'), 3000);

    } catch (error) {
      console.error("Error submitting event:", error);
      setStatus('error');
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const isFormDisabled = !selectedOrganizationId || status === 'submitting';

  if (!API_KEY) {
     return (
         <div className="flex-grow p-6 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center text-red-600">
             Configuration Error: Google Maps API Key is missing. Cannot display form.
         </div>
     );
  }

  return (
    <> {/* Fragment for modal */}
      <div className="flex-grow p-6 md:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Create New Event</h1>

          {/* Status Messages remain the same */}
          {!selectedOrganizationId && (
            <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">
              Please select an organization from the sidebar to create an event.
            </div>
          )}
          {status === 'success' && (
            <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-200">
              Event created successfully!
            </div>
          )}
          {status === 'error' && (
             <div className="mb-4 p-3 rounded bg-red-100 text-red-800 border border-red-200">
               Error: {submitError || 'Failed to create event.'}
             </div>
           )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title
              </label>
              <input
                type="text" id="title" name="title" value={formData.title} onChange={handleChange} required disabled={isFormDisabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder="e.g., Team Meeting"
              />
            </div>

            {/* Start Date & Time - Updated */}
            <div>
              <label htmlFor="startDateTime" className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
              <input
                type="datetime-local" // Use datetime-local input type
                id="startDateTime"
                name="startDateTime"
                value={formData.startDateTime}
                onChange={handleChange}
                required
                disabled={isFormDisabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                // Optionally set min attribute to prevent past dates/times
                min={new Date().toISOString().slice(0, 16)} // Example: Set minimum to current time
              />
            </div>

            {/* End Date & Time - Updated */}
            <div>
              <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <input
                type="datetime-local" // Use datetime-local input type
                id="endDateTime"
                name="endDateTime"
                value={formData.endDateTime}
                onChange={handleChange}
                required
                disabled={isFormDisabled}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                // Optionally set min attribute based on startDateTime
                min={formData.startDateTime} // Ensure end is not before start
              />
            </div>

             {/* Description */}
             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description" name="description" rows={4} value={formData.description} onChange={handleChange} disabled={isFormDisabled}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="Add details about the event..."
                />
            </div>

            {/* Location Section remains the same */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="mt-1 p-3 border border-gray-300 rounded-md min-h-[50px] bg-gray-50 flex items-center justify-between">
                <span className="text-gray-700 text-sm">
                  {selectedCoords
                    ? `Lat: ${selectedCoords.lat.toFixed(6)}, Lng: ${selectedCoords.lng.toFixed(6)}`
                    : 'No location selected'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  disabled={isFormDisabled || status === 'submitting'}
                  className="ml-4 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Select on Map
                </button>
              </div>
            </div>

            {/* Submit Button remains the same */}
            <div>
              <button
                type="submit"
                disabled={isFormDisabled || !selectedCoords} // Disable if no org, submitting, OR no coords selected
                 className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ease-in-out duration-150 ${
                   (isFormDisabled || !selectedCoords) // Combined disabled conditions
                     ? 'bg-indigo-300 cursor-not-allowed'
                     : status === 'submitting'
                     ? 'bg-indigo-400 cursor-not-allowed'
                     : 'bg-indigo-600 hover:bg-indigo-700'
                 }`}
              >
                {status === 'submitting' ? 'Creating Event...' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Render the Modal remains the same */}
      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLocationSelect={handleLocationSelect}
        apiKey={API_KEY}
      />
    </>
  );
};

export default CreateEventForm;