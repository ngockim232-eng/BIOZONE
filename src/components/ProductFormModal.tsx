import React, { useState, useEffect } from 'react';
import { ExhibitionProduct, GalleryRoom, InteractiveQuestion } from '../types';
import {
  Sparkles,
  Wand2,
  X,
  Upload,
  Image as ImageIcon,
  Video,
  Plus,
  Trash2,
  HelpCircle,
  Lightbulb,
  Check
} from 'lucide-react';
import { getFallbackProductImage } from '../utils/illustrations';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: GalleryRoom;
  productToEdit?: ExhibitionProduct | null;
  onSaved: (product: ExhibitionProduct) => void;
  studentAccount?: { id: string; username: string; name: string; className: string } | null;
  isStudentMode?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  room,
  productToEdit,
  onSaved,
  studentAccount,
  isStudentMode = false,
}) => {
  const isEditing = Boolean(productToEdit);

  const defaultImg = getFallbackProductImage(room.code || room.title);

  const [title, setTitle] = useState(productToEdit?.title || '');
  const [author, setAuthor] = useState(productToEdit?.author || studentAccount?.name || '');
  const [groupCode, setGroupCode] = useState(
    productToEdit?.groupCode || (studentAccount ? `BIO-${studentAccount.username.toUpperCase()}` : '')
  );
  const [className, setClassName] = useState(
    productToEdit?.className || studentAccount?.className || room.className || '7/1'
  );
  const [subject, setSubject] = useState(productToEdit?.subject || 'Khoa học tự nhiên (Sinh học 7)');
  const [theme, setTheme] = useState(productToEdit?.theme || room.theme || '🧬 BIOZONE – SINH HỌC & TẾ BÀO');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [idea, setIdea] = useState(productToEdit?.idea || '');
  const [process, setProcess] = useState(productToEdit?.process || '');
  const [result, setResult] = useState(productToEdit?.result || '');
  const [highlights, setHighlights] = useState(productToEdit?.highlights || '');
  const [message, setMessage] = useState(productToEdit?.message || '');
  const [teacherAdvisor, setTeacherAdvisor] = useState(productToEdit?.teacherAdvisor || room.teacherName || '');

  // Media
  const [primaryImage, setPrimaryImage] = useState(productToEdit?.primaryImage || defaultImg);
  const [galleryImages, setGalleryImages] = useState<string[]>(
    productToEdit?.images?.length ? productToEdit.images : [productToEdit?.primaryImage || defaultImg]
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState(productToEdit?.videoUrl || '');

  // Interactive questions
  const [questions, setQuestions] = useState<InteractiveQuestion[]>(
    productToEdit?.interactiveQuestions || [
      { id: 'q-' + Date.now(), question: 'Em thích điều gì nhất ở sản phẩm này?' }
    ]
  );
  const [newQuestionText, setNewQuestionText] = useState('');

  // AI assistant loading
  const [isAiGeneratingCaption, setIsAiGeneratingCaption] = useState(false);
  const [isAiSuggestingQuestions, setIsAiSuggestingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMsg(null);
    if (productToEdit) {
      setTitle(productToEdit.title || '');
      setAuthor(productToEdit.author || '');
      setGroupCode(productToEdit.groupCode || '');
      setClassName(productToEdit.className || room.className || '7/1');
      setSubject(productToEdit.subject || 'Khoa học tự nhiên (Sinh học 7)');
      setTheme(productToEdit.theme || room.theme || '🧬 BIOZONE – SINH HỌC & TẾ BÀO');
      setDescription(productToEdit.description || '');
      setIdea(productToEdit.idea || '');
      setProcess(productToEdit.process || '');
      setResult(productToEdit.result || '');
      setHighlights(productToEdit.highlights || '');
      setMessage(productToEdit.message || '');
      setTeacherAdvisor(productToEdit.teacherAdvisor || room.teacherName || '');
      const initImg = productToEdit.primaryImage || defaultImg;
      setPrimaryImage(initImg);
      setGalleryImages(productToEdit.images?.length ? productToEdit.images : [initImg]);
      setVideoUrl(productToEdit.videoUrl || '');
      setQuestions(
        productToEdit.interactiveQuestions || [
          { id: 'q-' + Date.now(), question: 'Em thích điều gì nhất ở sản phẩm này?' }
        ]
      );
    } else {
      setTitle('');
      setAuthor(studentAccount?.name || '');
      setGroupCode(studentAccount ? `BIO-${studentAccount.username.toUpperCase()}` : '');
      setClassName(studentAccount?.className || room.className || '7/1');
      setSubject('Khoa học tự nhiên (Sinh học 7)');
      setTheme(room.theme || '🧬 BIOZONE – SINH HỌC & TẾ BÀO');
      setDescription('');
      setIdea('');
      setProcess('');
      setResult('');
      setHighlights('');
      setMessage('');
      setTeacherAdvisor(room.teacherName || '');
      setPrimaryImage(defaultImg);
      setGalleryImages([defaultImg]);
      setVideoUrl('');
      setQuestions([{ id: 'q-' + Date.now(), question: 'Em thích điều gì nhất ở sản phẩm này?' }]);
    }
  }, [isOpen, productToEdit, studentAccount, room]);

  if (!isOpen) return null;

  // AI 1: Viết chú thích & thuyết minh
  const handleAiGenerateCaption = async () => {
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên sản phẩm trước khi nhờ AI viết thuyết minh');
      return;
    }

    setIsAiGeneratingCaption(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          subject,
          roughIdea: idea || description || title,
        }),
      });

      const data = await res.json();
      if (data.description) setDescription(data.description);
      if (data.idea) setIdea(data.idea);
      if (data.process) setProcess(data.process);
      if (data.highlights) setHighlights(data.highlights);
      if (data.message) setMessage(data.message);
    } catch {
      setErrorMsg('Lỗi kết nối AI');
    } finally {
      setIsAiGeneratingCaption(false);
    }
  };

  // AI 2: Gợi ý câu hỏi tương tác
  const handleAiSuggestQuestions = async () => {
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tên sản phẩm trước khi nhờ AI gợi ý câu hỏi');
      return;
    }

    setIsAiSuggestingQuestions(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/suggest-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productTitle: title, subject }),
      });

      const data = await res.json();
      if (Array.isArray(data.questions)) {
        const newQs = data.questions.map((qStr: string, i: number) => ({
          id: 'q-ai-' + Date.now() + '-' + i,
          question: qStr,
        }));
        setQuestions([...questions, ...newQs]);
      }
    } catch {
      setErrorMsg('Lỗi kết nối AI');
    } finally {
      setIsAiSuggestingQuestions(false);
    }
  };

  // Add gallery image
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setGalleryImages([...galleryImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    const updated = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updated);
    if (primaryImage === galleryImages[index] && updated.length > 0) {
      setPrimaryImage(updated[0]);
    }
  };

  // Handle file upload (local image to data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setGalleryImages([...galleryImages, base64]);
        if (!primaryImage || galleryImages.length === 0) {
          setPrimaryImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Question management
  const handleAddQuestion = () => {
    if (newQuestionText.trim()) {
      setQuestions([
        ...questions,
        { id: 'q-' + Date.now(), question: newQuestionText.trim() },
      ]);
      setNewQuestionText('');
    }
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setErrorMsg('Vui lòng nhập tên sản phẩm và tên tác giả');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const payload: Record<string, any> = {
      title,
      author,
      groupCode: groupCode.trim() || undefined,
      className,
      subject,
      theme,
      description,
      idea,
      process,
      result,
      highlights,
      message,
      teacherAdvisor,
      primaryImage: galleryImages[0] || primaryImage,
      images: galleryImages.length > 0 ? galleryImages : [primaryImage],
      videoUrl,
      interactiveQuestions: questions,
      submittedByStudentId: studentAccount?.id || productToEdit?.submittedByStudentId || undefined,
    };

    if (isEditing && isStudentMode && studentAccount) {
      payload.requesterRole = 'student';
      payload.requesterStudentId = studentAccount.id;
    }

    try {
      const url = isEditing && productToEdit
        ? `/api/rooms/${room.id}/products/${productToEdit.id}`
        : `/api/rooms/${room.id}/products`;
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Lỗi lưu sản phẩm');
      } else {
        onSaved(data);
        onClose();
      }
    } catch {
      setErrorMsg('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-white border-2 border-emerald-300 rounded-3xl shadow-2xl flex flex-col text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-200 bg-gradient-to-r from-emerald-50 via-cyan-50 to-amber-50 sticky top-0 z-10">
          <div>
            <h3 className="text-xl md:text-2xl font-display font-extrabold text-slate-900">
              {isEditing ? '✏️ Chỉnh sửa sản phẩm của nhóm' : '✨ Thêm sản phẩm mới vào phòng 3D'}
            </h3>
            <p className="text-sm text-emerald-700 font-semibold">
              Phòng: {room.title} ({room.code})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white/80 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 md:p-6 space-y-6 text-sm">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-sm text-rose-700 font-bold">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span>1. Thông tin chung sản phẩm</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên sản phẩm <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Vườn rau thông minh IoT"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 text-sm text-slate-900 rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tác giả / Nhóm học sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nhóm STEM Tech (Tuấn Kiệt, Minh Anh...)"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-slate-50 text-sm text-slate-900 rounded-xl px-4 py-2.5 border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mã nhóm (nếu có)</label>
                <input
                  type="text"
                  placeholder="VD: ST-01, NHOM-2"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Môn học</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Images & Video */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <span>2. Hình ảnh & Video sản phẩm</span>
            </h4>

            {/* Gallery images preview */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Album ảnh sản phẩm ({galleryImages.length} ảnh):
              </label>

              <div className="flex flex-wrap gap-3">
                {galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group w-24 h-20 rounded-xl overflow-hidden border-2 border-emerald-200 bg-emerald-50"
                  >
                    <img src={img} alt={`gallery-${idx}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-[9px] font-bold text-white">
                        Ảnh chính
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add image URL or local upload */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Dán link ảnh (Unsplash, Imgur, link web...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 rounded-xl px-3 py-2 border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200"
                >
                  + Thêm URL
                </button>
                <label className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold cursor-pointer flex items-center justify-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh từ máy</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Video link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Video giới thiệu sản phẩm (YouTube URL / MP4):
              </label>
              <div className="relative">
                <Video className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-slate-50 text-xs text-slate-900 placeholder-slate-400 rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Thuyết minh sư phạm & AI Assistant */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                3. Thuyết minh & Chú thích chi tiết
              </h4>

              <button
                type="button"
                onClick={handleAiGenerateCaption}
                disabled={isAiGeneratingCaption}
                className="text-xs text-sky-700 hover:text-sky-800 font-bold flex items-center gap-1.5 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isAiGeneratingCaption ? 'AI đang soạn thuyết minh...' : '🤖 AI viết thuyết minh'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả sản phẩm</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giới thiệu tổng quan cấu tạo, chức năng..."
                  className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl p-3 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ý tưởng sáng tạo</label>
                <textarea
                  rows={2}
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Xuất phát điểm từ bài học hoặc vấn đề thực tế..."
                  className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl p-3 border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quá trình thực hiện</label>
                <textarea
                  rows={3}
                  value={process}
                  onChange={(e) => setProcess(e.target.value)}
                  placeholder="Bước 1, Bước 2, Bước 3... theo quy trình STEM/thiết kế kỹ thuật"
                  className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl p-3 border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Điểm nổi bật</label>
                  <input
                    type="text"
                    value={highlights}
                    onChange={(e) => setHighlights(e.target.value)}
                    placeholder="Điểm độc đáo nhất..."
                    className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thông điệp</label>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ý nghĩa gửi gắm tới cộng đồng..."
                    className="w-full bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Interactive Questions */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                4. Câu hỏi tương tác cho học sinh
              </h4>

              <button
                type="button"
                onClick={handleAiSuggestQuestions}
                disabled={isAiSuggestingQuestions}
                className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>{isAiSuggestingQuestions ? 'AI đang tìm câu hỏi...' : 'Gợi ý câu hỏi AI'}</span>
              </button>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs font-extrabold text-emerald-700 px-1.5">Q{idx + 1}</span>
                  <span className="text-xs text-slate-800 flex-1">{q.question}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(q.id)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Thêm câu hỏi tương tác mới..."
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="flex-1 bg-slate-50 text-xs text-slate-900 rounded-xl px-3 py-2 border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200"
                >
                  + Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
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
              {isSubmitting ? 'Đang lưu...' : isEditing ? 'Cập nhật sản phẩm' : 'Đưa sản phẩm lên phòng 3D'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
