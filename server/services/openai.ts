import OpenAI from "openai";
import { Mystery, GamePhase } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_SECRET_KEY || "default_key"
});

export class OpenAIService {
  async generateMystery(difficulty: "easy" | "medium" | "hard" = "medium"): Promise<Mystery> {
    const prompt = `Generate a murder mystery for a multiplayer detective game with the following structure:

REQUIREMENTS:
- Difficulty level: ${difficulty}
- 4-6 suspects with distinct personalities, motives, and alibis
- 6-10 pieces of evidence (mix of real clues and red herrings)
- 5-8 explorable rooms/locations
- One clear murderer with logical method and confession
- Victorian or modern noir setting

OUTPUT FORMAT (JSON):
{
  "id": "unique-mystery-id",
  "title": "Mystery Title",
  "setting": "Location description",
  "victim": {
    "name": "Victim Name",
    "description": "Physical description",
    "background": "Background story"
  },
  "crimeScene": "Primary crime scene description",
  "suspects": [
    {
      "id": "suspect-1",
      "name": "Full Name",
      "role": "Relationship to victim",
      "description": "Physical and personality description",
      "motive": "Why they might kill the victim",
      "alibi": "Their claimed whereabouts",
      "imageUrl": "https://images.unsplash.com/photo-[id]" 
    }
  ],
  "evidence": [
    {
      "id": "evidence-1",
      "title": "Evidence Name",
      "description": "Detailed description of the evidence",
      "room": "Where it's found",
      "significance": "low|medium|high|critical",
      "isRedHerring": false
    }
  ],
  "rooms": [
    {
      "id": "room-1",
      "name": "Room Name",
      "description": "Room description and atmosphere",
      "evidence": ["evidence-1", "evidence-2"],
      "hasBeenExplored": false
    }
  ],
  "murderer": {
    "suspectId": "suspect-id",
    "method": "How the murder was committed",
    "confession": "Full confession when revealed",
    "alternateEnding": "What happens if players guess wrong"
  },
  "difficulty": "${difficulty}"
}

Create an engaging, logical mystery with interconnected clues that lead to the murderer.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a master mystery writer creating detective games. Generate compelling, logical mysteries with well-developed characters and intricate plots. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
        temperature: 0.8,
      });

      const mysteryData = JSON.parse(response.choices[0].message.content || "{}");
      return mysteryData as Mystery;
    } catch (error) {
      console.error("OpenAI mystery generation error:", error);
      throw new Error("Failed to generate mystery: " + (error as Error).message);
    }
  }

  async generateRoomDescription(mystery: Mystery, roomId: string, playersPresent: string[]): Promise<string> {
    const room = mystery.rooms.find(r => r.id === roomId);
    if (!room) throw new Error("Room not found");

    const prompt = `You are the game master for "${mystery.title}". A player is investigating the ${room.name}.

CONTEXT:
- Setting: ${mystery.setting}
- Crime: Murder of ${mystery.victim.name}
- Room: ${room.name}
- Room Description: ${room.description}
- Available Evidence: ${room.evidence.map(evidenceId => {
      const evidence = mystery.evidence.find(e => e.id === evidenceId);
      return evidence ? `${evidence.title} - ${evidence.description}` : evidenceId;
    }).join(", ")}

Provide an atmospheric description of what the player sees when entering this room. Be immersive and hint at clues without being too obvious. Keep it under 200 words.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "You find yourself in a dimly lit room with an air of mystery.";
    } catch (error) {
      console.error("OpenAI room description error:", error);
      return `You enter the ${room.name}. ${room.description}`;
    }
  }

  async analyzeEvidence(mystery: Mystery, evidenceId: string): Promise<string> {
    const evidence = mystery.evidence.find(e => e.id === evidenceId);
    if (!evidence) throw new Error("Evidence not found");

    const prompt = `As an AI forensic analyst in "${mystery.title}", analyze this evidence:

EVIDENCE: ${evidence.title}
DESCRIPTION: ${evidence.description}
LOCATION: Found in ${evidence.room}
SIGNIFICANCE: ${evidence.significance}

Provide a detailed forensic analysis explaining what this evidence reveals about the crime. Consider fingerprints, DNA, timeline, motive, etc. Be scientific but accessible. Keep under 150 words.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.6,
      });

      return response.choices[0].message.content || `This ${evidence.title} appears to be significant to the case.`;
    } catch (error) {
      console.error("OpenAI evidence analysis error:", error);
      return `Analysis of ${evidence.title}: This evidence may provide important clues about the murder.`;
    }
  }
}

export const openaiService = new OpenAIService();
