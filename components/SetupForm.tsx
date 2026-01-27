
import React, { useState, useRef } from 'react';
import { Grade, Question } from '../types';
import { generateQuestions } from '../services/geminiService';
import mammoth from 'mammoth';

interface SetupFormProps {
  onStart: (keyword: string, grade: Grade, questions: Question[]) => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ onStart }) => {
  const [keyword, setKeyword] = useState('');
  const [grade, setGrade] = useState<Grade>(Grade.G10);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [file, setFile] = useState<{ data: string; mimeType: string } | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFileName(selectedFile.name);
      setExtractedText(''); // Reset
      
      const isWord = selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || selectedFile.name.endsWith('.docx');
      const isPdf = selectedFile.type === 'application/pdf';
      const isImage = selectedFile.type.startsWith('image/');

      if (isWord) {
        // Xử lý file Word
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            setExtractedText(result.value);
            setFile(null); // Không cần gửi binary nếu đã lấy được text
          } catch (err) {
            console.error("Lỗi khi đọc file Word:", err);
            alert("Không thể trích xuất văn bản từ file Word này.");
          }
        };
        reader.readAsArrayBuffer(selectedFile);
      } else if (isPdf || isImage) {
        // Xử lý PDF hoặc Hình ảnh
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          setFile({ data: base64, mimeType: selectedFile.type });
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // Xử lý file text đơn thuần
        const reader = new FileReader();
        reader.onload = (event) => {
          setExtractedText(event.target?.result as string);
        };
        reader.readAsText(selectedFile);
      }
    }
  };

  const handleGenerate = async () => {
    if (!keyword.trim()) return alert('Vui lòng nhập từ khóa!');
    setLoading(true);
    try {
      const generated = await generateQuestions(keyword, grade, file || undefined, extractedText || undefined);
      setQuestions(generated);
    } catch (error) {
      console.error(error);
      alert('Lỗi khi tạo câu hỏi. Thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = (id: number, field: string, value: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === id) {
        if (field.startsWith('opt_')) {
          const optKey = field.split('_')[1] as keyof typeof q.options;
          return { ...q, options: { ...q.options, [optKey]: value } };
        }
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const handleStart = () => {
    if (questions.length === 0) return alert('Vui lòng tạo câu hỏi trước!');
    onStart(keyword, grade, questions);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Cài đặt bên trái */}
      <div className="lg:col-span-4 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 space-y-6">
        <h3 className="text-xl font-bold text-slate-800 border-b pb-3">Cài đặt trò chơi</h3>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Từ khóa chính</label>
          <input 
            type="text" 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Ví dụ: INTERNET"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all uppercase font-bold tracking-widest text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Khối lớp</label>
          <div className="grid grid-cols-3 gap-2">
            {[Grade.G10, Grade.G11, Grade.G12].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrade(g)}
                className={`py-2.5 rounded-xl font-bold transition-all text-sm ${
                  grade === g 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Tài liệu tham khảo (PDF, Word, Ảnh)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept=".pdf,.docx,.txt,image/*"
            />
            <div className="flex flex-col items-center">
              <svg className={`w-8 h-8 mb-2 ${fileName ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-xs font-medium text-slate-500 truncate max-w-full">
                {fileName || "Tải lên tài liệu..."}
              </span>
              {extractedText && <span className="text-[10px] text-emerald-500 mt-1 font-bold italic">Đã trích xuất nội dung!</span>}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !keyword}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          )}
          {questions.length > 0 ? 'Tạo lại với AI' : 'Tạo câu hỏi với AI'}
        </button>

        {questions.length > 0 && (
          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-xl shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            BẮT ĐẦU TRÒ CHƠI
          </button>
        )}
      </div>

      {/* Danh sách câu hỏi bên phải */}
      <div className="lg:col-span-8 space-y-4">
        {questions.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-2 px-2">
              <h3 className="text-xl font-bold text-slate-800">Danh sách câu hỏi gợi ý</h3>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{questions.length} câu tương ứng từ khóa</span>
            </div>
            <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 group transition-all hover:border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                      {q.keywordChar}
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Câu hỏi {idx + 1}</label>
                      <textarea 
                        value={q.text}
                        onChange={(e) => handleUpdateQuestion(q.id, 'text', e.target.value)}
                        className="w-full bg-slate-50 border-none focus:ring-0 rounded-lg p-2 text-slate-700 font-medium text-sm resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-14">
                    {(['A', 'B', 'C', 'D'] as const).map(opt => (
                      <div key={opt} className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-md ${q.correctAnswer === opt ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{opt}</span>
                        <input 
                          type="text" 
                          value={q.options[opt]}
                          onChange={(e) => handleUpdateQuestion(q.id, `opt_${opt}`, e.target.value)}
                          className="flex-1 text-sm text-slate-600 bg-transparent border-b border-slate-100 focus:border-blue-400 focus:ring-0 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full min-h-[400px] bg-white rounded-3xl border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.364-7.364l-.707-.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 11a3 3 0 110-6 3 3 0 010 6z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-slate-400">Chưa có câu hỏi nào</h4>
            <p className="text-slate-300 max-w-xs mt-2 italic text-sm">Hãy điền từ khóa và nhấn nút "Tạo câu hỏi" để AI giúp bạn soạn bài giảng thú vị!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupForm;
