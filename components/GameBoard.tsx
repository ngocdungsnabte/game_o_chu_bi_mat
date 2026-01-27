
import React, { useState, useEffect } from 'react';
import { GameState, Question } from '../types';
import QuestionModal from './QuestionModal';

interface GameBoardProps {
  state: GameState;
  onAnswer: (index: number, isCorrect: boolean) => void;
  onSolve: () => void;
  onReset: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ state, onAnswer, onSolve, onReset }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  // Calculate grid layout
  const cols = Math.min(state.keyword.length, 6);

  const handleTileClick = (idx: number) => {
    if (state.revealedIndices.includes(idx)) return;
    setSelectedQuestion(state.questions[idx]);
  };

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (selectedQuestion) {
      onAnswer(selectedQuestion.id, isCorrect);
      if (isCorrect) {
        // Chỉ đóng modal và hoàn tất khi trả lời đúng
        setTimeout(() => {
          setSelectedQuestion(null);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-12 py-4">
      {/* The Scrambled/Revealed Area */}
      <div className="relative">
        <div 
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {state.scrambledIndices.map((originalIdx, gridIdx) => {
            const isSolved = state.status === 'solved';
            
            // In 'solved' state, we show letters in original order
            const displayChar = isSolved 
              ? state.keyword[gridIdx] 
              : state.keyword[originalIdx];
            
            const isThisGridRevealed = isSolved || state.revealedIndices.includes(isSolved ? gridIdx : originalIdx);

            return (
              <div 
                key={gridIdx}
                className="perspective-1000 w-24 h-32 md:w-32 md:h-40"
              >
                <div 
                  className={`relative w-full h-full duration-700 preserve-3d cursor-pointer ${
                    isThisGridRevealed ? 'rotate-y-180' : ''
                  }`}
                  onClick={() => !isSolved && handleTileClick(originalIdx)}
                >
                  {/* Front: Question Number */}
                  <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center shadow-md hover:border-indigo-400 hover:shadow-indigo-100 transition-all">
                    <span className="text-4xl font-black text-slate-300">
                      {originalIdx + 1}
                    </span>
                  </div>
                  
                  {/* Back: Revealed Letter */}
                  <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-2xl flex items-center justify-center shadow-xl border-4 ${
                    isSolved ? 'bg-indigo-600 border-indigo-300' : 'bg-emerald-500 border-emerald-200'
                  }`}>
                    <span className="text-5xl font-extrabold text-white">
                      {displayChar}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Finished State UI */}
        {state.status === 'revealed' && (
          <div className="mt-12 text-center animate-bounce">
            <button
              onClick={onSolve}
              className="px-10 py-4 bg-indigo-600 text-white rounded-full font-bold text-xl shadow-2xl shadow-indigo-300 hover:bg-indigo-700 transition-all"
            >
              GIẢI MÃ TỪ KHÓA!
            </button>
          </div>
        )}

        {state.status === 'solved' && (
          <div className="mt-12 text-center flex flex-col items-center gap-6">
            <div className="px-8 py-4 bg-green-100 text-green-700 rounded-2xl font-bold border border-green-200">
              🎉 CHÚC MỪNG BẠN ĐÃ TÌM RA TỪ KHÓA: {state.keyword}
            </div>
            <button
              onClick={onReset}
              className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
            >
              CHƠI LẠI
            </button>
          </div>
        )}
      </div>

      <div className="max-w-xl w-full text-center">
        <p className="text-slate-400 text-sm mb-2">HƯỚNG DẪN</p>
        <p className="text-slate-600 italic">
          Click vào các ô số để trả lời câu hỏi. Mỗi câu trả lời đúng sẽ mở ra một kí tự bí ẩn đằng sau ô đó. Sau khi mở hết tất cả các ô, hãy nhấn nút Giải mã để sắp xếp từ khóa về vị trí đúng!
        </p>
      </div>

      {selectedQuestion && (
        <QuestionModal 
          question={selectedQuestion} 
          onClose={() => setSelectedQuestion(null)}
          onAnswer={handleAnswerSubmit}
        />
      )}
    </div>
  );
};

export default GameBoard;
