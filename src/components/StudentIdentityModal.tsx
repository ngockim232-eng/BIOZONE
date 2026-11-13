import React, { useState } from 'react';
import { FUN_NICKNAMES } from '../utils/constants';
import { UserCheck, Sparkles, X, ShieldCheck } from 'lucide-react';

interface StudentIdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (identity: { name: string; className: string }) => void;
  defaultClass?: string;
}

export const StudentIdentityModal: React.FC<StudentIdentityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultClass = '',
}) => {
  const [name, setName] = useState('');
  const [className, setClassName] = useState(defaultClass || '7/1');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      className: className.trim(),
    });
    onClose();
  };

  const handlePickRandomNickname = () => {
    const random = FUN_NICKNAMES[Math.floor(Math.random() * FUN_NICKNAMES.length)];
    const num = Math.floor(Math.random() * 89) + 10;
    setName(`${random} ${num}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/35 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-2xl text-slate-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 border border-emerald-200">
            <UserCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">Xác nhận thông tin tham quan</h3>
          <p className="text-xs text-slate-500 mt-1">
            Không cần tài khoản hay mật khẩu. Tên hiển thị giúp nhóm tác giả biết bạn đã gửi lời khen và bình chọn!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Tên hiển thị / Biệt danh của em</label>
              <button
                type="button"
                onClick={handlePickRandomNickname}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Gợi ý biệt danh
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="VD: Minh Khang, Tuấn Kiệt, Họa sĩ nhí..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 text-sm text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Lớp của em</label>
            <input
              type="text"
              placeholder="VD: 7/1, 7A, 8B..."
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full bg-slate-50 text-sm text-slate-800 placeholder-slate-400 rounded-xl px-4 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-medium text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ứng dụng cam kết bảo mật quyền riêng tư học sinh THCS.</span>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-200/70 active:scale-95"
          >
            Bắt đầu tham quan & Bình chọn
          </button>
        </form>
      </div>
    </div>
  );
};
