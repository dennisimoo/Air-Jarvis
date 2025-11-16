import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, flightData } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const youApiKey = process.env.YOU_API_KEY;

    if (!youApiKey) {
      return NextResponse.json({ error: 'YOU API key not configured' }, { status: 500 });
    }

    // Create pilots directory if it doesn't exist
    const pilotsDir = path.join(process.cwd(), 'pilots');
    if (!fs.existsSync(pilotsDir)) {
      fs.mkdirSync(pilotsDir, { recursive: true });
    }

    // Check if we already have data for this person
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(pilotsDir, `${sanitizedName}.json`);

    let personInfo = '';
    let existingData: any = null;

    // Check if file exists
    if (fs.existsSync(filePath)) {
      console.log('Found existing data for:', name);
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      personInfo = existingData.personInfo || '';
    } else {
      // Search for person info using YOU API
      console.log('Searching for new person:', name);

      try {
        const searchQuery = `${name} pilot aviation`;
        const youApiUrl = `https://api.ydc-index.io/v1/search?query=${encodeURIComponent(searchQuery)}&count=5`;

        const response = await fetch(youApiUrl, {
          method: 'GET',
          headers: {
            'X-API-Key': youApiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`YOU API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Extract and format information from search results
        const webResults = data.results?.web || [];
        const newsResults = data.results?.news || [];

        let formattedInfo = `Information about ${name}:\n\n`;

        // Add web results
        if (webResults.length > 0) {
          formattedInfo += 'Web Results:\n';
          webResults.forEach((result: any, index: number) => {
            formattedInfo += `${index + 1}. ${result.title}\n`;
            formattedInfo += `   ${result.description}\n`;
            if (result.snippets && result.snippets.length > 0) {
              formattedInfo += `   ${result.snippets.join(' ')}\n`;
            }
            formattedInfo += `   Source: ${result.url}\n\n`;
          });
        }

        // Add news results
        if (newsResults.length > 0) {
          formattedInfo += '\nRecent News:\n';
          newsResults.forEach((result: any, index: number) => {
            formattedInfo += `${index + 1}. ${result.title}\n`;
            formattedInfo += `   ${result.description}\n`;
            formattedInfo += `   Source: ${result.url}\n\n`;
          });
        }

        personInfo = formattedInfo || 'No information found';
        console.log('YOU API search completed, length:', personInfo.length);
      } catch (searchError: any) {
        console.error('YOU API search error:', searchError.message);
        personInfo = `Search unavailable: ${searchError.message}`;
      }
    }

    // Save data to file
    const dataToSave = {
      name: name,
      personInfo: personInfo,
      flights: existingData?.flights || [],
      lastUpdated: new Date().toISOString(),
    };

    // Add current flight data if provided
    if (flightData) {
      dataToSave.flights.push({
        ...flightData,
        searchedAt: new Date().toISOString(),
      });
    }

    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    console.log('Data saved to:', filePath);

    return NextResponse.json({
      success: true,
      message: 'Data saved successfully',
      filePath: filePath,
    });
  } catch (error: any) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
