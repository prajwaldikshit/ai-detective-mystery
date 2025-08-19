# 🕵️ AI Detective Mystery

A real-time multiplayer detective mystery game where players collaborate to solve AI-generated murder mysteries. Built with React, Express.js, and powered by OpenAI.

## 🎮 Features

- **AI-Generated Mysteries**: Each game features unique murder cases created by OpenAI
- **Real-Time Multiplayer**: Collaborate with friends using WebSocket connections
- **Interactive Investigation**: Explore crime scenes, discover evidence, and question suspects
- **Team Discussion**: Built-in chat system for sharing theories and clues
- **Voting System**: Collectively decide who the murderer is
- **Noir Theme**: Atmospheric dark theme with neon highlights and smooth animations

## 🚀 Game Flow

1. **Create/Join Room**: Start a new game or join with a room code
2. **Investigation Phase**: Explore rooms, gather evidence, and study suspects
3. **Discussion Phase**: Share findings and theories with your team
4. **Voting Phase**: Cast your vote for who you think is the murderer
5. **Reveal Phase**: See if you solved the case and learn the truth!

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express.js, WebSockets
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4 for mystery generation
- **UI**: Shadcn/ui components with Radix UI primitives

## 🎯 Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your OpenAI API key in environment variables
4. Run the development server: `npm run dev`
5. Visit `http://localhost:5000` and start solving mysteries!

## 🎲 Demo Mode

Try the **View Demo** button on the home page to see a sample mystery without needing multiple players!

## 🏗️ Architecture

- **Modular Design**: Separated game logic, OpenAI service, and storage layers
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Real-Time Communication**: WebSocket-based multiplayer with session management
- **Flexible Storage**: Support for both in-memory and database persistence

## 🎨 Design

The game features a sophisticated noir detective theme with:
- Dark atmospheric backgrounds
- Neon cyan and gold highlights
- Smooth animations and transitions
- Responsive design for all devices

---

Built with ❤️ for mystery lovers and detective enthusiasts!