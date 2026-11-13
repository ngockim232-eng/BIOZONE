import React, { useState, useEffect } from 'react';
import { GalleryRoom, ExhibitionProduct, StudentAccount, TeacherProfile } from '../types';
import { ProductFormModal } from './ProductFormModal';
import {
  Trophy,
  Users,
  Eye,
  Award,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Share2,
  Sparkles,
  Bot,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart2,
  Pin,
  EyeOff,
  Settings,
  Lock,
  Unlock,
  Printer,
  UserPlus,
  Key,
  Copy,
  Download,
  Mail,
  UserCheck
} from 'lucide-react';

interface TeacherDashboardProps {
  room: GalleryRoom;
  onRefreshRoom: () => void;
  onOpenShareModal: () => void;
  onOpenCreateRoomModal: () => void;
  onOpenEditRoomModal?: () => void;
  onRequestDeleteRoom?: (room: GalleryRoom) => void;
  onSwitchToStudentView: () => void;
  onOpenTeacherProfileModal: () => void;
  onOpenHallOfFameModal: () => void;
  teacherProfile?: TeacherProfile;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  room,
  onRefreshRoom,
  onOpenShareModal,
  onOpenCreateRoomModal,
  onOpenEditRoomModal,
  onRequestDeleteRoom,
  onSwitchToStudentView,
  onOpenTeacherProfileModal,
  onOpenHallOfFameModal,
  teacherProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'accounts' | 'stats' | 'comments' | 'reflections' | 'ai'>('products');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<ExhibitionProduct | null>(null);

  // Status toggle
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Student accounts state
  const [studentAccounts, setStudentAccounts] = useState<StudentAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [batchCount, setBatchCount] = useState<number>(20);
  const [batchPrefix, setBatchPrefix] = useState<string>('hs');
  const [batchPassword, setBatchPassword] = useState<string>('123');
  const [batchClassName, setBatchClassName] = useState<string>(room.className || '7/1');
  const [namesTextarea, setNamesTextarea] = useState<string>('');
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string | null>(null);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);

  // AI Assistant states
  const [aiActiveTool, setAiActiveTool] = useState<'topics' | 'summary' | 'report'>('report');
  const [aiTopicGrade, setAiTopicGrade] = useState('7');
  const [aiTopicSubject, setAiTopicSubject] = useState('Sinh học & KHTN');
  const [aiSuggestedTopics, setAiSuggestedTopics] = useState<any[]>([]);
  const [aiFeedbackSummary, setAiFeedbackSummary] = useState<any | null>(null);
  const [aiReportMarkdown, setAiReportMarkdown] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Load student accounts
  const loadAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const res = await fetch(`/api/rooms/${room.code}/student-accounts`);
      if (res.ok) {
        const data = await res.json();
        setStudentAccounts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [room.code]);

  // Calculations for stats
  const totalViews = room.products?.reduce((acc, p) => acc + (p.views || 0), 0) || 0;
  const totalVotes = room.products?.reduce((acc, p) => acc + (p.votes?.length || 0), 0) || 0;
  const allComments = room.products?.flatMap((p) =>
    (p.comments || []).map((c) => ({ ...c, productTitle: p.title }))
  ) || [];
  const totalComments = allComments.length;

  const mostViewedProduct = [...(room.products || [])].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
  const mostVotedProduct = [...(room.products || [])].sort(
    (a, b) => (b.votes?.length || 0) - (a.votes?.length || 0)
  )[0];
  const mostLovedProduct = [...(room.products || [])].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];

  // Toggle room status
  const handleToggleRoomStatus = async () => {
    setIsTogglingStatus(true);
    const newStatus = room.status === 'active' ? 'closed' : 'active';
    try {
      await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      onRefreshRoom();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Toggle leaderboard visibility
  const handleToggleLeaderboard = async () => {
    try {
      await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showLeaderboard: !room.showLeaderboard }),
      });
      onRefreshRoom();
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${title}" khỏi phòng triển lãm?`)) return;
    try {
      await fetch(`/api/rooms/${room.id}/products/${productId}`, { method: 'DELETE' });
      onRefreshRoom();
    } catch (err) {
      console.error(err);
    }
  };

  // Move product up/down
  const handleMoveProduct = async (index: number, direction: 'up' | 'down') => {
    const list = [...room.products];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    try {
      await fetch(`/api/rooms/${room.id}/reorder-products`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: list.map((p) => p.id) }),
      });
      onRefreshRoom();
    } catch (err) {
      console.error(err);
    }
  };

  // Moderate comment
  const handleCommentAction = async (commentId: string, action: string) => {
    try {
      await fetch(`/api/rooms/${room.id}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      onRefreshRoom();
    } catch (err) {
      console.error(err);
    }
  };

  // Batch create student accounts
  const handleBatchCreateAccounts = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingBatch(true);
    setBatchSuccessMsg(null);

    const namesList = namesTextarea.trim()
      ? namesTextarea.split('\n').map(n => n.trim()).filter(Boolean)
      : undefined;

    try {
      const res = await fetch(`/api/rooms/${room.code}/student-accounts/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          count: batchCount,
          prefix: batchPrefix,
          defaultPassword: batchPassword,
          className: batchClassName,
          namesList
        })
      });

      const data = await res.json();
      if (res.ok) {
        setBatchSuccessMsg(`Đã tạo thành công ${data.count} tài khoản học sinh cho phòng ${room.code}!`);
        loadAccounts();
        setNamesTextarea('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingBatch(false);
    }
  };

  // Delete student account
  const handleDeleteAccount = async (id: string, username: string) => {
    if (!window.confirm(`Xóa tài khoản học sinh "${username}"?`)) return;
    try {
      await fetch(`/api/rooms/${room.code}/student-accounts/${id}`, { method: 'DELETE' });
      loadAccounts();
    } catch (err) {
      console.error(err);
    }
  };

  // Export accounts to CSV/Text
  const handleExportAccounts = () => {
    if (studentAccounts.length === 0) return;
    const header = 'Tên đăng nhập,Mật khẩu,Họ và tên,Lớp,Mã phòng\n';
    const rows = studentAccounts
      .map(a => `${a.username},${a.password},"${a.name}",${a.className},${a.roomCode}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Danh_sach_tai_khoan_HS_${room.code}.csv`;
    link.click();
  };

  // AI Tools handlers
  const handleAiSuggestTopics = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: aiTopicGrade, subject: aiTopicSubject }),
      });
      const data = await res.json();
      if (data.topics) {
        setAiSuggestedTopics(data.topics);
      }
    } catch (err: any) {
      setAiError(err.message || 'Lỗi gọi AI');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiSummarizeFeedback = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/summarize-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comments: allComments,
          reflections: room.reflections || [],
        }),
      });
      const data = await res.json();
      setAiFeedbackSummary(data);
    } catch (err: any) {
      setAiError(err.message || 'Lỗi gọi AI');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiGenerateReport = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const topProducts = [...room.products]
        .sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0))
        .slice(0, 3)
        .map((p) => ({ title: p.title, author: p.author, votes: p.votes?.length || 0 }));

      const res = await fetch('/api/ai/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomTitle: room.title,
          teacherName: room.teacherName,
          schoolName: room.schoolName,
          totalVisitors: room.visitorCount,
          totalVotes,
          totalComments,
          topProducts,
        }),
      });
      const data = await res.json();
      if (data.reportMarkdown) {
        setAiReportMarkdown(data.reportMarkdown);
      }
    } catch (err: any) {
      setAiError(err.message || 'Lỗi gọi AI');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Form Modal */}
      {isProductModalOpen && (
        <ProductFormModal
          isOpen={isProductModalOpen}
          room={room}
          productToEdit={productToEdit}
          onClose={() => {
            setIsProductModalOpen(false);
            setProductToEdit(null);
          }}
          onSaved={() => {
            setIsProductModalOpen(false);
            setProductToEdit(null);
            onRefreshRoom();
          }}
        />
      )}

      {/* Top Banner & Room Status Controls */}
      <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                room.status === 'active'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-rose-100 text-rose-800 border-rose-200'
              }`}
            >
              {room.status === 'active' ? '● Đang mở tham quan & đưa sản phẩm' : '■ Đã đóng triển lãm'}
            </span>
            <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-mono font-bold border border-sky-200">
              MÃ PHÒNG: {room.code}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {room.schoolName} • {room.className}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>{room.title}</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>GV phụ trách: <strong className="text-emerald-700">{room.teacherName}</strong> ({room.teacherEmail || 'ngockim232@gmail.com'})</span>
            <span>•</span>
            <span className="text-slate-500">{room.theme}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Chỉnh sửa thông tin phòng */}
          {onOpenEditRoomModal && (
            <button
              onClick={onOpenEditRoomModal}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold border border-sky-200 transition-all active:scale-95"
              title="Chỉnh sửa tên phòng, mã phòng, chủ đề, phong cách 3D"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Sửa phòng</span>
            </button>
          )}

          {/* Xóa phòng trưng bày */}
          {onRequestDeleteRoom && (
            <button
              onClick={() => onRequestDeleteRoom(room)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all active:scale-95"
              title="Xóa phòng trưng bày này"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa phòng</span>
            </button>
          )}

          {/* Cài đặt thông tin giáo viên */}
          <button
            onClick={onOpenTeacherProfileModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all active:scale-95"
            title="Cài đặt thông tin giáo viên"
          >
            <Settings className="w-3.5 h-3.5 text-sky-600" />
            <span>Thông tin GV</span>
          </button>

          {/* Góc vinh danh */}
          <button
            onClick={onOpenHallOfFameModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Góc vinh danh</span>
          </button>

          <button
            onClick={onOpenShareModal}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>QR & Chia sẻ</span>
          </button>

          <button
            onClick={handleToggleRoomStatus}
            disabled={isTogglingStatus}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
              room.status === 'active'
                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {room.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{room.status === 'active' ? 'Đóng phòng' : 'Mở lại phòng'}</span>
          </button>

          <button
            onClick={onSwitchToStudentView}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white text-xs font-bold shadow-sm active:scale-95"
          >
            <span>👁️ Xem như học sinh</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards (XVII) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border-2 border-emerald-100 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Số người tham quan</span>
            <strong className="text-lg font-extrabold text-slate-900 tabular-nums">{room.visitorCount || 1}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-teal-100 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Lượt xem sản phẩm</span>
            <strong className="text-lg font-extrabold text-slate-900 tabular-nums">{totalViews}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-amber-100 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Lượt bình chọn</span>
            <strong className="text-lg font-extrabold text-amber-600 tabular-nums">{totalVotes}</strong>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-sky-100 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Tài khoản HS đã cấp</span>
            <strong className="text-lg font-extrabold text-sky-700 tabular-nums">{studentAccounts.length}</strong>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-emerald-200 gap-2 md:gap-4 overflow-x-auto pb-1 text-xs md:text-sm font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>📦 Quản lý sản phẩm ({room.products.length})</span>
        </button>

        {/* Tab Cấp tài khoản học sinh hàng loạt */}
        <button
          onClick={() => setActiveTab('accounts')}
          className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'accounts'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-600" />
          <span>Cấp tài khoản HS ({studentAccounts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'stats'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Thống kê & Xếp hạng</span>
        </button>

        <button
          onClick={() => setActiveTab('comments')}
          className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'comments'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Nhận xét học sinh ({totalComments})</span>
        </button>

        <button
          onClick={() => setActiveTab('reflections')}
          className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'reflections'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>💡 Sổ tay "Học được gì?" ({room.reflections?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 px-2 border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 text-amber-600 ${
            activeTab === 'ai' ? 'border-amber-500' : 'border-transparent hover:text-amber-700'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>🤖 AI Hỗ Trợ Biozone</span>
        </button>
      </div>

      {/* TAB 1: QUẢN LÝ SẢN PHẨM */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Danh sách sản phẩm trong phòng Biozone 3D</h3>
              <p className="text-xs text-slate-500">Học sinh đăng nhập tài khoản có thể tự đưa sản phẩm lên phòng</p>
            </div>
            <button
              onClick={() => {
                setProductToEdit(null);
                setIsProductModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm sản phẩm mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {room.products.map((p, idx) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-300 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleMoveProduct(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 rounded text-slate-400 hover:text-emerald-700 disabled:opacity-30"
                      title="Di chuyển lên trước"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-extrabold text-emerald-700">#{idx + 1}</span>
                    <button
                      onClick={() => handleMoveProduct(idx, 'down')}
                      disabled={idx === room.products.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-emerald-700 disabled:opacity-30"
                      title="Di chuyển xuống sau"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <img
                    src={p.primaryImage}
                    alt={p.title}
                    className="w-16 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {p.groupCode && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                          {p.groupCode}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">{p.subject}</span>
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900 truncate">{p.title}</h4>
                    <p className="text-xs text-slate-500 truncate">
                      {p.author} • {p.className || room.className}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                  <div className="flex items-center gap-3 text-xs text-slate-600 font-medium tabular-nums">
                    <span title="Lượt xem">{p.views || 0} xem</span>
                    <span className="text-amber-600 font-bold" title="Bình chọn">
                      {p.votes?.length || 0} vote
                    </span>
                    <span className="text-emerald-600 font-bold" title="Nhận xét">
                      {p.comments?.length || 0} cmt
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setProductToEdit(p);
                        setIsProductModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-600 border border-sky-200 transition-all"
                      title="Chỉnh sửa sản phẩm"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.title)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CẤP TÀI KHOẢN HỌC SINH HÀNG LOẠT */}
      {activeTab === 'accounts' && (
        <div className="space-y-6">
          {/* Batch Generator Form */}
          <div className="p-5 rounded-3xl bg-white border-2 border-emerald-200 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Cung cấp tài khoản học sinh hàng loạt</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Tạo tài khoản nhanh để học sinh đăng nhập vào phòng <strong>{room.code}</strong> và tự đưa sản phẩm lên trưng bày
                </p>
              </div>

              {studentAccounts.length > 0 && (
                <button
                  onClick={handleExportAccounts}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất danh sách (CSV)</span>
                </button>
              )}
            </div>

            {batchSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{batchSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleBatchCreateAccounts} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng tài khoản:</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={batchCount}
                    onChange={(e) => setBatchCount(Number(e.target.value))}
                    className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tiền tố tên đăng nhập:</label>
                  <input
                    type="text"
                    value={batchPrefix}
                    onChange={(e) => setBatchPrefix(e.target.value)}
                    placeholder="VD: hs, bio..."
                    className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mặc định:</label>
                  <input
                    type="text"
                    value={batchPassword}
                    onChange={(e) => setBatchPassword(e.target.value)}
                    placeholder="VD: 123"
                    className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lớp học sinh:</label>
                  <input
                    type="text"
                    value={batchClassName}
                    onChange={(e) => setBatchClassName(e.target.value)}
                    className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  (Tùy chọn) Dán danh sách họ tên học sinh (mỗi dòng một tên):
                </label>
                <textarea
                  rows={3}
                  value={namesTextarea}
                  onChange={(e) => setNamesTextarea(e.target.value)}
                  placeholder="Trần Minh Khang&#10;Lê Thùy Dung&#10;Nguyễn Tuấn Kiệt&#10;..."
                  className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl p-3 border border-slate-200"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCreatingBatch}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white font-bold text-xs shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isCreatingBatch ? 'Đang khởi tạo...' : '⚡ Cấp tài khoản hàng loạt ngay'}
                </button>
              </div>
            </form>
          </div>

          {/* Accounts List Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Danh sách tài khoản học sinh đã cấp ({studentAccounts.length})
              </h4>
              <span className="text-xs text-slate-500">
                Học sinh dùng tài khoản này để vào phòng và đăng tải sản phẩm
              </span>
            </div>

            {studentAccounts.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-500">
                Chưa có tài khoản nào. Giáo viên có thể dùng bảng trên để cấp hàng loạt cho lớp.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-emerald-200 bg-white shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-50 text-emerald-900">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Tên đăng nhập</th>
                      <th className="p-3">Mật khẩu</th>
                      <th className="p-3">Họ và tên học sinh</th>
                      <th className="p-3">Lớp</th>
                      <th className="p-3">Mã phòng</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {studentAccounts.map((acc, i) => (
                      <tr key={acc.id} className="hover:bg-emerald-50/40">
                        <td className="p-3 text-slate-500">{i + 1}</td>
                        <td className="p-3 font-mono font-bold text-emerald-700">{acc.username}</td>
                        <td className="p-3 font-mono text-slate-600">{acc.password}</td>
                        <td className="p-3 font-bold text-slate-900">{acc.name}</td>
                        <td className="p-3 text-slate-500">{acc.className}</td>
                        <td className="p-3 font-mono text-slate-500">{acc.roomCode}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteAccount(acc.id, acc.username)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: THỐNG KÊ CHI TIẾT (XVII) */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mostVotedProduct && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-extrabold text-amber-700 block mb-1">
                  ⭐ Sản phẩm có nhiều bình chọn nhất
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{mostVotedProduct.title}</h4>
                <p className="text-xs text-slate-600 mt-1">
                  {mostVotedProduct.author} ({mostVotedProduct.votes?.length || 0} bình chọn)
                </p>
              </div>
            )}

            {mostViewedProduct && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200">
                <span className="text-xs font-extrabold text-sky-700 block mb-1">
                  👁️ Sản phẩm được xem nhiều nhất
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{mostViewedProduct.title}</h4>
                <p className="text-xs text-slate-600 mt-1">
                  {mostViewedProduct.author} ({mostViewedProduct.views || 0} lượt xem)
                </p>
              </div>
            )}

            {mostLovedProduct && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-xs font-extrabold text-rose-700 block mb-1">
                  ❤️ Sản phẩm được yêu thích nhất
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 line-clamp-1">{mostLovedProduct.title}</h4>
                <p className="text-xs text-slate-600 mt-1">
                  {mostLovedProduct.author} ({mostLovedProduct.likes || 0} lượt thích)
                </p>
              </div>
            )}
          </div>

          {/* Leaderboard Settings */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-sm">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Hiển thị Bảng xếp hạng cho học sinh</h4>
              <p className="text-xs text-slate-500">
                {room.showLeaderboard
                  ? 'Học sinh có thể xem bảng xếp hạng trong lúc tham quan'
                  : 'Bảng xếp hạng đang ẩn, chỉ giáo viên mới xem được'}
              </p>
            </div>
            <button
              onClick={handleToggleLeaderboard}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                room.showLeaderboard
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {room.showLeaderboard ? 'Đang Bật' : 'Đang Tắt'}
            </button>
          </div>

          {/* Voting Breakdown Chart Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Chi tiết bình chọn theo từng sản phẩm
            </h4>
            {room.products.map((p) => {
              const impressiveCount = (p.votes || []).filter((v) => v.voteType === 'impressive').length;
              const creativeCount = (p.votes || []).filter((v) => v.voteType === 'creative').length;
              const goodIdeaCount = (p.votes || []).filter((v) => v.voteType === 'good_idea').length;
              const favoriteCount = (p.votes || []).filter((v) => v.voteType === 'favorite').length;

              return (
                <div key={p.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-900">{p.title}</span>
                    <span className="text-amber-600 font-extrabold">{p.votes?.length || 0} phiếu</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px] font-semibold">
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                      ⭐ Ấn tượng: {impressiveCount}
                    </span>
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                      👍 Sáng tạo: {creativeCount}
                    </span>
                    <span className="p-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
                      💡 Ý tưởng: {goodIdeaCount}
                    </span>
                    <span className="p-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                      ❤️ Yêu thích: {favoriteCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: QUẢN LÝ NHẬN XÉT (XV) */}
      {activeTab === 'comments' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Tất cả nhận xét của học sinh ({allComments.length})
            </h4>
            <span className="text-xs text-slate-500">Giáo viên có quyền ghim, ẩn hoặc xóa</span>
          </div>

          {allComments.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-500">Chưa có nhận xét nào từ học sinh.</p>
          ) : (
            allComments.map((c) => (
              <div
                key={c.id}
                className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 shadow-sm ${
                  c.isPinned
                    ? 'bg-amber-50 border-amber-300'
                    : c.isHidden
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg">{c.reaction}</span>
                    <span className="text-xs font-extrabold text-slate-900">{c.studentName}</span>
                    <span className="text-[11px] text-slate-500">({c.studentClass || 'Học sinh'})</span>
                    <span className="text-[11px] text-emerald-700 font-bold">• SP: {c.productTitle}</span>
                    {c.isPinned && (
                      <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                        Đã ghim
                      </span>
                    )}
                    {c.isHidden && (
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                        Đang ẩn
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 pl-7">{c.comment}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCommentAction(c.id, c.isPinned ? 'unpin' : 'pin')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 bg-slate-100"
                    title={c.isPinned ? 'Bỏ ghim' : 'Ghim nổi bật'}
                  >
                    <Pin className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCommentAction(c.id, c.isHidden ? 'unhide' : 'hide')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 bg-slate-100"
                    title={c.isHidden ? 'Bỏ ẩn' : 'Ẩn nhận xét'}
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCommentAction(c.id, 'delete')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 bg-slate-100"
                    title="Xóa nhận xét"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: SỔ TAY "EM HỌC ĐƯỢC GÌ?" (XXIV) */}
      {activeTab === 'reflections' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Phản hồi cuối buổi tham quan của học sinh</h4>
              <p className="text-xs text-slate-500">Đánh giá quá trình và mức độ tiếp thu kiến thức sinh học</p>
            </div>
            <span className="text-xs text-emerald-700 font-extrabold">{room.reflections?.length || 0} phản hồi</span>
          </div>

          {!room.reflections || room.reflections.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-500">Chưa có phản hồi nào được gửi về.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {room.reflections.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">{r.studentName} ({r.studentClass})</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div>
                      <strong className="text-amber-700">Ấn tượng nhất:</strong>{' '}
                      <span className="text-slate-700">{r.mostImpressive}</span>
                    </div>
                    <div>
                      <strong className="text-emerald-700">Đã học được:</strong>{' '}
                      <span className="text-slate-700">{r.whatILearned}</span>
                    </div>
                    {r.favoriteProduct && (
                      <div>
                        <strong className="text-sky-700">SP yêu thích:</strong>{' '}
                        <span className="text-slate-700">{r.favoriteProduct}</span>
                      </div>
                    )}
                    {r.ideaToTry && (
                      <div>
                        <strong className="text-violet-700">Ý tưởng muốn thử:</strong>{' '}
                        <span className="text-slate-700">{r.ideaToTry}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: AI HỖ TRỢ TRIỂN LÃM (XXII) */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAiActiveTool('report')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                aiActiveTool === 'report' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              📄 Viết báo cáo tổng kết Biozone
            </button>
            <button
              onClick={() => setAiActiveTool('summary')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                aiActiveTool === 'summary' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              📊 Phân tích nhận xét & ý kiến học sinh
            </button>
            <button
              onClick={() => setAiActiveTool('topics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                aiActiveTool === 'topics' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              💡 Gợi ý chủ đề Biozone mới
            </button>
          </div>

          {aiError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
              {aiError}
            </div>
          )}

          {/* AI Tool 1: Báo cáo tổng kết */}
          {aiActiveTool === 'report' && (
            <div className="p-5 rounded-3xl bg-white border-2 border-emerald-100 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Tự động soạn thảo Báo cáo Tổng kết Triển lãm Sinh học THCS</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    AI tổng hợp số liệu tham quan, kết quả bình chọn và đánh giá năng lực học sinh
                  </p>
                </div>
                <button
                  onClick={handleAiGenerateReport}
                  disabled={isAiLoading}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:brightness-105 text-white font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {isAiLoading ? 'AI đang tổng hợp số liệu...' : '⚡ Tạo báo cáo ngay'}
                </button>
              </div>

              {aiReportMarkdown && (
                <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs md:text-sm text-slate-800 space-y-3 font-sans leading-relaxed">
                  <div className="flex justify-end pb-2 border-b border-slate-200">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>In / Xuất PDF</span>
                    </button>
                  </div>
                  <div className="whitespace-pre-line font-mono text-xs text-slate-700 bg-white p-4 rounded-xl border border-slate-200 overflow-x-auto">
                    {aiReportMarkdown}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Tool 2: Phân tích nhận xét */}
          {aiActiveTool === 'summary' && (
            <div className="p-5 rounded-3xl bg-white border-2 border-sky-100 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-500" />
                    <span>Phân tích cảm xúc & Giá trị sư phạm của triển lãm Biozone</span>
                  </h4>
                  <p className="text-xs text-slate-500">
                    Đọc toàn bộ nhận xét và phản hồi của học sinh để đưa ra lời khuyên cho tiết học tiếp theo
                  </p>
                </div>
                <button
                  onClick={handleAiSummarizeFeedback}
                  disabled={isAiLoading}
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {isAiLoading ? 'AI đang phân tích...' : '⚡ Phân tích phản hồi'}
                </button>
              </div>

              {aiFeedbackSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-xs">
                    <strong className="text-emerald-800 block text-sm">Tâm trạng & Cảm xúc chung:</strong>
                    <p className="text-slate-700">{aiFeedbackSummary.generalSentiment}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-1.5 text-xs">
                    <strong className="text-teal-800 block text-sm">Giá trị sư phạm đạt được:</strong>
                    <p className="text-slate-700">{aiFeedbackSummary.pedagogicalValue}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs md:col-span-2">
                    <strong className="text-amber-800 block text-sm">Lời khuyên sư phạm cho giáo viên:</strong>
                    <p className="text-slate-700">{aiFeedbackSummary.teacherAdvice}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Tool 3: Gợi ý chủ đề mới */}
          {aiActiveTool === 'topics' && (
            <div className="p-5 rounded-3xl bg-white border-2 border-emerald-100 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-[11px] text-slate-600 font-bold block mb-1">Khối lớp:</label>
                    <select
                      value={aiTopicGrade}
                      onChange={(e) => setAiTopicGrade(e.target.value)}
                      className="bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-1.5 border border-slate-200"
                    >
                      <option value="6">Lớp 6</option>
                      <option value="7">Lớp 7</option>
                      <option value="8">Lớp 8</option>
                      <option value="9">Lớp 9</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-600 font-bold block mb-1">Môn học / Lĩnh vực:</label>
                    <input
                      type="text"
                      value={aiTopicSubject}
                      onChange={(e) => setAiTopicSubject(e.target.value)}
                      className="bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-1.5 border border-slate-200 w-48"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAiSuggestTopics}
                  disabled={isAiLoading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isAiLoading ? 'AI đang tư duy...' : '💡 Gợi ý chủ đề'}
                </button>
              </div>

              {aiSuggestedTopics.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                  {aiSuggestedTopics.map((topic, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {topic.themeTag || 'Sinh học THCS'}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">{topic.title}</h4>
                      <p className="text-xs text-slate-600">{topic.description}</p>
                      {topic.examples && (
                        <div className="pt-1 text-[11px] text-slate-500">
                          <strong className="text-slate-700">Gợi ý sản phẩm:</strong>{' '}
                          {topic.examples.join(' • ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
