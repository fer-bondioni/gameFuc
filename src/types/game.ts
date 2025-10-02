export interface Character {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

export interface Question {
  id: string;
  question_text: string;
  order_number: number;
  created_at: string;
}

export interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  created_at: string;
}

export interface CharacterPoints {
  id: string;
  answer_id: string;
  character_id: string;
  points: number;
  created_at: string;
}

export interface UserResponse {
  id: string;
  user_name: string;
  result_character_id: string | null;
  responses: Record<string, string>; // question_id -> answer_id
  created_at: string;
}

// Game State Types
export interface GameState {
  currentStep: "name" | "questions" | "result";
  userName: string;
  currentQuestionIndex: number;
  answers: Record<string, string>; // question_id -> answer_id
  resultCharacter: Character | null;
}
