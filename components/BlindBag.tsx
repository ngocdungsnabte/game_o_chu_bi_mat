
import React, { useState, useEffect } from 'react';

interface BlindBagProps {
  students: string[];
  onClose: () => void;
  onStudentPicked: (name: string) => void;
  onPlaySound: (type: 'roll' | 'pick') => void;
}

const BlindBag: React.FC<BlindBagProps> = ({ students, onClose, onStudentPicked, onPlaySound }) => {
  const [rolling, setRolling] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('???');

  const startRoll = () => {
    if (students.length === 0) return;
    setRolling(true);
    setSelectedName(null);
    onPlaySound('roll');
    
    let count = 0;
    const maxRolls = 25;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setDisplayName(students[randomIndex]);
      count++;
      
      if (count >= maxRolls) {
        clearInterval(interval);
        const winner = students[Math.floor(Math.random() * students.length)];
        setDisplayName(winner);
        setSelectedName(winner);
        setRolling(false);
        onStudentPicked(winner);
      }
    }, 80);
  };

  useEffect(() => {
    if (students.length > 0) {
      const timer = setTimeout(() => startRoll(), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 text-center relative overflow-hidden border-4 border-white/20">
        
        {/* Decorative background elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="absolute top-0 right-0 bg-white/10 text-white/80 text-[10px] font-bold px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
            Còn lại: {students.length} HS
          </div>

          <div className={`mx-auto w-24 h-24 mb-6 transition-all duration-300 ${rolling ? 'animate-bounce scale-110' : 'scale-100'}`}>
            <div className="bg-white rounded-2xl shadow-xl flex items-center justify-center w-full h-full transform -rotate-6 border-4 border-indigo-200">
               <span className="text-5xl">🎁</span>
            </div>
          </div>

          <h3 className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-2">Túi mù bí ẩn</h3>
          <h2 className="text-3xl font-black text-white mb-6">AI SẼ TRẢ LỜI?</h2>

          <div className={`bg-white/10 backdrop-blur-md rounded-2xl py-8 px-4 border border-white/20 min-h-[120px] flex flex-col items-center justify-center transition-all ${selectedName ? 'scale-105 border-yellow-400 bg-white/20' : ''}`}>
             {students.length === 0 && !selectedName ? (
               <p className="text-rose-300 font-bold italic">Danh sách học sinh đã hết!</p>
             ) : (
               <p className={`text-4xl font-bold tracking-tight transition-all ${selectedName ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'text-white'}`}>
                 {displayName}
               </p>
             )}
          </div>

          <div className="mt-8 flex gap-3">
             <button 
               onClick={startRoll}
               disabled={rolling || students.length === 0}
               className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-black py-4 rounded-2xl shadow-lg transform transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
             >
               {rolling ? 'ĐANG CHỌN...' : 'QUAY TIẾP'}
             </button>
             <button 
               onClick={onClose}
               className="bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-2xl border border-white/10 transition-all"
             >
               ĐÓNG
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlindBag;
