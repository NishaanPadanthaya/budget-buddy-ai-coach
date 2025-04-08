
# Budget Buddy - AI Financial Assistant

Budget Buddy is a mobile application that helps users manage their finances with the power of AI. The app provides expense tracking, savings goals, and an AI assistant that offers personalized financial advice.

## Features

- **Expense Tracking**: Monitor your spending and categorize transactions.
- **Savings Goals**: Set and track progress towards financial goals.
- **AI Assistant**: Get personalized financial advice powered by GPT-4.
- **Insights Dashboard**: Visualize your financial health with interactive charts.

## Tech Stack

- **Frontend**: React Native
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **AI**: LLM with RAG (Retrieval Augmented Generation)
- **Mobile**: Capacitor for iOS and Android deployment

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
```
npm install
```

3. Set up environment variables:
Create a `.env` file with the following:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
OPENAI_API_KEY=your_openai_api_key
```

4. Start the backend server:
```
node server/server.js
```

5. Start the frontend development server:
```
npm run dev
```

### Mobile App Setup

1. Build the web app:
```
npm run build
```

2. Add mobile platforms:
```
npx cap add android
npx cap add ios
```

3. Sync web code to mobile projects:
```
npx cap sync
```

4. Open in Android Studio or Xcode:
```
npx cap open android
npx cap open ios
```

## Project Structure

- `server/` - Backend API and database models
- `src/` - Frontend React Native code
- `android/` - Android platform code (after adding with Capacitor)
- `ios/` - iOS platform code (after adding with Capacitor)

## AI Assistant

The Budget Buddy AI Assistant uses a Large Language Model (GPT-4) with Retrieval Augmented Generation (RAG) to provide personalized financial advice based on your transaction history and savings goals.
