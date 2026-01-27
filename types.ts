
export enum Grade {
  G10 = '10',
  G11 = '11',
  G12 = '12'
}

export interface Question {
  id: number;
  keywordChar: string; // The character this question corresponds to
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

export interface GameState {
  keyword: string;
  grade: Grade;
  questions: Question[];
  status: 'setup' | 'playing' | 'revealed' | 'solved';
  revealedIndices: number[]; // Indices of correctly answered questions
  scrambledIndices: number[]; // Shuffled indices of the keyword characters
}
