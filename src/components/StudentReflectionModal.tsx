import React, { useState } from 'react';
import { GalleryRoom } from '../types';
import { Lightbulb, Send, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudentReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GalleryRoom;
  currentUser: { name: string; className: string } | null;
  onSubmitted: () => void;
}

export const StudentReflectionModal: React.FC<StudentReflectionModalProps> = ({
  isOpen,
  onClose,
  room,
  currentUser,
  onSubmitted,
}) => {
  const [mostImpressive, setMostImpressive] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
  const [favoriteProduct, setFavoriteProduct] = useState(room.products[0]?.title || '');
  const [ideaToTry, setIdeaToTry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatILearned.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/rooms/${room.id}/reflections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: currentUser?.name || 'Học sinh tham quan',
          studentClass: currentUser?.className || room.className,
          mostImpressive,
          whatILearned,
          favoriteProduct,
          ideaToTry,
        }),
      });

      if (res.ok) {
        setIsDone(true);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
        onSubmitted();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/35 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border-2 border-amber-200 rounded-3xl p-6 shadow-2xl text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isDone ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">Cảm ơn em đã chia sẻ cảm nhận!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Phản hồi của em đã được lưu vào sổ tay triển lãm của giáo viên hướng dẫn để ghi nhận tinh thần học tập.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md"
            >
              Hoàn tất
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200 shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">💡 Em học được gì sau triển lãm?</h3>
                <p className="text-xs text-slate-500">
                  Dành 1 phút để đúc kết lại những trải nghiệm bổ ích hôm nay nhé!
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                1. Điều em ấn tượng nhất trong phòng triển lãm:
              </label>
              <input
                type="text"
                placeholder="VD: Không gian 3D, sự sáng tạo của các bạn..."
                value={mostImpressive}
                onChange={(e) => setMostImpressive(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. Kiến thức hoặc kỹ năng em đã học được <span className="text-rose-500">*</span>:
              </label>
              <textarea
                required
                rows={2}
                placeholder="VD: Em hiểu được cách làm máy lọc nước, tinh thần làm việc nhóm..."
                value={whatILearned}
                onChange={(e) => setWhatILearned(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. Sản phẩm em yêu thích nhất:
              </label>
              <select
                value={favoriteProduct}
                onChange={(e) => setFavoriteProduct(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
              >
                {room.products.map((p) => (
                  <option key={p.id} value={p.title}>
                    {p.title} ({p.author})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4. Ý tưởng sáng tạo em muốn tự mình thử sức sắp tới:
              </label>
              <input
                type="text"
                placeholder="VD: Chế tạo robot tưới cây, làm đèn bàn tái chế..."
                value={ideaToTry}
                onChange={(e) => setIdeaToTry(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 rounded-xl px-3.5 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !whatILearned.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 disabled:opacity-50 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi phản hồi cho thầy cô</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
