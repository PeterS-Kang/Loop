// components/CreateEventPage.tsx
'use client'; // Required for App Router if using hooks like useState/useEffect

import EventCreationLayout from '@/components/EventCreationLayout/EventCreationLayout';
import React, { useState } from 'react';

// Interface for the form data state
interface EventFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
}

const CreateEventPage: React.FC = () => {
  // State to hold the form data
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handler for input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default page reload
    setStatus('submitting');
    setSubmitError(null);

    console.log('Event Data Submitted:', formData);

    // --- TODO: Replace with your actual API call ---
    try {
      // Example: Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Assume success for now
      setStatus('success');
      // Optionally clear the form
      // setFormData({ title: '', date: '', startTime: '', endTime: '', location: '', description: '' });

      // Hide success message after a few seconds
      setTimeout(() => setStatus('idle'), 3000);

    } catch (error) {
      console.error("Error submitting event:", error);
      setStatus('error');
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
    // --- End of API call section ---
  };

  return (
    <EventCreationLayout />
  );
};

export default CreateEventPage;