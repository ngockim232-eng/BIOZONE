import React, { useState } from 'react';
import { GalleryRoom, RoomHallOfFame } from '../types';
import { Award, Trophy, Star, Sparkles, Medal, Heart, Calendar, CheckCircle, Edit3, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getFallbackProductImage } from '../utils/illustrations';

interface HallOfFameModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GalleryRoom;
  isTeacher?: boolean;
  onUpdateHallOfFame?: (updated: RoomHallOfFame) => void;
  onSelectProduct?: (productId: string) => void;
}

export const HallOfFameModal: React.FC<HallOfFameModalProps> = ({
  isOpen,
  onClose,
  room,
  isTeacher,
  onUpdateHallOfFame,
  onSelectProduct,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const hall = room.hallOfFame || {
    welcomeBanner: 'Vinh danh tinh thần say mê nghiên cứu Sinh học & KHTN',
    topTeamHonorTitle: 'CÚP VÀNG SÁNG TẠO BIOZONE',
    topTeamName: 'Nhóm Sinh Thái Xanh',
    topTeamProjectTitle: 'Mô hình hệ sinh thái tuần hoàn',
    teacherCommendation: 'Khen ngợi tư duy thiết kế mô hình sinh học chuẩn xác và kỹ năng thuyết trình xuất sắc.',
    honoredAwardDate: new Date().toISOString().split('T')[0]
  };

  const [welcomeBanner, setWelcomeBanner] = useState(hall.welcomeBanner || '');
  const [topTeamHonorTitle, setTopTeamHonorTitle] = useState(hall.topTeamHonorTitle || '');
  const [topTeamName, setTopTeamName] = useState(hall.topTeamName || '');
  const [topTeamProjectTitle, setTopTeamProjectTitle] = useState(hall.topTeamProjectTitle || '');
  const [teacherCommendation, setTeacherCommendation] = useState(hall.teacherCommendation || '');
  const [honoredAwardDate, setHonoredAwardDate] = useState(hall.honoredAwardDate || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const newHall: RoomHallOfFame = {
      welcomeBanner,
      topTeamHonorTitle,
      topTeamName,
      topTeamProjectTitle,
      teacherCommendation,
      honoredAwardDate
    };

    try {
      await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hallOfFame: newHall })
      });
      if (onUpdateHallOfFame) onUpdateHallOfFame(newHall);
      setIsEditing(false);
      handleCelebrate();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Top 3 products in votes
  const topProducts = [...(room.products || [])]
    .sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0))
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/35 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-2xl flex flex-col text-slate-800 overflow-hidden">
        {/* Header with laurels */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-emerald-400 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-amber-200/60">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600">
                  GÓC VINH DANH BIOZONE
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                  {room.code}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {room.title} • {room.schoolName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isTeacher && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 border border-amber-200 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Chỉnh sửa vinh danh</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 py-5 space-y-6">
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <h4 className="text-xs font-extrabold text-amber-700 uppercase tracking-wider">
                  Cài đặt thông tin bảng vinh danh
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khẩu hiệu / Lời chào mừng vinh danh:
                  </label>
                  <input
                    type="text"
                    value={welcomeBanner}
                    onChange={(e) => setWelcomeBanner(e.target.value)}
                    className="w-full bg-white text-xs text-slate-800 rounded-xl px-3 py-2 border border-emerald-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Danh hiệu vinh danh cao nhất:
                    </label>
                    <input
                      type="text"
                      value={topTeamHonorTitle}
                      onChange={(e) => setTopTeamHonorTitle(e.target.value)}
                      className="w-full bg-white text-xs text-slate-800 rounded-xl px-3 py-2 border border-emerald-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên nhóm / Tác giả được vinh danh:
                    </label>
                    <input
                      type="text"
                      value={topTeamName}
                      onChange={(e) => setTopTeamName(e.target.value)}
                      className="w-full bg-white text-xs text-slate-800 rounded-xl px-3 py-2 border border-emerald-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên sản phẩm xuất sắc:
                    </label>
                    <input
                      type="text"
                      value={topTeamProjectTitle}
                      onChange={(e) => setTopTeamProjectTitle(e.target.value)}
                      className="w-full bg-white text-xs text-slate-800 rounded-xl px-3 py-2 border border-emerald-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ngày công bố giải thưởng:
                    </label>
                    <input
                      type="date"
                      value={honoredAwardDate}
                      onChange={(e) => setHonoredAwardDate(e.target.value)}
                      className="w-full bg-white text-xs text-slate-800 rounded-xl px-3 py-2 border border-emerald-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lời nhận xét & biểu dương từ giáo viên:
                  </label>
                  <textarea
                    rows={3}
                    value={teacherCommendation}
                    onChange={(e) => setTeacherCommendation(e.target.value)}
                    className="w-full bg-white text-xs text-slate-800 rounded-xl p-3 border border-emerald-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu bảng vinh danh'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Grand Banner */}
              <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-amber-50 via-emerald-50 to-sky-50 border-2 border-amber-300 text-center space-y-3 shadow-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-amber-700 border border-amber-300 text-xs font-extrabold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{hall.welcomeBanner || 'Vinh danh sáng tạo sinh học'}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-amber-600">
                    {hall.topTeamHonorTitle || 'CÚP VÀNG BIOZONE'}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                    {hall.topTeamName || 'Nhóm Sinh Thái Xanh'}
                  </h3>
                  <p className="text-sm font-bold text-emerald-700">
                    Dự án: "{hall.topTeamProjectTitle || 'Mô hình hệ sinh thái tuần hoàn'}"
                  </p>
                </div>

                {hall.teacherCommendation && (
                  <div className="p-3.5 rounded-2xl bg-white/85 border border-emerald-200 max-w-xl mx-auto text-xs text-slate-700 italic leading-relaxed shadow-sm">
                    “{hall.teacherCommendation}”
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-1 text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Ngày trao: {hall.honoredAwardDate || '11/2026'}</span>
                  </span>
                  <span>•</span>
                  <span>GV hướng dẫn: {room.teacherName}</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleCelebrate}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95"
                  >
                    🎉 Bắn pháo hoa chúc mừng
                  </button>
                </div>
              </div>

              {/* Podium of Top 3 Exhibits */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <Medal className="w-4 h-4 text-amber-500" />
                  <span>Bục danh dự – Top 3 sản phẩm được bình chọn nhiều nhất</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {topProducts.map((p, idx) => {
                    const medals = ['🥇 HẠNG NHẤT', '🥈 HẠNG NHÌ', '🥉 HẠNG BA'];
                    const colors = [
                      'bg-amber-50 border-amber-300 text-amber-800',
                      'bg-slate-50 border-slate-300 text-slate-700',
                      'bg-orange-50 border-orange-300 text-orange-800'
                    ];

                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (onSelectProduct) {
                            onClose();
                            onSelectProduct(p.id);
                          }
                        }}
                        className={`p-4 rounded-2xl ${colors[idx] || colors[2]} border-2 cursor-pointer hover:scale-[1.02] hover:shadow-md transition-all flex flex-col justify-between`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-extrabold">{medals[idx]}</span>
                            <span className="text-xs font-bold bg-white/80 px-2 py-0.5 rounded-lg border border-black/10">
                              {p.votes?.length || 0} vote
                            </span>
                          </div>

                          <img
                            src={p.primaryImage || getFallbackProductImage(p.id || p.title)}
                            alt={p.title}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = getFallbackProductImage(p.id || p.title);
                            }}
                            className="w-full h-24 object-cover rounded-xl border border-slate-200 mb-2 bg-white"
                          />

                          <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</h5>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5">
                            Tác giả: {p.author}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-black/10 mt-2 flex items-center justify-between text-[11px]">
                          <span className="text-emerald-700 font-bold">{p.groupCode || 'BIO'}</span>
                          <span className="text-slate-600 font-semibold">Xem tác phẩm →</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
