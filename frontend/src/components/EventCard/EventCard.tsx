// components/EventCard.tsx
'use client'; // Needed for useState, useEffect, etc.

import React, { useEffect, useState } from 'react';
import { Event } from '@/types'; // Adjust import path if needed
import { BookmarkIcon as BookmarkOutlineIcon, CheckCircleIcon as CheckCircleOutlineIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon, CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'; // Import clock and calendar icons


// --- Helper: formatDate (formats only the date part) ---
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "Date not available";
  try {
    // Use UTC parsing to avoid timezone shifts affecting the *date* display
    const date = new Date(dateString);
     // Add check for invalid date object after parsing
     if (isNaN(date.getTime())) {
        return "Invalid date";
     }
    return date.toLocaleDateString(undefined, { // User's locale for date format
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
      timeZone: 'UTC' // Specify UTC to interpret the date part consistently
    });
  } catch (e) {
     console.error("Error formatting date:", e);
     return dateString; // Fallback to original string on error
  }
};
// --- End Helper ---

// --- Helper: formatTime (formats only the time part) ---
const formatTime = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    // Let Date parsing handle the ISO string, then format time in user's local timezone
    console.log(dateString)
    const date = new Date(dateString);
    console.log(date)
    // Add check for invalid date object after parsing
     if (isNaN(date.getTime())) {
        return "Invalid time";
     }
    return date.toLocaleTimeString(undefined, { // User's locale and timezone for time display
      hour: 'numeric', minute: '2-digit', // e.g., 10:30 AM
    });
  } catch (e) {
    console.error("Error formatting time:", e);
    return "Error"; // Fallback on error
 }
};
// --- End Helper ---


interface EventCardProps {
  event: Event;
}


const EventCard: React.FC<EventCardProps> = ({ event}) => {
  const [isSaved, setIsSaved] = useState(event.isSavedByCurrentUser || false);
  const [isAttending, setIsAttending] = useState(event.isAttendedByCurrentUser || false);
  const [isSavingLoading, setIsSavingLoading] = useState(false);
  const [isAttendingLoading, setIsAttendingLoading] = useState(false);

  const fetchAttendingStatus = async() => {
    const apiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
    const endpoint = "/event/status/" + event._id.$oid;
    const token = localStorage.getItem("access_token")

    if (!token) {
        return
    }

    try {
        const response = await fetch(apiUrl + endpoint, {
            method:"GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
        })

        if (response.ok) {
            const data = await response.json()
            console.log(data)
            setIsAttending(data.status)
        }
    } catch (error) {
        console.log("Error attending:", error)
    }

  }

  const handleAttendClick = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
    const endpoint = "/event/attend";
    const token = localStorage.getItem("access_token")

    if (!token) {
        return
    }

    try {
        const response = await fetch(apiUrl + endpoint, {
            method:"POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"event": event._id, "action": !isAttending})
        })

        if (response.ok) {
            const data = await response.json()
            console.log(data.updated)
            if (data.updated) {
                setIsAttending(!isAttending)
            }
        }
    } catch (error) {
        console.log("Error attending:", error)
    }
  }

  // --- Location Button Handler ---
  const handleViewOnMap = () => {
    if (event.location && event.location.type === 'Point' && Array.isArray(event.location.coordinates)) {
      const latitude = event.location.coordinates[0];
      const longitude = event.location.coordinates[1];
      // Construct Google Maps URL using coordinates
      // This URL format drops a pin at the location
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
      // Open in a new tab
      window.open(mapUrl, '_blank', 'noopener noreferrer');
    } else {
      console.warn('No valid location data to view on map.');
      // Optionally show a small notification to the user
    }
  };
  // --- End Location Button Handler ---


  useEffect(() => {
    fetchAttendingStatus()
  }, [])

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 transition hover:shadow-md flex flex-col" data-testid={`event-card-${event._id}`}>
       {/* Content Area */}
        <div className="flex-grow">
            {/* Event Title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.name}</h3>
            {/* Organization Name */}
            <p className="text-sm text-gray-600 mb-3">Hosted by: <span className="font-medium">{event.organizationName || 'Unknown Organization'}</span></p>

            {/* Date and Time Section - Updated */}
            <div className="flex items-center text-sm text-gray-700 mb-3 space-x-2">
                 <ClockIcon className="h-4 w-4 text-gray-500 flex-shrink-0" aria-hidden="true"/>
                 {/* Display Time Range */}
                 <span>{formatDate(event.start_time.$date)} {formatTime(event.start_time.$date)} - {formatDate(event.end_time.$date)} {formatTime(event.end_time.$date)}</span>
            </div>
            {/* End Date and Time Section */}

            {/* Location Section - Updated */}
            <div className="flex items-center text-sm text-gray-700 mb-4">
                 <MapPinIcon className="h-4 w-4 text-gray-500 mr-1.5 flex-shrink-0" aria-hidden="true"/>
                 {/* Conditionally render button only if location exists */}
                 {event.location && event.location.coordinates ? (
                    <button
                        type="button" // Important for buttons not submitting forms
                        onClick={handleViewOnMap}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 rounded-sm text-left" // Added focus styles and text-left
                        aria-label={`View location for ${event.title} on map`}
                    >
                        View on Map
                    </button>
                 ) : (
                    <span className="text-gray-500 italic">Location not specified</span>
                 )}
            </div>
            {/* End Location Section */}

            {/* Description */}
            {event.description && (
                <p className="text-sm text-gray-800 leading-relaxed mb-3">{event.description}</p>
            )}
        </div>

        {/* Action Buttons Area (remains the same) */}
        <div className="mt-auto pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">

            {/* Attend Button */}
            <button
                onClick={handleAttendClick}
                disabled={isAttendingLoading}
                 className={`inline-flex items-center justify-center px-3 py-1.5 border rounded text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 ${
                    isAttending
                    ? 'border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700' // Attending state
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                } ${isAttendingLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                 aria-label={isAttending ? 'Mark as Not Attending' : 'Mark as Attending'}
           >
                 {isAttendingLoading ? (
                      <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                 ) : (
                    isAttending ? <CheckCircleSolidIcon className="h-4 w-4 mr-1.5" /> : <CheckCircleOutlineIcon className="h-4 w-4 mr-1.5" />
                )}
                 {isAttendingLoading ? 'Updating...' : (isAttending ? 'Attending' : 'Attend')}
            </button>
        </div>
    </div>
  );
};

export default EventCard;