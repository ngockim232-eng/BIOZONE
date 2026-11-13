import React from 'react';
import { GalleryRoom } from '../types';
import { Trophy, Award, Medal, Heart, Sparkles, X, Star } from 'lucide-react';
import { getFallbackProductImage } from '../utils/illustrations';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GalleryRoom;
  onSelectProduct: (productId: string) => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  room,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  const products = [...(room.products || [])];

  // Rank by total votes
  const sorted = products.sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0));

  // Find award winners
  // 1. Ấn tượng nhất (Most 'impressive' votes)
  const impressiveWinner = [...products].sort(
    (a, b) =>
      (b.votes?.filter((v) => v.voteType === 'impressive').length || 0) -
      (a.votes?.filter((v) => v.voteType === 'impressive').length || 0)
  )[0];

  // 2. Sáng tạo nhất (Most 'creative' votes)
  const creativeWinner = [...products].sort(
    (a, b) =>
      (b.votes?.filter((v) => v.voteType === 'creative').length || 0) -
      (a.votes?.filter((v) => v.voteType === 'creative').length || 0)
  )[0];

  // 3. Ý tưởng độc đáo (Most 'good_idea' votes)
  const goodIdeaWinner = [...products].sort(
    (a, b) =>
      (b.votes?.filter((v) => v.voteType === 'good_idea').length || 0) -
      (a.votes?.filter((v) => v.voteType === 'good_idea').length || 0)
  )[0];

  // 4. Được yêu thích nhất (Most 'favorite' votes or likes)
  const favoriteWinner = [...products].sort(
    (a, b) => (b.likes || 0) + (b.votes?.filter((v) => v.voteType === 'favorite').length || 0) -
      ((a.likes || 0) + (a.votes?.filter((v) => v.voteType === 'favorite').length || 0))
  )[0];

  const maxVotes = Math.max(1, sorted[0]?.votes?.length || 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/35 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-2xl flex flex-col text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center border border-amber-200">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-gradient-pop">🏆 BẢNG XẾP HẠNG TRIỂN LÃM</span>
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                {room.title} • {room.className}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 py-5 space-y-6">
          {/* Special Category Awards Banner */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Các danh hiệu vinh danh chuyên đề</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {impressiveWinner && (
                <div
                  onClick={() => {
                    onClose();
                    onSelectProduct(impressiveWinner.id);
                  }}
                  className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer hover:border-amber-400 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <span className="text-xs font-extrabold text-amber-700 flex items-center gap-1 mb-1">
                    🥇 Ấn tượng nhất
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{impressiveWinner.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 truncate">{impressiveWinner.author}</p>
                </div>
              )}

              {creativeWinner && (
                <div
                  onClick={() => {
                    onClose();
                    onSelectProduct(creativeWinner.id);
                  }}
                  className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 cursor-pointer hover:border-sky-400 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <span className="text-xs font-extrabold text-sky-700 flex items-center gap-1 mb-1">
                    🥈 Sáng tạo nhất
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{creativeWinner.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 truncate">{creativeWinner.author}</p>
                </div>
              )}

              {goodIdeaWinner && (
                <div
                  onClick={() => {
                    onClose();
                    onSelectProduct(goodIdeaWinner.id);
                  }}
                  className="p-3.5 rounded-2xl bg-yellow-50 border border-yellow-200 cursor-pointer hover:border-yellow-400 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <span className="text-xs font-extrabold text-yellow-700 flex items-center gap-1 mb-1">
                    💡 Ý tưởng độc đáo
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{goodIdeaWinner.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 truncate">{goodIdeaWinner.author}</p>
                </div>
              )}

              {favoriteWinner && (
                <div
                  onClick={() => {
                    onClose();
                    onSelectProduct(favoriteWinner.id);
                  }}
                  className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 cursor-pointer hover:border-rose-400 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <span className="text-xs font-extrabold text-rose-700 flex items-center gap-1 mb-1">
                    ❤️ Được yêu thích nhất
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{favoriteWinner.title}</h4>
                  <p className="text-[11px] text-slate-600 mt-1 truncate">{favoriteWinner.author}</p>
                </div>
              )}
            </div>
          </div>

          {/* Full Table Leaderboard with Visual Bars */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-3">
              Bảng xếp hạng tổng lượt bình chọn
            </h3>

            <div className="space-y-3">
              {sorted.map((prod, rank) => {
                const votesCount = prod.votes?.length || 0;
                const percent = Math.max(5, Math.round((votesCount / maxVotes) * 100));

                let badgeColor = 'bg-slate-200 text-slate-700';
                let rankIcon = `#${rank + 1}`;
                if (rank === 0) {
                  badgeColor = 'bg-amber-100 text-amber-800 border border-amber-300';
                  rankIcon = '🥇 1';
                } else if (rank === 1) {
                  badgeColor = 'bg-sky-100 text-sky-800 border border-sky-300';
                  rankIcon = '🥈 2';
                } else if (rank === 2) {
                  badgeColor = 'bg-orange-100 text-orange-800 border border-orange-300';
                  rankIcon = '🥉 3';
                }

                return (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onClose();
                      onSelectProduct(prod.id);
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold ${badgeColor} shrink-0`}>
                          {rankIcon}
                        </span>
                        <img
                          src={prod.primaryImage || getFallbackProductImage(prod.id || prod.title)}
                          alt={prod.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = getFallbackProductImage(prod.id || prod.title);
                          }}
                          className="w-10 h-10 object-cover rounded-xl border border-slate-200 shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs md:text-sm font-bold text-slate-900 truncate">{prod.title}</h4>
                          <p className="text-[11px] text-slate-600 truncate">
                            {prod.author} ({prod.className || room.className})
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs md:text-sm font-extrabold text-amber-600">
                          {votesCount} <span className="text-[10px] text-slate-500 font-semibold">bình chọn</span>
                        </div>
                        <div className="text-[11px] text-rose-500 font-bold flex items-center justify-end gap-1">
                          <Heart className="w-3 h-3 fill-current" />
                          <span>{prod.likes || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          rank === 0
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                            : rank === 1
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-sky-500 to-emerald-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
