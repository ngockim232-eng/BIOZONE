import React, { useState, useEffect } from 'react';
import { GalleryRoom, SpaceStyle, TeacherProfile } from '../types';
import { THEME_OPTIONS, SPACE_STYLES } from '../utils/constants';
import { Sparkles, Plus, Edit3, Wand2, X } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newRoom: GalleryRoom) => void;
  roomToEdit?: Partial<GalleryRoom> | null;
  onUpdated?: (updatedRoom: GalleryRoom) => void;
  teacherProfile?: TeacherProfile;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  roomToEdit = null,
  onUpdated,
  teacherProfile,
}) => {
  const isEditing = Boolean(roomToEdit && roomToEdit.id);

  const [title, setTitle] = useState('BIOZONE- KHÔNG GIAN SÁNG TẠO SINH HỌC');
  const [code, setCode] = useState('BIO-7A1');
  const [theme, setTheme] = useState(THEME_OPTIONS[0].name);
  const [customTheme, setCustomTheme] = useState('');
  const [description, setDescription] = useState('Không gian triển lãm số 3D dành riêng cho các dự án Sinh học & KHTN THCS.');
  const [teacherName, setTeacherName] = useState(teacherProfile?.name || 'Cô Trần Thị Kim Ngọc');
  const [schoolName, setSchoolName] = useState(teacherProfile?.schoolName || 'Trường PTDTBT TH&THCS Lý Tự Trọng');
  const [className, setClassName] = useState('7/1');
  const [spaceStyle, setSpaceStyle] = useState<SpaceStyle>('eco');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [maxVotesPerStudent, setMaxVotesPerStudent] = useState(3);
  const [privacy, setPrivacy] = useState<'public' | 'code_only' | 'private'>('public');

  // AI assistant loading
  const [isGeneratingAiIntro, setIsGeneratingAiIntro] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync form fields whenever modal opens or roomToEdit changes
  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);

    if (roomToEdit && roomToEdit.id) {
      setTitle(roomToEdit.title || '');
      setCode(roomToEdit.code || '');
      const matchedTheme = THEME_OPTIONS.find((t) => t.name === roomToEdit.theme);
      if (matchedTheme) {
        setTheme(matchedTheme.name);
        setCustomTheme('');
      } else {
        const customOpt = THEME_OPTIONS.find((t) => t.name.includes('CHỦ ĐỀ TỰ CHỌN')) || THEME_OPTIONS[THEME_OPTIONS.length - 1];
        setTheme(customOpt.name);
        setCustomTheme(roomToEdit.theme || '');
      }
      setDescription(roomToEdit.description || '');
      setTeacherName(roomToEdit.teacherName || teacherProfile?.name || 'Cô Trần Thị Kim Ngọc');
      setSchoolName(roomToEdit.schoolName || teacherProfile?.schoolName || 'Trường PTDTBT TH&THCS Lý Tự Trọng');
      setClassName(roomToEdit.className || '7/1');
      setSpaceStyle(roomToEdit.spaceStyle || 'eco');
      setStartDate(roomToEdit.startDate || new Date().toISOString().split('T')[0]);
      setEndDate(roomToEdit.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
      setMaxVotesPerStudent(roomToEdit.maxVotesPerStudent || 3);
      setPrivacy(roomToEdit.privacy || 'public');
    } else {
      setTitle('BIOZONE- KHÔNG GIAN SÁNG TẠO SINH HỌC');
      setCode('BIO-' + Math.random().toString(36).substring(2, 6).toUpperCase());
      setTheme(THEME_OPTIONS[0].name);
      setCustomTheme('');
      setDescription('Không gian triển lãm số 3D dành riêng cho các dự án Sinh học & KHTN THCS.');
      setTeacherName(teacherProfile?.name || 'Cô Trần Thị Kim Ngọc');
      setSchoolName(teacherProfile?.schoolName || 'Trường PTDTBT TH&THCS Lý Tự Trọng');
      setClassName('7/1');
      setSpaceStyle('eco');
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
      setMaxVotesPerStudent(3);
      setPrivacy('public');
    }
  }, [isOpen, roomToEdit, teacherProfile]);

  if (!isOpen) return null;

  const generateRandomCode = () => {
    const prefixes = ['BIO', 'KHTN', 'GENE', 'CELL', 'ECO'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const classTag = className.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || '7A1';
    const num = Math.floor(Math.random() * 89) + 10;
    setCode(`${randomPrefix}-${classTag}-${num}`);
  };

  const handleGenerateAiIntro = async () => {
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên phòng trước khi nhờ AI viết lời giới thiệu');
      return;
    }

    setIsGeneratingAiIntro(true);
    setErrorMsg(null);
    try {
      const activeTheme = theme.includes('CHỦ ĐỀ TỰ CHỌN') ? customTheme || 'Sáng tạo học tập' : theme;
      const res = await fetch('/api/ai/generate-intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          theme: activeTheme,
          className,
          teacherName,
          schoolName,
        }),
      });

      const data = await res.json();
      if (data.intro) {
        setDescription(data.intro);
      }
    } catch {
      setErrorMsg('Lỗi kết nối AI');
    } finally {
      setIsGeneratingAiIntro(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên phòng');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const activeTheme = theme.includes('CHỦ ĐỀ TỰ CHỌN') ? customTheme || 'Chủ đề tự do' : theme;

    try {
      const url = isEditing && roomToEdit?.id ? `/api/rooms/${roomToEdit.id}` : '/api/rooms';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          code: code.trim() || undefined,
          theme: activeTheme,
          description,
          teacherName: teacherName.trim(),
          teacherEmail: teacherProfile?.email || 'ngockim232@gmail.com',
          schoolName: schoolName.trim(),
          className: className.trim(),
          spaceStyle,
          startDate,
          endDate,
          privacy,
          maxVotesPerStudent,
          showLeaderboard: roomToEdit?.showLeaderboard ?? true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || (isEditing ? 'Lỗi cập nhật phòng' : 'Lỗi tạo phòng'));
      } else {
        if (isEditing && onUpdated) {
          onUpdated(data);
        } else {
          onCreated(data);
        }
        onClose();
      }
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white border-2 border-emerald-200 rounded-3xl shadow-2xl flex flex-col text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
              {isEditing ? <Edit3 className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {isEditing ? 'Chỉnh sửa Phòng Trưng Bày' : 'Tạo Phòng Trưng Bày Mới'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Cập nhật tên phòng, mã phòng, chủ đề và phong cách trang trí 3D riêng'
                  : 'Thiết lập triển lãm 3D cho các sản phẩm của học sinh'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 md:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Room Name & Room Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tên phòng triển lãm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Triển lãm Sản phẩm STEM - Khối 7"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 text-sm text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Mã phòng</label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5"
                >
                  <Sparkles className="w-3 h-3" /> Tự sinh
                </button>
              </div>
              <input
                type="text"
                placeholder="VD: BIO-7A1"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 text-sm text-slate-900 font-mono font-bold tracking-wider placeholder-slate-400 rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Theme Selection (Section IV) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Chọn chủ đề triển lãm:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {THEME_OPTIONS.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTheme(t.name)}
                  className={`p-2.5 rounded-xl border-2 text-left text-xs font-medium transition-all ${
                    theme === t.name
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/40'
                  }`}
                >
                  <span className="block text-base mb-1">{t.icon}</span>
                  <span className="font-bold block truncate">{t.name.split(' ')[1] || t.name}</span>
                </button>
              ))}
            </div>

            {theme.includes('CHỦ ĐỀ TỰ CHỌN') && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Nhập tên chủ đề tự chọn..."
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  className="w-full bg-slate-50 text-sm text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2 border border-slate-200"
                />
              </div>
            )}
          </div>

          {/* Space Style Selection (Section V) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Chọn phong cách không gian 3D (mỗi phong cách có trang trí 3D riêng):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {Object.values(SPACE_STYLES).map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSpaceStyle(s.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all ${
                    spaceStyle === s.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-lg shrink-0">{s.icon}</span>
                      <span className="text-xs font-extrabold text-slate-900 truncate">{s.badge}</span>
                    </div>
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                      style={{ backgroundColor: s.accentHex }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{s.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Description & AI Generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Lời giới thiệu & Mô tả phòng</label>
              <button
                type="button"
                onClick={handleGenerateAiIntro}
                disabled={isGeneratingAiIntro}
                className="text-xs text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1.5 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isGeneratingAiIntro ? 'AI đang soạn...' : 'AI viết lời giới thiệu'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lời chào mừng học sinh và phụ huynh đến với phòng triển lãm..."
              className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 rounded-xl p-3 border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Teacher, School, Class */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giáo viên phụ trách</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trường học</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Lớp</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
              />
            </div>
          </div>

          {/* Date range & voting rule */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số lượt bình chọn/học sinh</label>
              <select
                value={maxVotesPerStudent}
                onChange={(e) => setMaxVotesPerStudent(Number(e.target.value))}
                className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
              >
                <option value={1}>1 sản phẩm</option>
                <option value={2}>2 sản phẩm</option>
                <option value={3}>3 sản phẩm (Khuyên dùng)</option>
                <option value={5}>5 sản phẩm</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-105 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              {isSubmitting
                ? isEditing
                  ? 'Đang lưu...'
                  : 'Đang tạo phòng...'
                : isEditing
                ? 'Lưu thay đổi phòng'
                : 'Hoàn tất & Mở phòng 3D'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
