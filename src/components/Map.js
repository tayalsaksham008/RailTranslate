// MapComponent.js
import React,{useEffect} from 'react';
import {
  GoogleMap,
  Marker,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { useRef, useState } from 'react';
import { FaLocationArrow, FaTimes } from 'react-icons/fa';

const center = { lat: 48.8584, lng: 2.2945 };

function Map() {
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const originRef = useRef();
  const destinationRef = useRef();

    const calculateRoute = () => {
        // Check if the google object is defined
        if (window.google) {
          const directionsService = new window.google.maps.DirectionsService();
          directionsService.route({
            origin: originRef.current.value,
            destination: destinationRef.current.value,
            travelMode: window.google.maps.TravelMode.DRIVING,
          }, (results, status) => {
            if (status === 'OK') {
              setDirectionsResponse(results);
              setDistance(results.routes[0].legs[0].distance.text);
              setDuration(results.routes[0].legs[0].duration.text);
            } else {
              // Handle the error here
              console.error('Directions request failed:', status);
            }
          });
        } else {
          // Handle the case where the Google Maps API is not loaded yet
          console.error('Google Maps API not loaded');
        }
      }

  useEffect(calculateRoute, []);
  

  function clearRoute() {
    setDirectionsResponse(null);
    setDistance('');
    setDuration('');
    originRef.current.value = '';
    destinationRef.current.value = '';
  }

  return (
    <div className="relative flex flex-col items-center h-screen w-screen">
      <div className="absolute top-0 left-0 h-full w-full">
        {/* Google Map Box */}
        <GoogleMap
          center={center}
          zoom={15}
          mapContainerStyle={{ width: '100%', height: '100%' }}
          options={{
            zoomControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => setMap(map)}
        >
          <Marker position={center} />
          {directionsResponse && (
            <DirectionsRenderer directions={directionsResponse} />
          )}
        </GoogleMap>
      </div>
      <div className="p-4 rounded-lg m-4 bg-white shadow-base min-w-md z-10">
        <div className="flex items-center space-x-2 justify-between">
          <div className="flex-grow">
            <Autocomplete>
              <input
                type="text"
                placeholder="Origin"
                ref={originRef}
                className="w-full py-1 px-2 border rounded focus:outline-none"
              />
            </Autocomplete>
          </div>
          <div className="flex-grow">
            <Autocomplete>
              <input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
                className="w-full py-1 px-2 border rounded focus:outline-none"
              />
            </Autocomplete>
          </div>
          <div className="space-x-2">
            <button
              className="px-4 py-2 bg-pink-500 text-white rounded focus:outline-none"
              onClick={calculateRoute}
            >
              Calculate Route
            </button>
            <button
              className="p-2 bg-gray-200 text-gray-700 rounded-full focus:outline-none"
              onClick={clearRoute}
            >
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="flex mt-4 justify-between space-x-4">
          <span>Distance: {distance}</span>
          <span>Duration: {duration}</span>
          <button
            className="p-2 bg-gray-200 text-gray-700 rounded-full focus:outline-none"
            onClick={() => {
              map.panTo(center);
              map.setZoom(15);
            }}
          >
            <FaLocationArrow />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Map;
