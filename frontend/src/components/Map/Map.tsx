// components/MapComponent.tsx
'use client';

import React, { useEffect, useState } from 'react';
// Import necessary components from the library
import { APIProvider, Map, AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { Event } from '@/types'; // Adjust import path if needed

// --- Helper: formatDateTime (copy from EventCard or import) ---
// (Make sure this function exists and handles potential property name variations if needed)
const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return "Date/Time not available";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid date/time";
        }
        // Using locale-specific format for date and time
        return date.toLocaleString(undefined, {
            dateStyle: 'medium', // e.g., Apr 6, 2025
            timeStyle: 'short',  // e.g., 10:52 AM
        });
    } catch (e) {
        console.error("Error formatting date/time:", e);
        return "Error"; // Fallback on error
    }
};
// --- End Helper ---

interface GeoLocationData {
    latitude: number | null;
    longitude: number | null;
}

const MapComponent = () => {
    // Ensure API Key is handled securely and correctly configured
    const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
    const [location, setLocation] = useState<GeoLocationData>({ latitude: null, longitude: null });
    const [events, setEvents] = useState<Event[]>([]); // Use Event type from your types definition
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null); // State for selected marker

    const getLocation = () => {
        if (!navigator.geolocation) {
            console.log("Geolocation not supported by browser");
            // Set a default location (e.g., center of desired area) if needed
            setLocation({ latitude: 40.4259, longitude: -86.9081 }); // Approx. West Lafayette
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                console.log("Location fetched:", position.coords);
            },
            (error: GeolocationPositionError) => {
                console.error("Error getting location:", error);
                 // Set default location on error
                 setLocation({ latitude: 40.4259, longitude: -86.9081 });
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 } // Slightly adjusted options
        );
    };

    const fetchEvents = async () => {
        const flaskApiUrl = process.env.NEXT_PUBLIC_FLASK_API_URL;
        // *** IMPORTANT: Use the backend endpoint that returns events WITH organization details populated ***
        const endpoint = "/event/"; // Example: adjust to your actual endpoint

        if (!flaskApiUrl) {
             console.error("Flask API URL is not configured in environment variables.");
             return; // Prevent fetch if URL is missing
        }

        try {
            const response = await fetch(flaskApiUrl + endpoint, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
                // Add Authorization header if needed:
                // 'Authorization': `Bearer ${your_token}`
            });

            if (response.ok) {
                const data = await response.json()
                setEvents(data.events || []);
                console.log("Fetched events:", data);
            } else {
                console.error("Failed to fetch events, status:", response.status, await response.text());
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    useEffect(() => {
        if (!API_KEY) {
             console.error("Google Maps API Key is missing! Map functionality will be limited.");
             // Potentially show an error state to the user
        }
        getLocation();
        fetchEvents();
        // Only run on mount, assuming API key doesn't change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handler for clicking a marker
    const handleMarkerClick = (eventId: string) => {
        setSelectedEventId(eventId);
    };

    // Handler for clicking the map (to close InfoWindow)
    const handleMapClick = () => {
         setSelectedEventId(null);
    }

    // Find the currently selected event object
    const selectedEvent = events.find(event => event._id === selectedEventId);

    // Render loading state while fetching location
    if (location.latitude === null || location.longitude === null) {
        return (
             <div className='flex items-center justify-center w-screen h-screen'>
                 <h1>Fetching location...</h1>
                 {/* Or a loading spinner component */}
             </div>
        );
     }

    // Render error state if API key is missing
     if (!API_KEY) {
         return (
              <div className='flex items-center justify-center w-screen h-screen'>
                  <h1 className='text-red-600 font-semibold p-4 text-center'>
                    Map configuration error: Google Maps API Key is missing.<br/> Please check your environment variables.
                  </h1>
              </div>
         );
     }

    // --- Main Render ---
    return (
        <div className='w-screen h-screen relative'> {/* Added relative positioning */}
            <APIProvider apiKey={API_KEY}>
                <Map
                    mapId={'bf51a910020fa25a'} // Optional: Your custom map style ID
                    style={{ width: '100%', height: '100%' }} // Ensure map fills container
                    defaultZoom={13} // Start with a reasonable zoom level
                    // Set center explicitly for better control after location fetch
                    center={{ lat: location.latitude, lng: location.longitude }}
                    gestureHandling={'greedy'} // Allows smooth interaction
                    disableDefaultUI={true} // Hides default +/- zoom, street view etc.
                    onClick={handleMapClick} // Add map click handler to close InfoWindow
                >
                    {/* Map over events and create markers */}
                    {events.map((event, index) => {
                        // Validate location data before rendering marker
                        if (!event.location || event.location.type !== 'Point' || !Array.isArray(event.location.coordinates) || event.location.coordinates.length !== 2) {
                            console.warn(`Event "${event.title || event._id}" has invalid or missing location data.`);
                            return null; // Skip rendering marker for this event
                        }
                        // IMPORTANT: GeoJSON is [longitude, latitude]
                        const latitude = event.location.coordinates[0];
                        const longitude = event.location.coordinates[1];

                        // Skip rendering if coordinates are somehow invalid
                         if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
                            console.warn(`Event "${event.title || event._id}" has non-numeric coordinates.`);
                            return null;
                         }

                        return (
                            <AdvancedMarker
                                key={index}
                                position={{ lat: latitude, lng: longitude }}
                                onClick={() => handleMarkerClick(event._id)}
                                title={event.title} // Basic browser tooltip on hover
                            >
                               {/* You can customize the marker icon here */}
                               {/* Example: Using a Pin component */}
                               <Pin
                                  background={selectedEventId === event._id ? '#FBBC04' : '#EA4335'} // Highlight selected
                                  glyphColor={'#fff'}
                                  borderColor={selectedEventId === event._id ? '#000' : '#fff'}
                                />
                               {/* Example: Using an emoji */}
                               {/* <span style={{ fontSize: '1.5rem' }}>📍</span> */}
                            </AdvancedMarker>
                        );
                    })}

                    {/* Render InfoWindow only if an event is selected and has valid coordinates */}
                    {selectedEvent && selectedEvent.location?.coordinates && (
                        <InfoWindow
                             // Position the InfoWindow slightly above the marker's coordinates
                             position={{
                                 lat: selectedEvent.location.coordinates[0], // Latitude
                                 lng: selectedEvent.location.coordinates[1]  // Longitude
                             }}
                             pixelOffset={[0, -30]} // Adjust vertical offset as needed
                             maxWidth={320} // Max width for content
                             onCloseClick={() => setSelectedEventId(null)} // Handle close button click
                             // Consider adding 'ariaLabel' for accessibility
                             ariaLabel={`Information window for ${selectedEvent.name}`}
                        >
                            {/* Content of the InfoWindow */}
                            <div className="p-1">
                                <h3 className="font-semibold text-base mb-1 text-gray-900">{selectedEvent.name}</h3>
                                <p className="text-xs text-gray-600 mb-2">
                                    Hosted by: <span className="font-medium">{selectedEvent.organizationName || 'Unknown'}</span>
                                </p>
                                <p className="text-xs mb-1">
                                    {/* Ensure correct property name (startTime or start_time) */}
                                    <span className="font-medium">Starts:</span> {formatDateTime(selectedEvent.start_time.$date)}
                                </p>
                                <p className="text-xs mb-2">
                                     {/* Ensure correct property name (endTime or end_time) */}
                                     <span className="font-medium">Ends:</span> {formatDateTime(selectedEvent.end_time.$date)}
                                </p>
                                {selectedEvent.description && (
                                    <p className="text-xs mt-2 border-t pt-2 text-gray-700">{selectedEvent.description.substring(0, 100)}{selectedEvent.description.length > 100 ? '...' : ''}</p> // Truncate long description
                                )}
                                {/* Optional: Link to a full event details page */}
                                {/* <a href={`/events/${selectedEvent._id}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs mt-2 block">More Info</a> */}
                            </div>
                        </InfoWindow>
                    )}
                </Map>
            </APIProvider>
        </div>
    );
};

export default MapComponent;