// components/LocationPickerModal.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, MapMouseEvent } from '@vis.gl/react-google-maps';

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: LatLngLiteral) => void;
  apiKey: string;
  initialCenter?: LatLngLiteral; // Optional: Center map initially
}

// Default center if none provided (West Lafayette)
const DEFAULT_CENTER = { lat: 40.4259, lng: -86.9081 };

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  apiKey,
  initialCenter = DEFAULT_CENTER,
}) => {
  const [markerLocation, setMarkerLocation] = useState<LatLngLiteral | null>(null);

  // Handle map click: place/move marker and update state
  const handleMapClick = useCallback((event: MapMouseEvent) => {
    if (!event.detail.latLng) return;
    const newLocation = {
      lat: event.detail.latLng.lat,
      lng: event.detail.latLng.lng,
    };
    console.log("Map clicked, new marker location:", newLocation);
    setMarkerLocation(newLocation);
  }, []);

  // Handle confirm: pass selected location back and close
  const handleConfirm = () => {
    if (markerLocation) {
      onLocationSelect(markerLocation);
      onClose(); // Close modal after selection
    } else {
      // Maybe show an alert or disable the button if no marker placed
      alert("Please click on the map to place a marker first.");
    }
  };

  // Reset marker when modal opens or closes
  React.useEffect(() => {
    if (!isOpen) {
      setMarkerLocation(null); // Clear marker when modal closes
    }
    // Optionally set initial marker if needed when opening
  }, [isOpen]);


  if (!isOpen) {
    return null; // Don't render anything if modal is closed
  }

  if (!apiKey) {
      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded-lg shadow-xl text-red-600">
                  Error: Google Maps API Key is missing for the modal.
              </div>
          </div>
      )
  }

  return (
    // Modal backdrop
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[70vh] flex flex-col m-4">
         <h3 className="text-lg font-medium leading-6 text-gray-900 p-4 border-b border-gray-200">
            Select Event Location
         </h3>
         <p className="px-4 py-2 text-sm text-gray-600">Click on the map to place a marker for your event.</p>

        {/* Map Area */}
        <div className="flex-grow relative">
           {/* Note: APIProvider should ideally wrap the whole app, but for isolated component: */}
          <APIProvider apiKey={apiKey}>
            <Map
              mapId={'eventLocationPickerMap'} // Unique Map ID
              style={{ width: '100%', height: '100%' }} // Ensure map fills container
              defaultCenter={initialCenter}
              defaultZoom={13}
              gestureHandling={'greedy'}
              onClick={handleMapClick} // Use onClick for map clicks
              clickableIcons={false} // Optional: disable clicking POIs
            >
              {markerLocation && (
                <AdvancedMarker
                  position={markerLocation}
                  title={'Selected Location'}
                />
              )}
            </Map>
          </APIProvider>
        </div>

        {/* Modal Footer with Buttons */}
        <div className="flex justify-end items-center p-4 border-t border-gray-200 space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!markerLocation} // Disable if no marker placed
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              !markerLocation
                ? 'bg-indigo-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;