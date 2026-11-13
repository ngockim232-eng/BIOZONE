import React, { useState } from 'react';
import { GalleryRoom, ExhibitionProduct, StudentAccount } from '../types';
import { Users, Search, Eye, Award, MessageSquare, Plus, Edit3, Trash2, LogIn, X } from 'lucide-react';
import { getFallbackProductImage } from '../utils/illustrations';
import { isProductOwnedByStudent } from '../utils/ownership';

interface MyGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GalleryRoom;
  loggedInStudent?: StudentAccount | null;
  studentIdentity?: { name: string; className: string } | null;
  onSelectProduct: (product: ExhibitionProduct) => void;
  onAddProduct?: () => void;
  onEditProduct?: (product: ExhibitionProduct) => void;
  onDeleteProduct?: (product: ExhibitionProduct) => void;
  onOpenLogin?: () => void;
}

export const MyGroupModal: React.FC<MyGroupModalProps> = ({
  isOpen,
  onClose,
  room,
  loggedInStudent = null,
  studentIdentity = null,
  onSelectProduct,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onOpenLogin,
}) => {
  const [groupQuery, setGroupQuery] = useState('');

  if (!isOpen) return null;

  const myOwnProducts = (room.products || []).filter((p) =>
    isProductOwnedByStudent(p, loggedInStudent, studentIdentity)
  );

  const matchedProducts = (room.products || []).filter((p) => {
    if (!groupQuery.trim()) return false;
    const q = groupQuery.toLowerCase().trim();
    return (
      (p.groupCode && p.groupCode.toLowerCase().includes(q)) ||
      p.author.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q)
    );
  });

  const renderProductRow = (p: ExhibitionProduct, allowManage: boolean) => (
    <div
      key={p.id}
      className="p-4 rounded-2xl bg-gradient-to-br from-white to-emerald-50/60 border-2 border-emerald-200 space-y-3 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <img
          src={p.primaryImage || getFallbackProductImage(p.id || p.title)}
          alt={p.title}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = getFallbackProductImage(p.id || p.title);
          }}
          className="w-16 h-16 object-cover rounded-xl border-2 border-emerald-200 shrink-0 bg-white"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            {p.groupCode && (
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 text-xs font-extrabold font-mono">
                {p.groupCode}
              </span>
            )}
            <span className="text-xs text-slate-600 font-semibold">{p.className || room.className}</span>
          </div>
          <h4 className="text-base font-display font-extrabold text-slate-900 truncate">{p.title}</h4>
          <p className="text-xs text-slate-600 truncate font-medium">Tác giả: {p.author}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center py-2.5 bg-white rounded-xl border border-emerald-100 text-xs">
        <div>
          <span className="text-slate-500 flex items-center justify-center gap-1 mb-0.5 font-semibold">
            <Eye className="w-3.5 h-3.5 text-sky-500" /> Lượt xem
          </span>
          <strong className="text-slate-900 text-base font-display">{p.views || 0}</strong>
        </div>
        <div>
          <span className="text-amber-700 flex items-center justify-center gap-1 mb-0.5 font-semibold">
            <Award className="w-3.5 h-3.5 text-amber-500" /> Bình chọn
          </span>
          <strong className="text-amber-600 text-base font-display">{p.votes?.length || 0}</strong>
        </div>
        <div>
          <span className="text-emerald-700 flex items-center justify-center gap-1 mb-0.5 font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> Nhận xét
          </span>
          <strong className="text-emerald-600 text-base font-display">{p.comments?.length || 0}</strong>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            onClose();
            onSelectProduct(p);
          }}
          className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white font-bold text-sm transition-all shadow-sm"
        >
          Xem chi tiết
        </button>
        {allowManage && onEditProduct && (
          <button
            onClick={() => {
              onClose();
              onEditProduct(p);
            }}
            className="py-2.5 px-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 font-bold text-sm flex items-center gap-1.5 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Sửa</span>
          </button>
        )}
        {allowManage && onDeleteProduct && (
          <button
            onClick={() => {
              onClose();
              onDeleteProduct(p);
            }}
            className="py-2.5 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold text-sm flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/35 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white border-2 border-emerald-300 rounded-3xl p-6 shadow-2xl text-slate-800 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-display font-extrabold text-slate-900">
              Sản phẩm của nhóm tôi
            </h3>
            <p className="text-sm text-slate-600">
              Thêm mới, chỉnh sửa, xóa sản phẩm của nhóm mình hoặc tra cứu theo mã nhóm
            </p>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 space-y-5 pr-1">
          {/* Logged-in student own group section */}
          {loggedInStudent ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-cyan-50 to-amber-50 border-2 border-emerald-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-sm font-extrabold text-emerald-800 block">
                    ⭐ Nhóm của {loggedInStudent.name} ({loggedInStudent.className})
                  </span>
                  <span className="text-xs text-slate-600">
                    Tìm thấy {myOwnProducts.length} sản phẩm thuộc nhóm của em
                  </span>
                </div>
                {onAddProduct && (
                  <button
                    onClick={() => {
                      onClose();
                      onAddProduct();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm SP mới</span>
                  </button>
                )}
              </div>

              {myOwnProducts.length === 0 ? (
                <p className="text-sm text-slate-600 bg-white/80 p-3 rounded-xl border border-emerald-100">
                  Nhóm em chưa đăng sản phẩm nào trong phòng này. Nhấn <strong>“Thêm SP mới”</strong> để đưa dự án lên trưng bày nhé!
                </p>
              ) : (
                <div className="space-y-3">
                  {myOwnProducts.map((p) => renderProductRow(p, true))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-emerald-50 border-2 border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm text-slate-700">
                <strong className="text-sky-800 block">Đăng nhập tài khoản học sinh</strong>
                <span>Để thêm, chỉnh sửa hoặc xóa sản phẩm của nhóm mình.</span>
              </div>
              {onOpenLogin && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenLogin();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shrink-0"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập ngay</span>
                </button>
              )}
            </div>
          )}

          {/* Search other groups */}
          <div>
            <h4 className="text-sm font-display font-extrabold text-slate-700 mb-2">
              Tra cứu nhanh theo mã nhóm hoặc tên tác giả
            </h4>
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Nhập mã nhóm (VD: BIO-01) hoặc tên bạn..."
                value={groupQuery}
                onChange={(e) => setGroupQuery(e.target.value)}
                className="w-full bg-slate-50 text-sm text-slate-800 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 border-2 border-emerald-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick Suggestions */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Gợi ý mã nhóm:</span>
              {room.products.map((p) => {
                if (!p.groupCode) return null;
                return (
                  <button
                    key={p.id}
                    onClick={() => setGroupQuery(p.groupCode || '')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs text-emerald-700 font-bold font-mono transition-all"
                  >
                    {p.groupCode}
                  </button>
                );
              })}
            </div>

            {/* Search Results */}
            <div className="space-y-3">
              {groupQuery.trim() && matchedProducts.length === 0 ? (
                <p className="text-center py-4 text-sm text-slate-500">
                  Không tìm thấy sản phẩm nào khớp với "{groupQuery}".
                </p>
              ) : (
                matchedProducts.map((p) =>
                  renderProductRow(p, isProductOwnedByStudent(p, loggedInStudent, studentIdentity))
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
