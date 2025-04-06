// Example file path: app/my-events/attending/page.tsx
// Or: pages/my-events/attending.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Used for potential redirection
import EventCard from '@/components/EventCard/EventCard'; // Adjust import path if needed
import { Event } from '@/types'; // Adjust import path if needed

const AttendingEventsPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchAttendingEvents = async() => {
        const apiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
        const endpoint = "/event/attending";
        const token = localStorage.getItem("access_token")

        if (!token) {
            return;
        }

        try {
            const response = await fetch(apiUrl + endpoint, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })

            if (response.ok) {
                const data = await response.json()
                console.log(data)
                console.log(data.events.events)
                setEvents(data.events.events)
                setIsLoading(false)
            }
        } catch (error) {
            console.log("fetching atteding events error:", error)
        }
    }

    useEffect(() => {
        fetchAttendingEvents();
    }, []); // Fetch events when component mounts

    // --- Render Logic ---
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Update Page Title */}
                <h1 className="text-3xl font-bold text-black text-center mb-8">My Attending Events</h1>

                {/* Loading State */}
                {isLoading && <div className="text-center text-gray-600 py-10">Loading your events...</div>}

                {/* Error State */}
                {error && (
                    <div className="text-center text-red-600 bg-red-100 border border-red-400 rounded p-4 mx-auto max-w-md">
                        <p className="font-medium">Could not load events:</p>
                        <p className="text-sm mt-1">{error}</p>
                        {/* Optional: Add buttons for retry or login based on error */}
                         {(error.includes("log in") || error.includes("expired")) && (
                            <button
                                onClick={() => router.push('/login')} // Adjust login route if needed
                                className="mt-3 px-4 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Go to Login
                            </button>
                        )}
                    </div>
                )}

                {/* No Events State */}
                {!isLoading && !error && events.length === 0 && (
                    <div className="text-center text-gray-500 py-10">
                        You are not currently marked as attending any events.
                    </div>
                )}

                {/* Event List */}
                {!isLoading && !error && events.length > 0 && (
                    <div className="space-y-4">
                        {events.map((event) => (
                            <EventCard
                                key={event._id} // Use unique DB ID for key
                                event={event}
                                // Pass the actual handlers down
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AttendingEventsPage;