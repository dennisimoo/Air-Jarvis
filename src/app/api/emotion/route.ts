import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, image } = body;

    if (!name || !image) {
      return NextResponse.json({ error: 'Name and image required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    console.log('Analyzing emotion for:', name);

    // Send image to OpenAI Vision API for emotion analysis
    const client = new OpenAI({ apiKey });

    const response = await client.chat.completions.create({
      model: "gpt-5.1-2025-11-13", // Use GPT-5.1 for vision capabilities
      messages: [
        {
          role: "system",
          content: "You are an expert psychologist and emotion analyst. Analyze the person's facial expression and body language to determine their emotional state, stress level, and mental readiness. Be detailed and professional."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this person's emotional state. Provide: 1) Primary emotion (e.g., calm, anxious, stressed, tired, alert, etc.), 2) Stress level (1-10), 3) Brief analysis (2-3 sentences) of their facial expression, body language, and overall demeanor. Format as JSON with fields: emotion, stressLevel, analysis."
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const analysisText = response.choices[0].message.content || '{}';
    const emotionData = JSON.parse(analysisText);

    console.log('\n=== EMOTION ANALYSIS RESULT ===');
    console.log('Raw response:', analysisText);
    console.log('Parsed emotion data:', JSON.stringify(emotionData, null, 2));
    console.log('================================\n');

    // Save emotion data to pilot's file
    const pilotsDir = path.join(process.cwd(), 'pilots');
    if (!fs.existsSync(pilotsDir)) {
      fs.mkdirSync(pilotsDir, { recursive: true });
    }

    const sanitizedName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filePath = path.join(pilotsDir, `${sanitizedName}.json`);

    let pilotData: any = {};

    // Read existing data if available
    if (fs.existsSync(filePath)) {
      pilotData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } else {
      pilotData = {
        name: name,
        createdAt: new Date().toISOString(),
        flights: []
      };
    }

    // Store emotion analysis at root level so it can be merged later
    pilotData.latestEmotionAnalysis = {
      ...emotionData,
      capturedAt: new Date().toISOString(),
    };

    // Also add to the most recent flight if it exists
    if (pilotData.flights && pilotData.flights.length > 0) {
      const lastFlightIndex = pilotData.flights.length - 1;
      pilotData.flights[lastFlightIndex].emotionAnalysis = {
        ...emotionData,
        capturedAt: new Date().toISOString(),
      };
      console.log(`Added emotion to flight index ${lastFlightIndex}`);
    }

    pilotData.lastUpdated = new Date().toISOString();

    console.log('Saving pilot data with emotion:', {
      hasLatestEmotion: !!pilotData.latestEmotionAnalysis,
      emotionKeys: Object.keys(pilotData.latestEmotionAnalysis || {}),
      flightCount: pilotData.flights?.length || 0
    });

    // Save updated data
    fs.writeFileSync(filePath, JSON.stringify(pilotData, null, 2));
    console.log('Emotion data saved to:', filePath);

    return NextResponse.json({
      success: true,
      emotion: emotionData,
    });
  } catch (error: any) {
    console.error('Error analyzing emotion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze emotion' },
      { status: 500 }
    );
  }
}
