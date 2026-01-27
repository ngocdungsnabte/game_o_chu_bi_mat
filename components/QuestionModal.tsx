
import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionModalProps {
  question: Question;
  onClose: () => void;
  onAnswer: (isCorrect: boolean) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ question, onClose, onAnswer }) => {
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [wrongKeys, setWrongKeys] = useState<('A' | 'B' | 'C' | 'D')[]>([]);
  const [isCorrecting, setIsCorrecting] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;

    if (selected === question.correctAnswer) {
      setIsCorrecting(true);
      // Gọi onAnswer(true) để App xử lý âm thanh vỗ tay và mở ô
      onAnswer(true);
    } else {
      // Nếu sai: Thêm vào danh sách các phím đã chọn sai
      setWrongKeys(prev => [...prev, selected]);
      // Gọi onAnswer(false) để App xử lý âm thanh "tùng tùng"
      onAnswer(false);
      // Reset lựa chọn để học sinh chọn lại
      setSelected(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex justify-between items-start">
          <div>
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-2 uppercase">
              Câu hỏi số {question.id + 1}
            </span>
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">
              {question.text}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-8 space-y-4">
          {(['A', 'B', 'C', 'D'] as const).map((key) => {
            const isSelected = selected === key;
            const isWrong = wrongKeys.includes(key);
            const isRight = isCorrecting && key === question.correctAnswer;
            
            let styles = "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ";

            if (isRight) {
              styles += "border-emerald-500 bg-emerald-50 text-emerald-900";
            } else if (isWrong) {
              styles += "border-rose-200 bg-rose-50 text-rose-400 cursor-not-allowed grayscale-[0.5]";
            } else if (isSelected) {
              styles += "border-indigo-500 bg-indigo-50 shadow-md";
            } else {
              styles += "border-slate-100 hover:border-slate-300 hover:bg-slate-50";
            }

            return (
              <button
                key={key}
                disabled={isCorrecting || isWrong}
                onClick={() => setSelected(key)}
                className={styles}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  isRight ? 'bg-emerald-600 text-white' : 
                  isWrong ? 'bg-rose-200 text-white' :
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {key}
                </span>
                <span className={`font-medium text-lg ${isWrong ? 'line-through decoration-rose-300' : ''}`}>
                  {question.options[key]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-8 bg-slate-50 flex justify-between items-center">
          <div className="text-sm font-medium text-slate-500 italic">
            {wrongKeys.length > 0 && !isCorrecting && (
              <span className="text-rose-500 flex items-center gap-1 animate-pulse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Chưa chính xác, hãy thử lại!
              </span>
            )}
          </div>
          <button 
            onClick={handleSubmit}
            disabled={!selected || isCorrecting}
            className="px-10 py-4 bg-slate-900 text-white rounded-xl font-bold shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isCorrecting ? 'CHÍNH XÁC!' : 'XÁC NHẬN'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;
