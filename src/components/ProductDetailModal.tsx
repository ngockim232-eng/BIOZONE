import React, { useState, useEffect } from 'react';
import { ExhibitionProduct, GalleryRoom, VoteType, StudentAccount } from '../types';
import { VOTE_CONFIGS } from '../utils/constants';
import { getFallbackProductImage } from '../utils/illustrations';
import { isProductOwnedByStudent } from '../utils/ownership';
import confetti from 'canvas-confetti';
import {
  X,
  Heart,
  Eye,
  Award,
  MessageSquare,
  Play,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Pin,
  EyeOff,
  Trash2,
  Edit3,
  Send,
  HelpCircle,
  Sparkles,
  BookOpen,
  Compass,
  Lightbulb,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ProductDetailModalProps {
  product: ExhibitionProduct;
  room: GalleryRoom;
  onClose: () => void;
  currentUser: { name: string; className: string } | null;
  loggedInStudent?: StudentAccount | null;
  onRequireIdentity: () => void;
  isTeacherMode?: boolean;
  onVoteSuccess: (productId: string, voteType: VoteType) => void;
  onCommentSuccess: () => void;
  onEditProduct?: (product: ExhibitionProduct) => void;
  onDeleteProduct?: (product: ExhibitionProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  room,
  onClose,
  currentUser,
  loggedInStudent = null,
  onRequireIdentity,
  isTeacherMode,
  onVoteSuccess,
  onCommentSuccess,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreenImage, setIsFullscreenImage] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'comments' | 'qa'>('info');

  // Voting state
  const [isVoting, setIsVoting] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccessMsg, setVoteSuccessMsg] = useState<string | null>(null);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [selectedReaction, setSelectedReaction] = useState<'❤️' | '😊' | '👍' | '💡'>('❤️');
  const [commentFilter, setCommentFilter] = useState<'all' | 'latest' | 'pinned'>('all');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [localComments, setLocalComments] = useState<any[]>(product.comments || []);
  const [commentAuthorName, setCommentAuthorName] = useState<string>(currentUser?.name || '');
  const [commentAuthorClass, setCommentAuthorClass] = useState<string>(currentUser?.className || room.className || '7/1');
  const [commentSuccessMsg, setCommentSuccessMsg] = useState<string | null>(null);
  const [commentErrorMsg, setCommentErrorMsg] = useState<string | null>(null);

  // Sync local comments with props when updated
  useEffect(() => {
    if (product.comments) {
      setLocalComments(product.comments);
    }
  }, [product.comments]);

  useEffect(() => {
    if (currentUser?.name && !commentAuthorName) {
      setCommentAuthorName(currentUser.name);
    }
    if (currentUser?.className && !commentAuthorClass) {
      setCommentAuthorClass(currentUser.className);
    }
  }, [currentUser]);

  // QA state
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const images = product.images?.length > 0 ? product.images : [product.primaryImage];

  // Record view on mount
  useEffect(() => {
    fetch(`/api/rooms/${room.id}/products/${product.id}/view`, { method: 'POST' }).catch(() => {});
  }, [room.id, product.id]);

  // Check if current user already voted for this product
  const hasVotedThisProduct = currentUser
    ? (product.votes || []).some(v => v.studentName.toLowerCase() === currentUser.name.toLowerCase().trim())
    : false;

  const handleVote = async (voteType: VoteType) => {
    if (!currentUser) {
      onRequireIdentity();
      return;
    }
    if (room.status === 'closed') {
      setVoteError('Phòng triển lãm hiện đã đóng bình chọn.');
      return;
    }

    setIsVoting(true);
    setVoteError(null);
    setVoteSuccessMsg(null);

    try {
      const res = await fetch(`/api/rooms/${room.id}/products/${product.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: currentUser.name,
          studentClass: currentUser.className,
          voteType,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setVoteError(data.error || 'Không thể thực hiện bình chọn');
      } else {
        // Fire confetti
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
        });
        setVoteSuccessMsg('Cảm ơn bạn đã bình chọn cho sản phẩm!');
        onVoteSuccess(product.id, voteType);
      }
    } catch {
      setVoteError('Lỗi kết nối máy chủ');
    } finally {
      setIsVoting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const authorName = (commentAuthorName.trim() || currentUser?.name || 'Học sinh tham quan').trim();
    const authorClass = (commentAuthorClass.trim() || currentUser?.className || room.className || '').trim();

    setIsSubmittingComment(true);
    setCommentErrorMsg(null);
    setCommentSuccessMsg(null);

    try {
      const res = await fetch(`/api/rooms/${room.id}/products/${product.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: authorName,
          studentClass: authorClass,
          comment: commentText.trim(),
          reaction: selectedReaction,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCommentErrorMsg(data.error || 'Không thể gửi nhận xét. Vui lòng thử lại!');
      } else {
        const createdComment = data.comment || {
          id: 'c-' + Date.now(),
          studentName: authorName,
          studentClass: authorClass,
          comment: commentText.trim(),
          reaction: selectedReaction,
          createdAt: new Date().toISOString(),
          isPinned: false,
          isHidden: false,
        };
        // Optimistic / instant local update
        setLocalComments((prev) => [createdComment, ...prev]);
        setCommentText('');
        setCommentSuccessMsg('Đã gửi nhận xét thành công! Cảm ơn em đã chia sẻ ý kiến.');
        setTimeout(() => setCommentSuccessMsg(null), 4000);
        onCommentSuccess();
      }
    } catch {
      setCommentErrorMsg('Lỗi kết nối máy chủ khi gửi nhận xét.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentAction = async (commentId: string, action: string) => {
    try {
      const res = await fetch(`/api/rooms/${room.id}/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        if (action === 'delete') {
          setLocalComments((prev) => prev.filter((c) => c.id !== commentId));
        } else if (action === 'pin') {
          setLocalComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, isPinned: true } : c)));
        } else if (action === 'unpin') {
          setLocalComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, isPinned: false } : c)));
        }
        onCommentSuccess();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerSubmit = async (questionId: string) => {
    const authorName = (currentUser?.name || commentAuthorName.trim() || 'Học sinh KHTN').trim();
    if (!answerText.trim()) return;

    setIsSubmittingAnswer(true);
    try {
      const res = await fetch(`/api/rooms/${room.id}/products/${product.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          studentName: authorName,
          answer: answerText.trim(),
        }),
      });
      if (res.ok) {
        setAnswerText('');
        setActiveQuestionId(null);
        onCommentSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Filter comments using localComments
  const filteredComments = (localComments || [])
    .filter(c => !c.isHidden || isTeacherMode)
    .sort((a, b) => {
      if (commentFilter === 'pinned') {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Embed YouTube helper
  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=0`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=0`;
    }
    return url;
  };

  const embedUrl = getEmbedVideoUrl(product.videoUrl);

  const fallbackImg = getFallbackProductImage(product.id || product.title);

  const canManageProduct =
    Boolean(isTeacherMode) || isProductOwnedByStudent(product, loggedInStudent, currentUser);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/55 backdrop-blur-md overflow-y-auto animate-fadeIn">
      {/* Fullscreen Image Overlay */}
      {isFullscreenImage && (
        <div className="fixed inset-0 z-[60] bg-slate-900/95 flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsFullscreenImage(false)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white text-slate-800 hover:bg-emerald-50 shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={images[activeImageIndex] || fallbackImg}
            alt="Fullscreen"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = fallbackImg;
            }}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
          />
        </div>
      )}

      {/* Main Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white border-2 border-emerald-300 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-800">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-5 border-b border-emerald-200 bg-gradient-to-r from-emerald-50 via-cyan-50 to-amber-50 sticky top-0 z-20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs md:text-sm border border-emerald-300">
              {product.subject || room.theme}
            </span>
            {product.groupCode && (
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs md:text-sm border border-amber-300">
                Mã nhóm: {product.groupCode}
              </span>
            )}
            {canManageProduct && !isTeacherMode && (
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs">
                ⭐ Sản phẩm của nhóm em
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {canManageProduct && onEditProduct && (
              <button
                onClick={() => {
                  onClose();
                  onEditProduct(product);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300 text-xs md:text-sm font-bold transition-all active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span>Sửa</span>
              </button>
            )}
            {canManageProduct && onDeleteProduct && (
              <button
                onClick={() => {
                  onClose();
                  onDeleteProduct(product);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-xs md:text-sm font-bold transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 md:p-6 space-y-6">
          {/* Top Gallery & Video Section */}
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-200 shadow-inner">
              {showVideo && embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={product.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img
                  src={images[activeImageIndex] || fallbackImg}
                  alt={product.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackImg;
                  }}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain cursor-zoom-in"
                  onClick={() => setIsFullscreenImage(true)}
                />
              )}

              {/* Gallery navigation controls */}
              {!showVideo && images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg border border-slate-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-lg border border-slate-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Top controls: Fullscreen & Video switch */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                {product.videoUrl && (
                  <button
                    onClick={() => setShowVideo(!showVideo)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                      showVideo
                        ? 'bg-rose-600 text-white'
                        : 'bg-white/95 hover:bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{showVideo ? 'Xem ảnh' : '▶ Xem video'}</span>
                  </button>
                )}
                {!showVideo && (
                  <button
                    onClick={() => setIsFullscreenImage(true)}
                    className="p-2 rounded-xl bg-white/95 hover:bg-white text-slate-700 border border-slate-200 shadow-md"
                    title="Toàn màn hình"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail Carousel */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveImageIndex(i);
                      setShowVideo(false);
                    }}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === i && !showVideo
                        ? 'border-emerald-500 scale-105'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumb-${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Title and Basic Metadata */}
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 mb-2 leading-tight">
              {product.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:text-base text-slate-600">
              <span className="flex items-center gap-1.5">
                <strong className="text-emerald-700">Tác giả:</strong> {product.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <strong className="text-emerald-700">Lớp:</strong> {product.className || room.className}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <strong className="text-emerald-700">GV hướng dẫn:</strong> {product.teacherAdvisor || room.teacherName}
              </span>
            </div>
          </div>

          {/* Voting Box */}
          <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-sky-50 to-amber-50 border-2 border-emerald-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Bình chọn cho sản phẩm này</span>
                </h4>
                <p className="text-xs text-slate-500">
                  {room.status === 'closed'
                    ? 'Phòng đã kết thúc thời gian bình chọn'
                    : `Học sinh được bình chọn tối đa ${room.maxVotesPerStudent || 3} sản phẩm`}
                </p>
              </div>

              <div className="text-xs text-slate-600">
                Tổng cộng: <strong className="text-amber-600 text-sm font-extrabold">{product.votes?.length || 0}</strong> lượt bình chọn
              </div>
            </div>

            {voteError && (
              <div className="text-xs text-rose-700 font-semibold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {voteError}
              </div>
            )}

            {voteSuccessMsg && (
              <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{voteSuccessMsg}</span>
              </div>
            )}

            {/* 4 Voting Category Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {VOTE_CONFIGS.map((btn) => {
                const count = (product.votes || []).filter((v) => v.voteType === btn.type).length;
                return (
                  <button
                    key={btn.type}
                    onClick={() => handleVote(btn.type)}
                    disabled={isVoting || hasVotedThisProduct || room.status === 'closed'}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 font-bold text-xs transition-all active:scale-95 ${
                      btn.color
                    } ${
                      hasVotedThisProduct
                        ? 'opacity-60 cursor-not-allowed'
                        : 'shadow-sm'
                    }`}
                  >
                    <span className="text-base mb-1">{btn.icon}</span>
                    <span className="font-bold text-center">{btn.shortLabel}</span>
                    <span className="text-[11px] opacity-80 mt-0.5 tabular-nums">({count})</span>
                  </button>
                );
              })}
            </div>
            {hasVotedThisProduct && (
              <p className="text-center text-xs text-emerald-700 font-bold">
                ✓ Bạn đã bình chọn cho sản phẩm này
              </p>
            )}
          </div>

          {/* Tabs: Thuyết minh / Nhận xét / Câu hỏi tương tác */}
          <div className="border-b border-slate-200 flex gap-4 text-sm font-bold">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'info'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Thuyết minh chi tiết</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'comments'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Nhận xét ({product.comments?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab('qa')}
              className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'qa'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Câu hỏi tương tác ({product.interactiveQuestions?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: THUYẾT MINH SẢN PHẨM (Section X) */}
          {activeTab === 'info' && (
            <div className="space-y-4 text-sm">
              {product.idea && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <h4 className="font-extrabold text-amber-800 flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>Ý tưởng sáng tạo</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{product.idea}</p>
                </div>
              )}

              {product.description && (
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
                  <h4 className="font-extrabold text-sky-800 flex items-center gap-2 mb-2">
                    <Compass className="w-4 h-4 text-sky-600" />
                    <span>Mô tả tổng quan</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {product.process && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-extrabold text-slate-800 flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    <span>Quá trình thực hiện</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{product.process}</p>
                </div>
              )}

              {product.highlights && (
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <h4 className="font-extrabold text-emerald-800 flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Điểm nổi bật & Tính đột phá</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-line">{product.highlights}</p>
                </div>
              )}

              {product.message && (
                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200">
                  <h4 className="font-extrabold text-rose-800 flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <span>Thông điệp gửi gắm</span>
                  </h4>
                  <p className="text-slate-700 leading-relaxed italic whitespace-pre-line">"{product.message}"</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NHẬN XÉT (Section XV) */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {/* Comment submission form */}
              <form onSubmit={handleAddComment} className="p-4 rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">
                    Viết nhận xét của em cho sản phẩm:
                  </span>
                  {/* Reaction icons picker */}
                  <div className="flex items-center gap-1">
                    {(['❤️', '😊', '👍', '💡'] as const).map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setSelectedReaction(emoji)}
                        className={`text-base p-1.5 rounded-lg transition-all ${
                          selectedReaction === emoji ? 'bg-emerald-500 text-white scale-110 shadow-sm' : 'bg-white hover:bg-emerald-100 border border-slate-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name and class inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Họ tên của em:</label>
                    <input
                      type="text"
                      value={commentAuthorName}
                      onChange={(e) => setCommentAuthorName(e.target.value)}
                      placeholder="VD: Nguyễn Minh An..."
                      className="w-full bg-white text-xs text-slate-900 placeholder-slate-400 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Lớp:</label>
                    <input
                      type="text"
                      value={commentAuthorClass}
                      onChange={(e) => setCommentAuthorClass(e.target.value)}
                      placeholder="VD: 7A1, 7/1..."
                      className="w-full bg-white text-xs text-slate-900 placeholder-slate-400 rounded-xl px-3 py-2 border border-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Chia sẻ điều em thích, điều em học được hoặc câu hỏi cho nhóm tác giả..."
                  className="w-full bg-white text-sm text-slate-900 placeholder-slate-400 rounded-xl p-3 border border-slate-200 focus:outline-none focus:border-emerald-500"
                />

                {commentSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{commentSuccessMsg}</span>
                  </div>
                )}

                {commentErrorMsg && (
                  <div className="p-3 rounded-xl bg-rose-100 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-shake">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{commentErrorMsg}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmittingComment ? 'Đang gửi...' : 'Gửi nhận xét'}</span>
                  </button>
                </div>
              </form>

              {/* Filters for comments */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">{filteredComments.length} nhận xét</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCommentFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${commentFilter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setCommentFilter('latest')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${commentFilter === 'latest' ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                  >
                    Mới nhất
                  </button>
                  <button
                    onClick={() => setCommentFilter('pinned')}
                    className={`px-2.5 py-1 rounded-lg font-semibold ${commentFilter === 'pinned' ? 'bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                  >
                    Nổi bật
                  </button>
                </div>
              </div>

              {/* Comments list */}
              <div className="space-y-3">
                {filteredComments.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-500">Chưa có nhận xét nào. Hãy là người đầu tiên để lại lời khen!</p>
                ) : (
                  filteredComments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        c.isPinned
                          ? 'bg-amber-50 border-amber-300 shadow-sm'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{c.reaction}</span>
                          <div>
                            <span className="text-xs font-extrabold text-slate-900">{c.studentName}</span>
                            {c.studentClass && (
                              <span className="text-[11px] text-slate-500 ml-1.5">({c.studentClass})</span>
                            )}
                          </div>
                          {c.isPinned && (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full">
                              <Pin className="w-3 h-3" /> Nổi bật
                            </span>
                          )}
                        </div>

                        {/* Teacher moderation options */}
                        {isTeacherMode && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCommentAction(c.id, c.isPinned ? 'unpin' : 'pin')}
                              className="p-1 rounded text-slate-500 hover:text-amber-600"
                              title={c.isPinned ? 'Bỏ ghim' : 'Ghim nổi bật'}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCommentAction(c.id, c.isHidden ? 'unhide' : 'hide')}
                              className="p-1 rounded text-slate-500 hover:text-sky-600"
                              title={c.isHidden ? 'Hiện nhận xét' : 'Ẩn nhận xét'}
                            >
                              <EyeOff className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCommentAction(c.id, 'delete')}
                              className="p-1 rounded text-slate-500 hover:text-rose-600"
                              title="Xóa nhận xét"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-xs md:text-sm text-slate-700 pl-7 leading-relaxed">{c.comment}</p>
                      <p className="text-[10px] text-slate-400 pl-7 mt-1.5">
                        {new Date(c.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CÂU HỎI TƯƠNG TÁC (Section XXIII) */}
          {activeTab === 'qa' && (
            <div className="space-y-4">
              {!product.interactiveQuestions || product.interactiveQuestions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  Giáo viên chưa tạo câu hỏi tương tác cho sản phẩm này.
                </div>
              ) : (
                product.interactiveQuestions.map((q, idx) => {
                  const answersForThis = (product.answers || []).filter((a) => a.questionId === q.id);

                  return (
                    <div key={q.id} className="p-4 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700 font-extrabold text-xs">
                          Q{idx + 1}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 flex-1">{q.question}</h4>
                      </div>

                      {/* Student's answer field */}
                      {activeQuestionId === q.id ? (
                        <div className="space-y-2 pl-7">
                          <textarea
                            rows={2}
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Nhập câu trả lời của em..."
                            className="w-full bg-white text-xs text-slate-900 placeholder-slate-400 rounded-xl p-2.5 border border-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setActiveQuestionId(null)}
                              className="px-3 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={() => handleAnswerSubmit(q.id)}
                              disabled={isSubmittingAnswer || !answerText.trim()}
                              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                            >
                              Gửi câu trả lời
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pl-7">
                          <button
                            onClick={() => {
                              if (!currentUser) {
                                onRequireIdentity();
                              } else {
                                setActiveQuestionId(q.id);
                              }
                            }}
                            className="text-xs text-sky-700 hover:text-sky-800 font-bold underline"
                          >
                            + Trả lời câu hỏi này
                          </button>
                        </div>
                      )}

                      {/* Answers list */}
                      {answersForThis.length > 0 && (
                        <div className="pl-7 pt-2 border-t border-sky-200/70 space-y-2">
                          <p className="text-[11px] font-bold text-slate-500">
                            Câu trả lời của học sinh ({answersForThis.length}):
                          </p>
                          {answersForThis.map((ans) => (
                            <div key={ans.id} className="p-2.5 rounded-xl bg-white border border-sky-100 text-xs">
                              <span className="font-extrabold text-emerald-700">{ans.studentName}:</span>{' '}
                              <span className="text-slate-700">{ans.answer}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
