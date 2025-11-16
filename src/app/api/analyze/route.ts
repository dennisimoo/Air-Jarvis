import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    // Read the pilot's JSON file
    const pilotsDir = path.join(process.cwd(), 'pilots');
    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(pilotsDir, `${sanitizedName}.json`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'No data found for this person' }, { status: 404 });
    }

    const pilotData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Check if analysis already exists for the most recent flight
    if (pilotData.flights && pilotData.flights.length > 0) {
      const lastFlight = pilotData.flights[pilotData.flights.length - 1];
      if (lastFlight.analysis) {
        return NextResponse.json({
          success: true,
          analysis: lastFlight.analysis,
          cached: true,
        });
      }
    }

    // Send to GPT-5 for analysis
    console.log('Analyzing pilot data with GPT-5...');
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-5.1-2025-11-13",
      messages: [
        {
          role: "system",
          content: "You are an aviation safety analyst. Analyze the pilot's questionnaire responses, flight data, and weather conditions to assess their readiness to fly. Provide a safety score from 0-100 and a brief 3-sentence explanation."
        },
        {
          role: "user",
          content: `Analyze this pilot's data and provide a flight readiness score (0-100) and 3-sentence explanation:\n\n${JSON.stringify(pilotData, null, 2)}\n\nConsider: sleep quality, mental state, visibility conditions, planning quality, weather conditions, and overall preparedness. Format your response as JSON with "score" (number) and "explanation" (string) fields.`
        }
      ],
      response_format: { type: "json_object" },
    });

    const analysisText = response.choices[0].message.content || '{}';
    const analysis = JSON.parse(analysisText);

    // Save analysis to the file
    if (pilotData.flights && pilotData.flights.length > 0) {
      const lastFlightIndex = pilotData.flights.length - 1;
      pilotData.flights[lastFlightIndex].analysis = {
        score: analysis.score,
        explanation: analysis.explanation,
        analyzedAt: new Date().toISOString(),
      };
      pilotData.lastUpdated = new Date().toISOString();
      fs.writeFileSync(filePath, JSON.stringify(pilotData, null, 2));
      console.log('Analysis saved to:', filePath);
    }

    return NextResponse.json({
      success: true,
      analysis: {
        score: analysis.score,
        explanation: analysis.explanation,
        analyzedAt: new Date().toISOString(),
      },
      cached: false,
    });
  } catch (error: any) {
    console.error('Error analyzing data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze data' },
      { status: 500 }
    );
  }
}
