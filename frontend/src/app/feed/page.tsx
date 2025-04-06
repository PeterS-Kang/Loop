// pages/events/feed.tsx (or app/events/feed/page.tsx)
'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import EventCard from '@/components/EventCard/EventCard'; // Adjust import path
import { Event } from '@/types'; // Adjust import path

const EventFeedPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async() => {
    const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
    const endpoint = "/event/";

    try {
        const response = await fetch(flaskApiUrl + endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (response.ok) {
            const data = await response.json()
            setEvents(data.events)
            setIsLoading(false)
            console.log(data)
        }
    } catch (error) {
        console.error("Error fetching events:", error)
    }
  }

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchEvents()
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-black text-center mb-8">Event Feed</h1>

        {/* Loading/Error/No Events States (keep as before) */}
        {isLoading && <div className="text-center text-gray-600">Loading events...</div>}
        {error && <div className="text-center text-red-600 ...">Error: {error}</div>}
        {!isLoading && !error && events.length === 0 && <div className="text-center text-gray-500">No events found.</div>}

        {/* Event List */}
        {!isLoading && !error && events.length > 0 && (
          <div className="space-y-4">
            {events.map((event, index) => (
              <EventCard
                key={index}
                event={event}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventFeedPage;