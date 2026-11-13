import React, { useState } from 'react';
import { StudentAccount } from '../types';
import { UserCheck, Key, LogIn, Sparkles, X, ShieldCheck, User } from 'lucide-react';
import { BIOZONE_ILLUSTRATIONS } from '../utils/illustrations';

interface StudentAccountLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  onLoginSuccess: (account: StudentAccount) => void;
}

export const StudentAccountLoginModal: React.FC<StudentAccountLoginModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập tài khoản và mật khẩu được thầy cô cấp');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/student-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          roomCode
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Đăng nhập không thành công');
      } else {
        onLoginSuccess(data);
        onClose();
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill demo accounts
  const handleQuickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
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
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-3 border-2 border-emerald-300 shadow-md bg-emerald-50">
            <img
              src={BIOZONE_ILLUSTRATIONS.mascot}
              alt="Biozone Mascot"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-xl md:text-2xl font-display font-extrabold text-slate-900">Đăng nhập tài khoản Học sinh</h3>
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            Đăng nhập bằng tài khoản do giáo viên cấp để <strong className="text-emerald-700">thêm, chỉnh sửa, xóa sản phẩm của nhóm mình</strong> và bình chọn.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-sm font-semibold text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Tên đăng nhập học sinh:
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="VD: hs01, hs03..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 text-base text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 border-2 border-emerald-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              Mật khẩu:
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="VD: 123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 text-base text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 border-2 border-emerald-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Quick account suggestions */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-cyan-50 border-2 border-emerald-200 space-y-2">
            <span className="text-xs font-extrabold text-emerald-800 block">
              Chọn nhanh tài khoản mẫu sẵn có trong phòng:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('hs01', '123')}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-300 font-mono transition-colors shadow-sm"
              >
                hs01 (Minh Khang)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('hs02', '123')}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-300 font-mono transition-colors shadow-sm"
              >
                hs02 (Thùy Dung)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('hs03', '123')}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-100 text-sky-700 font-bold text-xs border border-sky-300 font-mono transition-colors shadow-sm"
              >
                hs03 (Nhóm Tế Bào Sống)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('hs04', '123')}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-300 font-mono transition-colors shadow-sm"
              >
                hs04 (Nhóm Sinh Thái Xanh)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-105 text-white font-display font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-300/60 transition-all active:scale-95"
          >
            <LogIn className="w-5 h-5" />
            <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập vào phòng triển lãm'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
