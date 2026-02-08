
import React, { useState, useCallback, useEffect } from 'react';
import { Grade, Question, GameState } from './types';
import SetupForm from './components/SetupForm';
import GameBoard from './components/GameBoard';
import confetti from 'canvas-confetti';

// Helper for shuffling array
const shuffle = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    keyword: '',
    grade: Grade.G10,
    questions: [],
    status: 'setup',
    revealedIndices: [],
    scrambledIndices: [],
    students: []
  });

  // Audio setup
  const [correctSound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'));
  const [wrongSound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2014/2014-preview.mp3'));
  const [victorySound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'));
  const [applauseSound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3'));
  const [rollSound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'));
  const [pickSound] = useState(new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3'));

  const playSound = (type: 'correct' | 'wrong' | 'victory' | 'applause' | 'roll' | 'pick') => {
    let audio: HTMLAudioElement;
    switch (type) {
      case 'correct': audio = correctSound; break;
      case 'wrong': audio = wrongSound; break;
      case 'victory': audio = victorySound; break;
      case 'applause': audio = applauseSound; break;
      case 'roll': audio = rollSound; break;
      case 'pick': audio = pickSound; break;
    }
    
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.warn("Audio play blocked", e));
    }
  };

  const fireFireworks = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
    function randomInRange(min: number, max: number) { return Math.random() * (max - min) + min; }
    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const handleStartSetup = (keyword: string, grade: Grade, questions: Question[], students: string[]) => {
    const cleanedKeyword = keyword.replace(/\s/g, "").toUpperCase();
    const indices = Array.from({ length: cleanedKeyword.length }, (_, i) => i);
    setGameState({
      keyword: cleanedKeyword,
      grade,
      questions,
      status: 'playing',
      revealedIndices: [],
      scrambledIndices: shuffle(indices),
      students: [...students]
    });
  };

  const handleAnswer = (questionIndex: number, isCorrect: boolean) => {
    if (isCorrect) {
      playSound('correct');
      setGameState(prev => {
        const nextRevealed = [...prev.revealedIndices, questionIndex];
        const allRevealed = nextRevealed.length === prev.questions.length;
        return {
          ...prev,
          revealedIndices: nextRevealed,
          status: allRevealed ? 'revealed' : 'playing'
        };
      });
    } else {
      playSound('wrong');
    }
  };

  const handleStudentPicked = (name: string) => {
    playSound('pick');
    setGameState(prev => ({
      ...prev,
      students: prev.students.filter(s => s !== name)
    }));
  };

  const handleSolve = () => {
    playSound('applause');
    playSound('victory');
    fireFireworks();
    setGameState(prev => ({ ...prev, status: 'solved' }));
  };

  const handleResetProgress = () => {
    const indices = Array.from({ length: gameState.keyword.length }, (_, i) => i);
    setGameState(prev => ({
      ...prev,
      status: 'playing',
      revealedIndices: [],
      scrambledIndices: shuffle(indices)
    }));
  };

  const handleBackToHome = () => {
    setGameState({
      keyword: '',
      grade: Grade.G10,
      questions: [],
      status: 'setup',
      revealedIndices: [],
      scrambledIndices: [],
      students: []
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4">
      <header className="max-w-6xl mx-auto mb-10 text-center relative">
        <h1 className="text-3xl md:text-4xl lg:text-5xl mb-4 pt-4 title-modern-classic">
          GAME Ô CHỮ BÍ MẬT
        </h1>
        <div className="flex justify-center mt-4">
          <p className="px-5 py-2 bg-white border border-slate-200 text-slate-500 font-bold tracking-[0.2em] uppercase text-[10px] rounded-full shadow-sm">
            Môn: Tin Học • {gameState.status === 'setup' ? 'Thiết lập trò chơi' : `Khối Lớp ${gameState.grade}`}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {gameState.status === 'setup' ? (
          <SetupForm onStart={handleStartSetup} />
        ) : (
          <GameBoard 
            state={gameState} 
            onAnswer={handleAnswer} 
            onSolve={handleSolve}
            onReset={handleResetProgress}
            onBackToHome={handleBackToHome}
            onStudentPicked={handleStudentPicked}
            onPlaySound={playSound}
          />
        )}
      </main>
    </div>
  );
};

export default App;
