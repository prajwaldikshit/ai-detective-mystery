# AI Detective Mystery Game

## Overview

This is a real-time multiplayer detective mystery game where players collaborate to solve AI-generated murder mysteries. The application features a React frontend with a Node.js/Express backend, using WebSockets for real-time communication and Drizzle ORM with PostgreSQL for data persistence. Players can create or join game rooms, explore virtual crime scenes, discover evidence, and vote on suspects to solve the mystery together.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Single-page application using functional components and hooks
- **Routing**: Wouter for client-side routing with pages for home, lobby, and game
- **State Management**: React hooks with custom useGame and useSocket hooks for game state and WebSocket communication
- **UI Framework**: Shadcn/ui components with Radix UI primitives for accessible, customizable interface elements
- **Styling**: Tailwind CSS with custom noir/detective theme using CSS variables for dark, atmospheric design
- **Real-time Updates**: WebSocket connection for live game updates, chat, and player interactions

### Backend Architecture
- **Express.js Server**: RESTful API with WebSocket server on `/ws` path for real-time communication
- **TypeScript**: Full type safety across server, shared schemas, and client
- **Modular Services**: Separated business logic into GameService for game management and OpenAI service for mystery generation
- **Session Management**: WebSocket-based player authentication and game room management
- **Storage Abstraction**: Interface-based storage system supporting both in-memory and database persistence

### Data Storage Solutions
- **Drizzle ORM**: Type-safe database operations with PostgreSQL as primary database
- **Neon Database**: Serverless PostgreSQL provider for cloud deployment
- **Schema Design**: Separate tables for users, games, participants, messages, and evidence with proper relationships
- **In-Memory Fallback**: MemStorage class provides development/testing storage without database dependency

### Authentication and Authorization
- **Simple Session-Based**: WebSocket authentication using temporary user IDs and usernames
- **Game-Level Access Control**: Room codes for joining games, host privileges for game management
- **No Persistent Authentication**: Stateless approach suitable for casual multiplayer gaming sessions

### External Dependencies
- **OpenAI GPT-4**: AI-powered mystery generation including suspects, evidence, crime scenes, and narrative elements
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **WebSocket Server**: Real-time bidirectional communication for game state synchronization
- **Vite Development**: Hot module replacement and optimized bundling for development experience
- **Motion Animation**: Framer Motion for smooth UI transitions and game phase animations

The architecture emphasizes real-time collaboration, type safety, and modular design while maintaining simplicity for rapid development and deployment.
