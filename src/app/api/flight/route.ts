import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const flightNumber = searchParams.get('flight');

  if (!flightNumber) {
    return NextResponse.json({ error: 'Flight number required' }, { status: 400 });
  }

  const apiKey = process.env.AVIATION_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Aviation API key not configured' }, { status: 500 });
  }

  try {
    // Try searching by IATA first
    let url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}&limit=1`;
    console.log('Trying IATA search:', flightNumber);
    
    let response = await fetch(url);
    let data = await response.json();
    
    // If no results with IATA, try ICAO
    if (!data.data || data.data.length === 0) {
      console.log('No results with IATA, trying ICAO:', flightNumber);
      url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_icao=${flightNumber}&limit=1`;
      response = await fetch(url);
      data = await response.json();
    }
    
    // If still no results, try searching by flight number only
    if (!data.data || data.data.length === 0) {
      // Extract just the number part (e.g., "3496" from "SKW3496")
      const flightNum = flightNumber.replace(/[A-Z]+/g, '');
      if (flightNum) {
        console.log('Trying flight number only:', flightNum);
        url = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_number=${flightNum}&limit=1`;
        response = await fetch(url);
        data = await response.json();
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AviationStack API error:', response.status, errorText);
      throw new Error(`AviationStack API error: ${response.status}`);
    }
    
    // Log the full response for debugging
    console.log('AviationStack final response:', JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error('AviationStack error:', data.error);
      return NextResponse.json({ error: data.error.message || 'API error' }, { status: 400 });
    }

    // Check if we got any data
    if (!data.data || data.data.length === 0) {
      console.log('No flights found after all attempts');
      return NextResponse.json({ 
        error: 'No flight data found. The flight may not be currently active, or try a different format (e.g., AA100, DL1234).' 
      }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flight data' },
      { status: 500 }
    );
  }
}
