
import React, { useState } from 'react';
import { GameState, Question } from '../types';
import QuestionModal from './QuestionModal';
import BlindBag from './BlindBag';

interface GameBoardProps {
  state: GameState;
  onAnswer: (index: number, isCorrect: boolean) => void;
  onSolve: () => void;
  onReset: () => void;
  onBackToHome: () => void;
  onStudentPicked: (name: string) => void;
  onPlaySound: (type: 'roll' | 'pick') => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ state, onAnswer, onSolve, onReset, onBackToHome, onStudentPicked, onPlaySound }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showBlindBag, setShowBlindBag] = useState(false);

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
        setTimeout(() => {
          setSelectedQuestion(null);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-10 py-4 relative">
      
      {/* Top Floating Controls */}
      <div className="fixed top-8 left-8 z-40 flex flex-col gap-4">
        <button 
          onClick={onBackToHome}
          className="w-14 h-14 bg-white text-slate-600 rounded-2xl shadow-xl flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 transition-all group border border-slate-100"
          title="Về trang chủ"
        >
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        <button 
          onClick={onReset}
          className="w-14 h-14 bg-white text-slate-600 rounded-2xl shadow-xl flex items-center justify-center hover:bg-slate-50 hover:text-amber-600 transition-all group border border-slate-100"
          title="Làm mới trò chơi"
        >
          <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Student Picker Button (Blind Bag) */}
      {state.status !== 'solved' && (
        <button 
          onClick={() => setShowBlindBag(true)}
          className="fixed bottom-8 right-8 z-40 bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl shadow-2xl hover:scale-110 hover:-translate-y-2 active:scale-95 transition-all group border-4 border-white"
          title="Gọi tên ngẫu nhiên"
        >
          <div className="flex items-center gap-4 pr-3">
            <div className="bg-white rounded-2xl p-2 group-hover:rotate-12 transition-transform shadow-sm">
                <span className="text-3xl">🎁</span>
            </div>
            <div className="text-left">
              <span className="block text-white font-black text-sm uppercase tracking-wider leading-none">Túi mù</span>
              <span className="block text-white/70 text-[10px] font-bold mt-1 uppercase">Sĩ số: {state.students.length}</span>
            </div>
          </div>
        </button>
      )}

      {/* The Scrambled/Revealed Area */}
      <div className="relative">
        <div 
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {state.scrambledIndices.map((originalIdx, gridIdx) => {
            const isSolved = state.status === 'solved';
            const displayChar = isSolved ? state.keyword[gridIdx] : state.keyword[originalIdx];
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
                  <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center shadow-md hover:border-indigo-400 hover:shadow-indigo-100 transition-all">
                    <span className="text-4xl font-black text-slate-300">
                      {originalIdx + 1}
                    </span>
                  </div>
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
            <div className="px-8 py-4 bg-green-100 text-green-700 rounded-2xl font-bold border border-green-200 shadow-sm">
              🎉 CHÚC MỪNG! TỪ KHÓA LÀ: <span className="text-indigo-700 ml-2 tracking-widest uppercase">{state.keyword}</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={onReset}
                className="px-8 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg"
              >
                CHƠI LẠI
              </button>
              <button
                onClick={onBackToHome}
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
              >
                VỀ TRANG CHỦ
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-xl w-full text-center mt-4">
        <p className="text-slate-400 text-[10px] mb-2 uppercase tracking-widest font-bold">Hướng dẫn trò chơi</p>
        <p className="text-slate-600 italic text-sm">
          Click vào các ô số để trả lời câu hỏi. Mỗi câu đúng sẽ mở ra một kí tự. Sau khi mở hết, nhấn <b>Giải mã</b> để sắp xếp từ khóa. Sử dụng <b>Túi mù</b> để gọi tên học sinh!
        </p>
      </div>

      {selectedQuestion && (
        <QuestionModal 
          question={selectedQuestion} 
          onClose={() => setSelectedQuestion(null)}
          onAnswer={handleAnswerSubmit}
        />
      )}

      {showBlindBag && (
        <BlindBag 
          students={state.students} 
          onClose={() => setShowBlindBag(false)}
          onStudentPicked={onStudentPicked}
          onPlaySound={onPlaySound}
        />
      )}
    </div>
  );
};

export default GameBoard;
