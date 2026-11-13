import React, { useState } from 'react';
import { ExhibitionProduct, GalleryRoom, StudentAccount } from '../types';
import { Eye, Heart, MessageSquare, Award, Play, Filter, Search, Plus, Edit3, Trash2 } from 'lucide-react';
import { getFallbackProductImage } from '../utils/illustrations';
import { isProductOwnedByStudent } from '../utils/ownership';

interface ExhibitionGallery2DProps {
  room: GalleryRoom;
  userRole?: 'student' | 'teacher';
  loggedInStudent?: StudentAccount | null;
  studentIdentity?: { name: string; className: string } | null;
  onSelectProduct: (product: ExhibitionProduct) => void;
  onQuickVote: (product: ExhibitionProduct) => void;
  onAddProduct?: () => void;
  onEditProduct?: (product: ExhibitionProduct) => void;
  onDeleteProduct?: (product: ExhibitionProduct) => void;
}

export const ExhibitionGallery2D: React.FC<ExhibitionGallery2DProps> = ({
  room,
  userRole = 'student',
  loggedInStudent = null,
  studentIdentity = null,
  onSelectProduct,
  onQuickVote,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const products = room.products || [];

  // Get unique subjects
  const subjects = ['all', ...Array.from(new Set(products.map(p => p.subject).filter(Boolean)))];

  const filtered = products.filter(p => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.groupCode && p.groupCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = selectedSubject === 'all' || p.subject === selectedSubject;
    return matchSearch && matchSubject;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter toolbar */}
      <div className="flex flex-col lg:flex-row gap-3 items-center justify-between bg-white p-4 rounded-3xl border-2 border-emerald-200 shadow-md">
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, tác giả, nhóm..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-emerald-50/50 text-sm md:text-base text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 border-2 border-emerald-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 w-full lg:w-auto">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="flex items-center gap-1.5 text-sm">
              {subjects.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s as string)}
                  className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                    selectedSubject === s
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {s === 'all' ? 'Tất cả môn học' : s}
                </button>
              ))}
            </div>
          </div>

          {onAddProduct && (
            <button
              onClick={onAddProduct}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:brightness-105 text-white font-display font-extrabold text-sm shadow-md transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm của nhóm</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Product Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-emerald-300">
          <p className="text-slate-600 text-lg font-display font-bold">Không tìm thấy sản phẩm nào phù hợp</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, idx) => {
            const voteCount = product.votes?.length || 0;
            const commentCount = product.comments?.length || 0;
            const fallbackImg = getFallbackProductImage(product.id || product.title);
            const canManage =
              userRole === 'teacher' ||
              isProductOwnedByStudent(product, loggedInStudent, studentIdentity);

            return (
              <div
                key={product.id}
                className={`group bg-white hover:bg-emerald-50/20 border-2 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col shadow-md hover:shadow-xl hover:-translate-y-1 ${
                  canManage && userRole === 'student'
                    ? 'border-amber-300 hover:border-amber-500'
                    : 'border-emerald-200 hover:border-teal-400'
                }`}
              >
                {/* Image Cover */}
                <div className="relative aspect-video w-full overflow-hidden bg-emerald-50">
                  <img
                    src={product.primaryImage || fallbackImg}
                    alt={product.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = fallbackImg;
                    }}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-xl bg-white/95 text-xs font-extrabold text-emerald-700 border border-emerald-200 shadow-sm">
                      #{idx + 1}
                    </span>
                    {product.groupCode && (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-100/95 text-xs font-extrabold text-amber-900 border border-amber-300 shadow-sm">
                        {product.groupCode}
                      </span>
                    )}
                    {canManage && userRole === 'student' && (
                      <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-xs font-extrabold text-white shadow-sm">
                        ⭐ Nhóm em
                      </span>
                    )}
                  </div>

                  {product.videoUrl && (
                    <div className="absolute top-3 right-3">
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500 text-xs font-bold text-white shadow-sm">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Video</span>
                      </span>
                    </div>
                  )}

                  {/* Views & Likes stats */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-900/75 font-semibold truncate max-w-[60%]">
                      {product.subject || room.theme}
                    </span>
                    <div className="flex items-center gap-2 tabular-nums font-semibold">
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/75">
                        <Eye className="w-3.5 h-3.5 text-sky-300" />
                        {product.views || 0}
                      </span>
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-900/75 text-rose-300">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        {product.likes || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-display font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-1.5 leading-snug">
                      {product.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">
                      Tác giả: <strong className="text-slate-900">{product.author}</strong> • {product.className || room.className}
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {product.description || product.idea}
                    </p>
                  </div>

                  {/* Interactive Stats & Buttons */}
                  <div className="pt-3 border-t border-emerald-100 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-sm text-slate-600 tabular-nums">
                      <span className="flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-500" />
                        <strong className="text-slate-900">{voteCount}</strong> bình chọn
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-sky-500" />
                        <strong className="text-slate-900">{commentCount}</strong> nhận xét
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white font-bold text-sm transition-all shadow-sm active:scale-95 text-center"
                      >
                        Xem chi tiết
                      </button>
                      <button
                        onClick={() => onQuickVote(product)}
                        className="w-full py-2.5 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-sm transition-all active:scale-95 text-center flex items-center justify-center gap-1"
                      >
                        <span>⭐ Bình chọn</span>
                      </button>
                    </div>

                    {canManage && (onEditProduct || onDeleteProduct) && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {onEditProduct && (
                          <button
                            onClick={() => onEditProduct(product)}
                            className="py-2 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa SP nhóm</span>
                          </button>
                        )}
                        {onDeleteProduct && (
                          <button
                            onClick={() => onDeleteProduct(product)}
                            className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa SP nhóm</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
