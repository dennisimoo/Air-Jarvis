import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, flight, answers } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    // Create pilots directory if it doesn't exist
    const pilotsDir = path.join(process.cwd(), 'pilots');
    if (!fs.existsSync(pilotsDir)) {
      fs.mkdirSync(pilotsDir, { recursive: true });
    }

    // Get the file path
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(pilotsDir, `${sanitizedName}.json`);

    // Read existing data
    let existingData: any = {};
    if (fs.existsSync(filePath)) {
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    // Add questionnaire answers to the most recent flight
    if (existingData.flights && existingData.flights.length > 0) {
      // Find the most recent flight (last one in array)
      const lastFlightIndex = existingData.flights.length - 1;
      
      // Add questionnaire to that flight
      if (!existingData.flights[lastFlightIndex].questionnaire) {
        existingData.flights[lastFlightIndex].questionnaire = {
          ...answers,
          completedAt: new Date().toISOString(),
        };
        console.log('Added questionnaire to flight at index:', lastFlightIndex);
      } else {
        console.log('Questionnaire already exists for this flight');
      }
    } else {
      console.log('No flights found - questionnaire cannot be saved');
      return NextResponse.json({ 
        error: 'No flight data found. Please search for a flight first.' 
      }, { status: 400 });
    }

    existingData.lastUpdated = new Date().toISOString();

    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    console.log('Questionnaire saved to:', filePath);

    return NextResponse.json({
      success: true,
      message: 'Questionnaire saved successfully',
      filePath: filePath,
    });
  } catch (error: any) {
    console.error('Error saving questionnaire:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save questionnaire' },
      { status: 500 }
    );
  }
}
