import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Search, X, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';

interface MapComponentProps {
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string };
  height?: string;
  showSearch?: boolean;
  showCurrentLocation?: boolean;
  className?: string;
}

const MapComponent = ({
  onLocationSelect,
  initialLocation,
  height = '400px',
  showSearch = true,
  showCurrentLocation = true,
  className = ''
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    initialLocation || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock map data for demo purposes
  const mockLocations = [
    { lat: 40.7128, lng: -74.0060, address: 'New York, NY, USA' },
    { lat: 37.7749, lng: -122.4194, address: 'San Francisco, CA, USA' },
    { lat: 30.2672, lng: -97.7431, address: 'Austin, TX, USA' },
    { lat: 47.6062, lng: -122.3321, address: 'Seattle, WA, USA' },
    { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA, USA' },
    { lat: 41.8781, lng: -87.6298, address: 'Chicago, IL, USA' },
    { lat: 25.7617, lng: -80.1918, address: 'Miami, FL, USA' },
    { lat: 39.9526, lng: -75.1652, address: 'Philadelphia, PA, USA' }
  ];

  // Initialize map (mock implementation)
  useEffect(() => {
    if (mapRef.current && !map) {
      // In a real app, you would initialize Google Maps or Mapbox here
      // For demo purposes, we'll create a mock map
      const mockMap = {
        setCenter: (location: { lat: number; lng: number }) => {
          console.log('Map center set to:', location);
        },
        setZoom: (zoom: number) => {
          console.log('Map zoom set to:', zoom);
        }
      };
      setMap(mockMap);
    }
  }, [map]);

  // Handle location search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock search results
    const results = mockLocations.filter(location =>
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(results);
    setIsLoading(false);
  };

  // Handle location selection
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setSearchQuery(location.address);
    setSearchResults([]);
    
    if (map) {
      map.setCenter(location);
      map.setZoom(15);
    }
    
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }
    
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const address = `Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        
        const location = { lat, lng, address };
        handleLocationSelect(location);
        setIsLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location');
        setIsLoading(false);
      }
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Bar */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="p-2">
            <CardContent className="p-0">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search for a location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  size="sm"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </Button>
                {showCurrentLocation && (
                  <Button
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    <Navigation className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full bg-gray-100 rounded-lg border-2 border-gray-200 relative overflow-hidden"
        style={{ height }}
      >
        {/* Mock Map Content */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
          <div className="text-center">
            <MapPin className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map</h3>
            <p className="text-gray-600 mb-4">
              {selectedLocation ? selectedLocation.address : 'Select a location to get started'}
            </p>
            {selectedLocation && (
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Location Selected</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Map Pin */}
        {selectedLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
            >
              <MapPin className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-4 right-4 z-20"
        >
          <Card className="max-h-60 overflow-y-auto">
            <CardContent className="p-0">
              {searchResults.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0 flex items-center gap-3"
                >
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{location.address}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 z-10"
        >
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-red-700">
                <X className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-30">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;



