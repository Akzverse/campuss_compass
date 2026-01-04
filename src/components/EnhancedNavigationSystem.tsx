import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, ArrowLeft, Building2, Home, Zap, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CampusGraph, Dijkstra } from '../lib/graph';
import ARVisualization from './ARVisualization';
import type { Location, Building, Floor } from '../lib/database.types';

interface NavigationSystemProps {
  role: string;
  onBack: () => void;
}

interface LocationWithDetails extends Location {
  floor?: Floor;
  building?: Building;
}

export default function EnhancedNavigationSystem({ role, onBack }: NavigationSystemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<LocationWithDetails[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationWithDetails[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithDetails | null>(null);
  const [pathLocations, setPathLocations] = useState<LocationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAR, setShowAR] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [calculatingPath, setCalculatingPath] = useState(false);
  const [startLocation, setStartLocation] = useState<LocationWithDetails | null>(null);

  useEffect(() => {
    loadLocations();
  }, [role]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLocations(locations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = locations.filter(
        (loc) =>
          loc.name.toLowerCase().includes(query) ||
          loc.room_number?.toLowerCase().includes(query) ||
          loc.description?.toLowerCase().includes(query)
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

  async function loadLocations() {
    try {
      setLoading(true);

      const { data: locationsData } = await supabase
        .from('locations')
        .select(`
          *,
          floor:floors(
            *,
            building:buildings(*)
          )
        `)
        .contains('role_access', [role]);

      const locationsWithDetails = (locationsData || []).map((loc: any) => ({
        ...loc,
        floor: loc.floor,
        building: loc.floor?.building,
      }));

      setLocations(locationsWithDetails);
      setFilteredLocations(locationsWithDetails);
    } catch (error) {
      console.error('Error loading locations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function calculateOptimalPath(start: LocationWithDetails, end: LocationWithDetails) {
    setCalculatingPath(true);

    try {
      const { data: allLocations } = await supabase.from('locations').select('*');
      const { data: waypoints } = await supabase.from('waypoints').select('*');
      const { data: navSteps } = await supabase.from('navigation_steps').select('*');

      const pathRequest = {
        locations: allLocations || [],
        waypoints: waypoints || [],
        navigationSteps: navSteps || [],
        startLocationId: start.id,
        endLocationId: end.id,
      };

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pathfinding`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(pathRequest),
      });

      const data = await response.json();

      if (data.path) {
        const pathLocationIds = data.path
          .filter((node: any) => node.type === 'location')
          .map((node: any) => node.id);

        const detailedLocations = (allLocations || []).filter((loc: any) =>
          pathLocationIds.includes(loc.id)
        );

        setOptimizedRoute({
          nodes: data.path,
          distance: data.totalDistance,
          time: data.estimatedTime,
          locations: detailedLocations,
        });

        setPathLocations(detailedLocations);
      }
    } catch (error) {
      console.error('Error calculating path:', error);
      alert('Could not calculate optimal path');
    } finally {
      setCalculatingPath(false);
    }
  }

  async function handleLocationSelect(location: LocationWithDetails) {
    if (!startLocation) {
      setStartLocation(location);
    } else {
      setSelectedLocation(location);
      await calculateOptimalPath(startLocation, location);
    }
  }

  const getRoleColor = () => {
    const colors: Record<string, string> = {
      student: 'from-blue-500 to-cyan-500',
      faculty: 'from-emerald-500 to-teal-500',
      admin: 'from-violet-500 to-purple-500',
      visitor: 'from-amber-500 to-orange-500',
    };
    return colors[role] || 'from-blue-500 to-cyan-500';
  };

  if (showAR && optimizedRoute) {
    return (
      <ARVisualization
        pathNodes={optimizedRoute.nodes}
        pathEdges={[]}
        onClose={() => setShowAR(false)}
      />
    );
  }

  if (selectedLocation && optimizedRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => {
                setSelectedLocation(null);
                setStartLocation(null);
                setOptimizedRoute(null);
              }}
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Search
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  Route: {startLocation?.name} → {selectedLocation?.name}
                </h2>
                <div className="flex items-center space-x-6 text-slate-600">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {optimizedRoute.distance} units
                  </span>
                  <span className="flex items-center">
                    <Navigation className="w-4 h-4 mr-1" />
                    ~{optimizedRoute.time} seconds walk
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowAR(true)}
                className={`px-6 py-3 bg-gradient-to-r ${getRoleColor()} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center`}
              >
                <Eye className="w-5 h-5 mr-2" />
                View in AR
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
              <Navigation className="w-6 h-6 mr-3 text-blue-600" />
              Navigation Steps
            </h3>

            <div className="space-y-6">
              {optimizedRoute.nodes.map((node: any, index: number) => (
                <div key={node.id} className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor()} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {index + 1}
                    </div>
                    {index < optimizedRoute.nodes.length - 1 && (
                      <div className="w-0.5 h-20 bg-slate-200 my-2"></div>
                    )}
                  </div>

                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-slate-900 mb-1">{node.name}</h4>
                    <p className="text-sm text-slate-600 mb-2">
                      {node.type.charAt(0).toUpperCase() + node.type.slice(1)}
                      {node.description && ` • ${node.description}`}
                    </p>
                    {node.image_url && (
                      <img
                        src={node.image_url}
                        alt={node.name}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                    )}
                  </div>
                </div>
              ))}

              <div className="flex">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor()} flex items-center justify-center flex-shrink-0`}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-slate-900">You've arrived!</h4>
                  <p className="text-slate-600">Welcome to {selectedLocation.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Change Role
            </button>
            {startLocation && (
              <div className="flex items-center text-sm text-blue-600 font-semibold">
                <Zap className="w-4 h-4 mr-1" />
                From: {startLocation.name}
              </div>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder={startLocation ? 'Select destination...' : 'Search for starting location...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-600 mt-4">Loading locations...</p>
          </div>
        ) : calculatingPath ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-600 mt-4">Calculating optimal path...</p>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-xl text-slate-600">No locations found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <button
                key={location.id}
                onClick={() => handleLocationSelect(location)}
                className={`bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-left border-2 ${
                  startLocation?.id === location.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:border-blue-200'
                }`}
              >
                {location.image_url && (
                  <img
                    src={location.image_url}
                    alt={location.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{location.name}</h3>
                {location.room_number && (
                  <p className="text-blue-600 font-semibold mb-2">{location.room_number}</p>
                )}
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1" />
                    {location.building?.name}
                  </p>
                  <p className="flex items-center">
                    <Home className="w-4 h-4 mr-1" />
                    {location.floor?.name}
                  </p>
                </div>
                {startLocation?.id === location.id && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <span className="text-xs font-semibold text-blue-600">Selected as start</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
