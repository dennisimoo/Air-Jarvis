# Air Jarvis ✈️

**Air Jarvis** is an AI-powered flight safety and readiness assessment system inspired by Tony Stark's J.A.R.V.I.S. It analyzes pilot data, weather conditions, and flight information to provide intelligent safety recommendations before takeoff.

## What Does Air Jarvis Do?

Air Jarvis helps pilots and aviation enthusiasts assess flight readiness by:

- **Flight Analysis**: Tracks flight details using real-time aviation APIs
- **Pilot Assessment**: Evaluates pilot readiness through a comprehensive questionnaire covering:
  - Sleep quality and duration
  - Mental and physical state
  - Flight planning and preparation
  - Experience and comfort level
- **Weather Integration**: Fetches and analyzes current weather conditions for departure locations
- **AI-Powered Safety Scores**: Uses GPT-5 to generate a safety score (0-100) based on all collected data
- **Historical Tracking**: Stores pilot data and flight history for trend analysis

The system provides a futuristic, JARVIS-inspired interface with animated visualizations and real-time status indicators.

## Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun
- OpenAI API key (GPT-5 access)
- You.com API key (for search functionality)
- Aviation API key (for flight data)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/dennisimoo/Air-Jarvis.git
cd Air-Jarvis
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:

```bash
YOU_API_KEY=your_you_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
AVIATION_API_KEY=your_aviation_api_key_here
```

**Required Environment Variables:**
- `OPENAI_API_KEY` - Your OpenAI API key with GPT-5 access
- `YOU_API_KEY` - You.com API key for enhanced search capabilities
- `AVIATION_API_KEY` - API key for aviation data services

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Build for Production

```bash
npm run build
npm start
```

## Docker Deployment

### Building the Docker Image

```bash
docker build -t air-jarvis .
```

### Running with Docker

```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_openai_key \
  -e YOU_API_KEY=your_you_api_key \
  -e AVIATION_API_KEY=your_aviation_key \
  air-jarvis
```

The application will be available at `http://localhost:3000`

### Docker Compose (Optional)

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  air-jarvis:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - YOU_API_KEY=${YOU_API_KEY}
      - AVIATION_API_KEY=${AVIATION_API_KEY}
    restart: unless-stopped
```

Run with: `docker-compose up -d`

## Tech Stack

- [Next.js 16](https://nextjs.org) - React framework with App Router
- [React 19](https://react.dev) - UI library
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS 4](https://tailwindcss.com) - Styling and animations
- [OpenAI GPT-5](https://openai.com/api) - AI-powered flight safety analysis
- [You.com API](https://you.com) - Enhanced search capabilities
- Aviation APIs - Real-time flight data

## Project Structure

```
air-jarvis/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── analyze/      # AI analysis endpoint
│   │   │   ├── flight/       # Flight data fetching
│   │   │   ├── weather/      # Weather data
│   │   │   ├── questionnaire/# Questionnaire submission
│   │   │   └── person/       # Pilot data retrieval
│   │   ├── questionnaire/    # Questionnaire page
│   │   ├── results/          # Results display page
│   │   ├── page.tsx          # Home page (flight input)
│   │   └── layout.tsx        # Root layout
│   └── components/           # Reusable components
│       ├── FlightInput.tsx
│       ├── StatusBar.tsx
│       └── FooterBar.tsx
├── pilots/                   # Stored pilot data (JSON files)
├── public/                   # Static assets
├── Dockerfile                # Docker configuration
├── .dockerignore             # Docker ignore file
└── .env                      # Environment variables (not committed)
```

## Features

- 🎨 **Futuristic UI**: JARVIS-inspired interface with animated loaders and glassmorphism effects
- 🤖 **AI Analysis**: GPT-5 powered safety assessment
- ✈️ **Flight Tracking**: Real-time flight information
- 🌤️ **Weather Data**: Current weather conditions for departure locations
- 📊 **Safety Scoring**: 0-100 readiness score with detailed explanations
- 💾 **Data Persistence**: Stores pilot profiles and flight history
- 📱 **Responsive Design**: Works on desktop and mobile devices

## How It Works

1. **Input**: User enters their name and flight number
2. **Questionnaire**: Complete a comprehensive pre-flight assessment
3. **Data Collection**: System fetches flight and weather data
4. **AI Analysis**: GPT-5 analyzes all data points:
   - Sleep quality and hours
   - Mental and physical state
   - Weather conditions
   - Flight planning quality
   - Overall preparedness
5. **Results**: Receive a safety score with recommendations

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

- `POST /api/flight` - Fetch flight information
- `POST /api/weather` - Get weather data
- `POST /api/questionnaire` - Submit questionnaire responses
- `POST /api/analyze` - Generate AI safety analysis
- `GET /api/person?name=<name>` - Retrieve pilot data

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

MIT

## Credits

Inspired by Marvel's J.A.R.V.I.S. (Just A Rather Very Intelligent System)

---

**⚠️ Disclaimer**: This is an educational project. Always follow official aviation safety protocols and regulations. Air Jarvis is not a substitute for professional flight safety assessment.
