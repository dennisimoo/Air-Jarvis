"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface FlightData {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal?: string;
    gate?: string;
    delay?: number;
    scheduled: string;
    estimated?: string;
    actual?: string;
    latitude?: number;
    longitude?: number;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal?: string;
    gate?: string;
    baggage?: string;
    delay?: number;
    scheduled: string;
    estimated?: string;
    actual?: string;
    latitude?: number;
    longitude?: number;
  };
  airline: {
    name: string;
    iata: string;
    icao: string;
  };
  flight: {
    number: string;
    iata: string;
    icao: string;
  };
  aircraft?: {
    registration?: string;
    iata?: string;
    icao?: string;
  };
}

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    cloud_cover: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    visibility: number;
  };
}

export default function Results() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const flightNumber = searchParams.get("flight");
  const userName = searchParams.get("name");
  
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [departureWeather, setDepartureWeather] = useState<WeatherData | null>(null);
  const [arrivalWeather, setArrivalWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysis, setAnalysis] = useState<{ score: number; explanation: string } | null>(null);
  const [analyzingLoading, setAnalyzingLoading] = useState(false);

  useEffect(() => {
    if (flightNumber) {
      fetchFlightData(flightNumber);
    }
  }, [flightNumber]);

  const getCoordinatesFromCity = async (cityOrAirport: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      // Use Open-Meteo's geocoding API
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityOrAirport)}&count=1&language=en&format=json`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return {
          lat: data.results[0].latitude,
          lon: data.results[0].longitude,
        };
      }
      return null;
    } catch (err) {
      console.error('Error getting coordinates:', err);
      return null;
    }
  };

  const fetchWeather = async (lat: number, lon: number): Promise<WeatherData | null> => {
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      
      if (data.error) {
        console.error('Weather fetch error:', data.error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching weather:', err);
      return null;
    }
  };

  const savePersonAndFlightData = async (name: string, flight: FlightData, depWeather: WeatherData | null, arrWeather: WeatherData | null) => {
    try {
      console.log('Saving data for:', name);
      const response = await fetch('/api/person', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          flightData: {
            ...flight,
            departureWeather: depWeather,
            arrivalWeather: arrWeather,
          },
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Data saved successfully to:', data.filePath);
      } else {
        console.error('Error saving data:', data.error);
      }
    } catch (err) {
      console.error('Error saving person and flight data:', err);
    }
  };

  const fetchFlightData = async (flight: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/flight?flight=${encodeURIComponent(flight)}`);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      // AviationStack returns data in a 'data' array
      if (data.data && data.data.length > 0) {
        const flight = data.data[0];
        setFlightData(flight);
        setError(null);
        
        // Fetch weather for both airports using airport names
        let depWeather = null;
        let arrWeather = null;
        
        // Get coordinates from airport names
        const depCoords = await getCoordinatesFromCity(flight.departure.airport);
        if (depCoords) {
          depWeather = await fetchWeather(depCoords.lat, depCoords.lon);
          setDepartureWeather(depWeather);
        }
        
        const arrCoords = await getCoordinatesFromCity(flight.arrival.airport);
        if (arrCoords) {
          arrWeather = await fetchWeather(arrCoords.lat, arrCoords.lon);
          setArrivalWeather(arrWeather);
        }
        
        // Save data to file if name is provided
        if (userName && userName.trim()) {
          savePersonAndFlightData(userName, flight, depWeather, arrWeather);
        }
      } else {
        setError("No flight data found");
      }
    } catch (err) {
      setError("Error fetching flight data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'landed':
        return 'text-green-600';
      case 'scheduled':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      case 'delayed':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleViewScore = async () => {
    if (!userName) return;
    
    setAnalyzingLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: userName }),
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data.analysis);
        setShowAnalysis(true);
      } else {
        console.error('Error getting analysis:', data.error);
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
    } finally {
      setAnalyzingLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="relative flex min-h-screen bg-sky-200 overflow-hidden">
      {/* Cloud background */}
      <div 
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300/30 to-sky-100/30"></div>

      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-2xl border border-white/30 shadow-lg text-blue-950/80 font-medium hover:bg-white/30 transition-all z-50"
      >
        ← Back
      </button>

      <div className="relative z-10 w-full p-8 pt-20">
        {loading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="loader-outer-small mb-4"></div>
              <p className="text-blue-950/70 font-medium">Analyzing flight data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="p-8 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-2xl">
              <p className="text-red-600 font-medium text-xl">{error}</p>
              <p className="text-blue-950/70 mt-2">Flight: {flightNumber}</p>
            </div>
          </div>
        )}

        {!loading && !error && flightData && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="p-8 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-light text-blue-950 mb-2">
                    Flight {flightData.flight.iata}
                  </h1>
                  <p className="text-xl text-blue-900/70">
                    {flightData.airline.name}
                  </p>
                </div>
                <div className={`text-2xl font-medium ${getStatusColor(flightData.flight_status)}`}>
                  {flightData.flight_status.toUpperCase()}
                </div>
              </div>
              <p className="text-sm text-blue-900/60 mt-2">
                Flight Date: {new Date(flightData.flight_date).toLocaleDateString()}
              </p>
            </div>

            {/* Route Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Departure */}
              <div className="p-6 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-xl">
                <h2 className="text-sm font-medium text-blue-900/60 mb-3">DEPARTURE</h2>
                <h3 className="text-3xl font-light text-blue-950 mb-2">
                  {flightData.departure.iata}
                </h3>
                <p className="text-lg text-blue-900/80 mb-4">
                  {flightData.departure.airport}
                </p>
                
                <div className="space-y-2 text-sm">
                  {flightData.departure.scheduled && (
                    <div>
                      <p className="text-blue-900/50">Scheduled</p>
                      <p className="text-blue-950">{formatDateTime(flightData.departure.scheduled)}</p>
                    </div>
                  )}
                  {flightData.departure.actual && (
                    <div>
                      <p className="text-blue-900/50">Actual</p>
                      <p className="text-blue-950">{formatDateTime(flightData.departure.actual)}</p>
                    </div>
                  )}
                  {flightData.departure.estimated && (
                    <div>
                      <p className="text-blue-900/50">Estimated</p>
                      <p className="text-blue-950">{formatDateTime(flightData.departure.estimated)}</p>
                    </div>
                  )}
                  {flightData.departure.terminal && (
                    <div>
                      <p className="text-blue-900/50">Terminal</p>
                      <p className="text-blue-950">{flightData.departure.terminal}</p>
                    </div>
                  )}
                  {flightData.departure.gate && (
                    <div>
                      <p className="text-blue-900/50">Gate</p>
                      <p className="text-blue-950">{flightData.departure.gate}</p>
                    </div>
                  )}
                  {flightData.departure.delay && flightData.departure.delay > 0 && (
                    <div>
                      <p className="text-red-600">Delay: {flightData.departure.delay} minutes</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Arrival */}
              <div className="p-6 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-xl">
                <h2 className="text-sm font-medium text-blue-900/60 mb-3">ARRIVAL</h2>
                <h3 className="text-3xl font-light text-blue-950 mb-2">
                  {flightData.arrival.iata}
                </h3>
                <p className="text-lg text-blue-900/80 mb-4">
                  {flightData.arrival.airport}
                </p>
                
                <div className="space-y-2 text-sm">
                  {flightData.arrival.scheduled && (
                    <div>
                      <p className="text-blue-900/50">Scheduled</p>
                      <p className="text-blue-950">{formatDateTime(flightData.arrival.scheduled)}</p>
                    </div>
                  )}
                  {flightData.arrival.actual && (
                    <div>
                      <p className="text-blue-900/50">Actual</p>
                      <p className="text-blue-950">{formatDateTime(flightData.arrival.actual)}</p>
                    </div>
                  )}
                  {flightData.arrival.estimated && (
                    <div>
                      <p className="text-blue-900/50">Estimated</p>
                      <p className="text-blue-950">{formatDateTime(flightData.arrival.estimated)}</p>
                    </div>
                  )}
                  {flightData.arrival.terminal && (
                    <div>
                      <p className="text-blue-900/50">Terminal</p>
                      <p className="text-blue-950">{flightData.arrival.terminal}</p>
                    </div>
                  )}
                  {flightData.arrival.gate && (
                    <div>
                      <p className="text-blue-900/50">Gate</p>
                      <p className="text-blue-950">{flightData.arrival.gate}</p>
                    </div>
                  )}
                  {flightData.arrival.baggage && (
                    <div>
                      <p className="text-blue-900/50">Baggage</p>
                      <p className="text-blue-950">{flightData.arrival.baggage}</p>
                    </div>
                  )}
                  {flightData.arrival.delay && flightData.arrival.delay > 0 && (
                    <div>
                      <p className="text-red-600">Delay: {flightData.arrival.delay} minutes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Weather Information */}
            {(departureWeather || arrivalWeather) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Departure Weather */}
                {departureWeather && (
                  <div className="p-6 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-xl">
                    <h2 className="text-sm font-medium text-blue-900/60 mb-3">DEPARTURE WEATHER - {flightData.departure.iata}</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-900/50">Temperature</p>
                        <p className="text-blue-950 font-medium">{departureWeather.current.temperature_2m}°C</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Feels Like</p>
                        <p className="text-blue-950 font-medium">{departureWeather.current.apparent_temperature}°C</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Wind Speed</p>
                        <p className="text-blue-950 font-medium">{departureWeather.current.wind_speed_10m} km/h</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Wind Gusts</p>
                        <p className="text-blue-950 font-medium">{departureWeather.current.wind_gusts_10m} km/h</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Humidity</p>
                        <p className="text-blue-950 font-medium">{departureWeather.current.relative_humidity_2m}%</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Cloud Cover</p>
                        <p className="text-blue-950 font-medium">{departureWeather.current.cloud_cover}%</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Precipitation</p>
                        <p className="text-blue-950 font-medium">{departureWeather.current.precipitation} mm</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Visibility</p>
                        <p className="text-blue-950 font-medium">{(departureWeather.current.visibility / 1000).toFixed(1)} km</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Arrival Weather */}
                {arrivalWeather && (
                  <div className="p-6 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-xl">
                    <h2 className="text-sm font-medium text-blue-900/60 mb-3">ARRIVAL WEATHER - {flightData.arrival.iata}</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-blue-900/50">Temperature</p>
                        <p className="text-blue-950 font-medium">{arrivalWeather.current.temperature_2m}°C</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Feels Like</p>
                        <p className="text-blue-950 font-medium">{arrivalWeather.current.apparent_temperature}°C</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Wind Speed</p>
                        <p className="text-blue-950 font-medium">{arrivalWeather.current.wind_speed_10m} km/h</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Wind Gusts</p>
                        <p className="text-blue-950 font-medium">{arrivalWeather.current.wind_gusts_10m} km/h</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Humidity</p>
                        <p className="text-blue-950 font-medium">{arrivalWeather.current.relative_humidity_2m}%</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Cloud Cover</p>
                        <p className="text-blue-950 font-medium">{arrivalWeather.current.cloud_cover}%</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Precipitation</p>
                        <p className="text-blue-950 font-medium">{arrivalWeather.current.precipitation} mm</p>
                      </div>
                      <div>
                        <p className="text-blue-900/50">Visibility</p>
                        <p className="text-blue-950 font-medium">{(arrivalWeather.current.visibility / 1000).toFixed(1)} km</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Flight Details */}
            <div className="p-6 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-xl">
              <h2 className="text-sm font-medium text-blue-900/60 mb-3">FLIGHT DETAILS</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-blue-900/50">Flight Number</p>
                  <p className="text-lg text-blue-950">{flightData.flight.iata}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-900/50">Airline</p>
                  <p className="text-lg text-blue-950">{flightData.airline.name}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-900/50">Airline Code</p>
                  <p className="text-lg text-blue-950">{flightData.airline.iata}</p>
                </div>
                {flightData.aircraft?.registration && (
                  <div>
                    <p className="text-xs text-blue-900/50">Aircraft Reg</p>
                    <p className="text-lg text-blue-950">{flightData.aircraft.registration}</p>
                  </div>
                )}
              </div>
            </div>

            {/* View Safety Score Button */}
            {userName && (
              <div className="flex justify-center">
                <button
                  onClick={handleViewScore}
                  disabled={analyzingLoading}
                  className="px-8 py-4 bg-blue-600/80 backdrop-blur-2xl border border-blue-500/50 rounded-2xl text-white hover:bg-blue-600/90 hover:border-blue-400/60 hover:shadow-xl transition-all duration-300 font-medium tracking-wide text-base uppercase shadow-lg disabled:opacity-50"
                >
                  {analyzingLoading ? 'ANALYZING...' : 'VIEW SAFETY SCORE'}
                </button>
              </div>
            )}

            {/* Analysis Display */}
            {showAnalysis && analysis && (
              <div className="p-8 rounded-3xl bg-white/25 backdrop-blur-2xl border border-white/40 shadow-2xl">
                <h2 className="text-sm font-medium text-blue-900/60 mb-4">FLIGHT READINESS ANALYSIS</h2>
                <div className="text-center mb-6">
                  <div className={`text-6xl font-bold ${getScoreColor(analysis.score)} mb-2`}>
                    {analysis.score}
                  </div>
                  <p className="text-sm text-blue-900/60">Safety Score (0-100)</p>
                </div>
                <div className="text-blue-900/80 leading-relaxed">
                  {analysis.explanation}
                </div>
                <div className="mt-4 text-xs text-blue-900/50 text-center">
                  Analysis powered by GPT-5
                </div>
              </div>
            )}

            {/* Status Badge */}
            <div className="flex justify-center">
              <div className="px-6 py-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg">
                <div className="flex items-center gap-2 justify-center text-xs font-medium">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-blue-950/70">POWERED BY AVIATIONSTACK & GPT-5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
