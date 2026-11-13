import React, { useState, useEffect } from 'react';
import { GalleryRoom, ExhibitionProduct, RoomSummary, VoteType, StudentAccount, TeacherProfile, RoomHallOfFame, SpaceStyle } from './types';
import { ExhibitionRoom3D } from './components/ExhibitionRoom3D';
import { ExhibitionGallery2D } from './components/ExhibitionGallery2D';
import { ProductDetailModal } from './components/ProductDetailModal';
import { StudentIdentityModal } from './components/StudentIdentityModal';
import { StudentReflectionModal } from './components/StudentReflectionModal';
import { MyGroupModal } from './components/MyGroupModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ShareAndQrModal } from './components/ShareAndQrModal';
import { CreateRoomModal } from './components/CreateRoomModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { HallOfFameModal } from './components/HallOfFameModal';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { StudentAccountLoginModal } from './components/StudentAccountLoginModal';
import { ProductFormModal } from './components/ProductFormModal';
import { HeroDna3D } from './components/HeroDna3D';
import { THEME_OPTIONS } from './utils/constants';
import { BIOZONE_ILLUSTRATIONS, getRoomIllustration, getThemeIllustration } from './utils/illustrations';
import {
  Compass,
  Plus,
  Users,
  Search,
  Sparkles,
  Trophy,
  Share2,
  Lightbulb,
  Layers,
  Box,
  GraduationCap,
  Calendar,
  ArrowRight,
  School,
  CheckCircle2,
  Lock,
  ChevronRight,
  Eye,
  Award,
  LogIn,
  Home,
  UserCheck,
  Settings,
  Dna,
  Edit3,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<'home' | 'room'>('home');
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  const [viewMode3D, setViewMode3D] = useState<boolean>(true);

  // Active room data
  const [activeRoom, setActiveRoom] = useState<GalleryRoom | null>(null);
  const [roomsList, setRoomsList] = useState<RoomSummary[]>([]);
  const [isLoadingRoom, setIsLoadingRoom] = useState<boolean>(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  // Student Identity state (basic guest visitor)
  const [studentIdentity, setStudentIdentity] = useState<{ name: string; className: string } | null>(() => {
    try {
      const saved = localStorage.getItem('exhibition_student_identity');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Student Account state (verified student accounts issued by teacher)
  const [loggedInStudent, setLoggedInStudent] = useState<StudentAccount | null>(() => {
    try {
      const saved = localStorage.getItem('biozone_student_account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Teacher Profile state & Gmail login
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>({
    id: 'teacher-bio-01',
    name: 'Cô Trần Thị Kim Ngọc',
    email: 'ngockim232@gmail.com',
    titleHonor: 'Giáo viên KHTN - Sinh học',
    schoolName: 'Trường PTDTBT TH&THCS Lý Tự Trọng',
    phone: '0379197677',
    subjectExpertise: 'Khoa học tự nhiên (Sinh học), STEM Sinh thái, Vi sinh vật & Tế bào học',
    bio: 'Cử nhân Sư phạm Sinh học',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
    joinedDate: '2024-09-05'
  });

  // Modal states
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ExhibitionProduct | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMyGroupOpen, setIsMyGroupOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Partial<GalleryRoom> | null>(null);
  const [roomPendingDelete, setRoomPendingDelete] = useState<{ id: string; title: string; code: string } | null>(null);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);
  const [isHallOfFameModalOpen, setIsHallOfFameModalOpen] = useState(false);
  const [isTeacherProfileModalOpen, setIsTeacherProfileModalOpen] = useState(false);
  const [isStudentLoginModalOpen, setIsStudentLoginModalOpen] = useState(false);
  const [isStudentSubmitModalOpen, setIsStudentSubmitModalOpen] = useState(false);
  const [studentProductToEdit, setStudentProductToEdit] = useState<ExhibitionProduct | null>(null);
  const [studentProductPendingDelete, setStudentProductPendingDelete] = useState<ExhibitionProduct | null>(null);
  const [isDeletingStudentProduct, setIsDeletingStudentProduct] = useState(false);
  const [studentDeleteError, setStudentDeleteError] = useState<string | null>(null);

  // Enter room by code state
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [enterCodeError, setEnterCodeError] = useState<string | null>(null);

  // Load public rooms list
  const loadRoomsList = async () => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        setRoomsList(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRoomsList();
    // Load saved teacher profile
    fetch('/api/teacher-profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setTeacherProfile(data);
      })
      .catch(() => {});
  }, []);

  // Check URL parameters for direct room access (QR Code scan support)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomCode = params.get('room');
    if (roomCode) {
      enterRoomByCode(roomCode);
    }
  }, []);

  // Student Account Auth Handlers
  const handleStudentLoginSuccess = (account: StudentAccount) => {
    setLoggedInStudent(account);
    try {
      localStorage.setItem('biozone_student_account', JSON.stringify(account));
      const identity = { name: account.name, className: account.className };
      setStudentIdentity(identity);
      localStorage.setItem('exhibition_student_identity', JSON.stringify(identity));
    } catch {}
    setIsStudentLoginModalOpen(false);
  };

  const handleStudentLogout = () => {
    setLoggedInStudent(null);
    try {
      localStorage.removeItem('biozone_student_account');
    } catch {}
  };

  // Hall of Fame Update Handler
  const handleUpdateHallOfFame = async (updatedHall: RoomHallOfFame) => {
    if (!activeRoom) return;
    try {
      const res = await fetch(`/api/rooms/${activeRoom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hallOfFame: updatedHall }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveRoom(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Enter room by code
  const enterRoomByCode = async (code: string) => {
    if (!code.trim()) return;
    setIsLoadingRoom(true);
    setEnterCodeError(null);
    setRoomError(null);

    try {
      const cleanCode = code.trim().toUpperCase();
      const res = await fetch(`/api/rooms/${cleanCode}`);
      if (!res.ok) {
        const data = await res.json();
        setEnterCodeError(data.error || 'Không tìm thấy phòng với mã này');
        setIsLoadingRoom(false);
        return;
      }

      const roomData: GalleryRoom = await res.json();
      setActiveRoom(roomData);
      setCurrentView('room');

      // Record visit
      fetch(`/api/rooms/${roomData.id}/visit`, { method: 'POST' }).catch(() => {});

      // Prompt identity if student has not set identity yet
      if (!studentIdentity) {
        setIsIdentityModalOpen(true);
      }
    } catch {
      setEnterCodeError('Lỗi kết nối máy chủ');
    } finally {
      setIsLoadingRoom(false);
    }
  };

  // Refresh current active room
  const refreshActiveRoom = async () => {
    if (!activeRoom) return;
    try {
      const res = await fetch(`/api/rooms/${activeRoom.id}`);
      if (res.ok) {
        const data: GalleryRoom = await res.json();
        setActiveRoom(data);
        loadRoomsList();
        // Keep selectedProduct synchronized if modal is open
        setSelectedProduct((curr) => {
          if (!curr) return null;
          const found = data.products.find((p) => p.id === curr.id);
          return found || curr;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save student identity
  const handleSaveIdentity = (identity: { name: string; className: string }) => {
    setStudentIdentity(identity);
    try {
      localStorage.setItem('exhibition_student_identity', JSON.stringify(identity));
    } catch {}
  };

  // Handle vote success from modal or quick vote
  const handleVoteSuccess = (productId: string) => {
    refreshActiveRoom();
  };

  // Handle changing 3D exhibition room space style live
  const handleChangeSpaceStyle = async (spaceStyle: SpaceStyle) => {
    if (!activeRoom) return;
    setActiveRoom((prev) => (prev ? { ...prev, spaceStyle } : prev));
    try {
      await fetch(`/api/rooms/${activeRoom.id}/style`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceStyle }),
      });
      loadRoomsList();
    } catch (err) {
      console.error(err);
    }
  };

  // Teacher: Open Edit Room modal (fetches full room details if starting from RoomSummary)
  const handleOpenEditRoom = async (roomTarget: Partial<GalleryRoom> & { id: string }) => {
    if (userRole !== 'teacher') return;
    try {
      const res = await fetch(`/api/rooms/${roomTarget.id}`);
      if (res.ok) {
        const fullRoom: GalleryRoom = await res.json();
        setRoomToEdit(fullRoom);
      } else {
        setRoomToEdit(roomTarget);
      }
    } catch {
      setRoomToEdit(roomTarget);
    }
    setIsCreateRoomModalOpen(true);
  };

  // Teacher: Confirm delete room
  const handleConfirmDeleteRoom = async () => {
    if (!roomPendingDelete || userRole !== 'teacher') return;
    setIsDeletingRoom(true);
    try {
      const res = await fetch(`/api/rooms/${roomPendingDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (activeRoom?.id === roomPendingDelete.id) {
          setActiveRoom(null);
          setSelectedProduct(null);
          setCurrentView('home');
          window.history.pushState({}, '', '/');
        }
        setRoomPendingDelete(null);
        loadRoomsList();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeletingRoom(false);
    }
  };

  // Student: Add, Edit, Delete own group's products
  const handleStudentOpenAddProduct = () => {
    if (!loggedInStudent) {
      setIsStudentLoginModalOpen(true);
      return;
    }
    setStudentProductToEdit(null);
    setIsStudentSubmitModalOpen(true);
  };

  const handleStudentOpenEditProduct = (product: ExhibitionProduct) => {
    setStudentProductToEdit(product);
    setIsStudentSubmitModalOpen(true);
  };

  const handleStudentRequestDeleteProduct = (product: ExhibitionProduct) => {
    setStudentDeleteError(null);
    setStudentProductPendingDelete(product);
  };

  const handleConfirmDeleteStudentProduct = async () => {
    if (!activeRoom || !studentProductPendingDelete) return;
    setIsDeletingStudentProduct(true);
    setStudentDeleteError(null);
    try {
      const query = new URLSearchParams({
        requesterRole: userRole,
        requesterStudentId: loggedInStudent?.id || '',
      });
      const res = await fetch(
        `/api/rooms/${activeRoom.id}/products/${studentProductPendingDelete.id}?${query.toString()}`,
        {
          method: 'DELETE',
          headers: {
            'x-user-role': userRole,
            'x-student-id': loggedInStudent?.id || '',
          },
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStudentDeleteError(data.error || 'Không thể xóa sản phẩm này');
        return;
      }
      if (selectedProduct?.id === studentProductPendingDelete.id) {
        setSelectedProduct(null);
      }
      setStudentProductPendingDelete(null);
      await refreshActiveRoom();
    } catch {
      setStudentDeleteError('Lỗi kết nối máy chủ khi xóa sản phẩm');
    } finally {
      setIsDeletingStudentProduct(false);
    }
  };

  // Stats across all rooms
  const totalPublicRooms = roomsList.length;
  const totalExhibits = roomsList.reduce((acc, r) => acc + (r.productCount || 0), 0);
  const totalVisitorsAcross = roomsList.reduce((acc, r) => acc + (r.visitorCount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EAFFF5] via-[#F2FAFF] to-[#FFF9EA] text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Global Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b-2 border-emerald-200 shadow-sm">
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 via-50% to-amber-400" />
        <div className="px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo & Brand */}
        <div
          onClick={() => {
            setCurrentView('home');
            window.history.pushState({}, '', '/');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
            <Dna className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-display font-extrabold tracking-tight flex items-center gap-2">
              <span className="text-gradient-bio">BIOZONE 3D</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 font-bold border border-emerald-300 whitespace-nowrap">
                SINH HỌC THCS
              </span>
            </h1>
            <p className="text-xs text-slate-600 font-semibold hidden sm:block">
              Không Gian Sáng Tạo Sinh Học • Bảo Tàng Số 3D
            </p>
          </div>
        </div>

        {/* Center / Right Toolbar */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Teacher Gmail Login Status Indicator (Teacher mode only) */}
          {userRole === 'teacher' && (
            <div
              onClick={() => setIsTeacherProfileModalOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 cursor-pointer text-xs transition-all group"
              title="Nhấn để xem hoặc cài đặt thông tin giáo viên"
            >
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center p-0.5 shadow-sm border border-slate-200">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <div className="text-left leading-tight">
                <div className="text-[10px] text-emerald-700 font-semibold">GV Gmail:</div>
                <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 font-mono">
                  {teacherProfile.email}
                </div>
              </div>
            </div>
          )}

          {/* Student Account Status / Login button in header */}
          {loggedInStudent ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-800 font-bold max-w-[120px] truncate">
                {loggedInStudent.name}
              </span>
              <button
                onClick={handleStudentLogout}
                className="text-[10px] text-slate-500 hover:text-rose-600 underline ml-1"
                title="Đăng xuất tài khoản học sinh"
              >
                Thoát
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsStudentLoginModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition-all whitespace-nowrap shrink-0"
              title="Đăng nhập tài khoản học sinh do giáo viên cấp để nộp sản phẩm"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-600" />
              <span className="hidden sm:inline">TK Học sinh</span>
            </button>
          )}

          {currentView === 'room' && (
            <button
              onClick={() => {
                setCurrentView('home');
                window.history.pushState({}, '', '/');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 border border-slate-200 transition-all whitespace-nowrap shrink-0"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Trang chủ</span>
            </button>
          )}

          {/* Role Switcher: Giáo viên / Học sinh */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
            <button
              onClick={() => {
                setUserRole('student');
                setIsCreateRoomModalOpen(false);
                setIsTeacherProfileModalOpen(false);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                userRole === 'student'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨‍🎓 Học sinh</span>
            </button>
            <button
              onClick={() => setUserRole('teacher')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                userRole === 'teacher'
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👩‍🏫 Giáo viên</span>
            </button>
          </div>

          {/* Teacher Quick Button: Tạo phòng (Teacher mode only) */}
          {userRole === 'teacher' && (
            <button
              onClick={() => {
                setRoomToEdit(null);
                setIsCreateRoomModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 hover:brightness-105 text-white font-bold text-xs md:text-sm shadow-md shadow-emerald-500/25 active:scale-95 transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Tạo phòng mới</span>
            </button>
          )}
        </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* ============================================================ */}
        {/* VIEW 1: HOME PAGE (Trang chủ - Section II) */}
        {/* ============================================================ */}
        {currentView === 'home' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Hero Section with Bright Pastel Gradient, Cute Explorer Mascot & Interactive 3D DNA */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-100/95 via-cyan-100/85 to-amber-100/95 border-2 border-emerald-300 p-6 md:p-10 shadow-xl shadow-emerald-500/10">
              {/* Soft decorative sunlit blobs */}
              <div className="pointer-events-none absolute -top-16 -left-16 w-72 h-72 rounded-full bg-emerald-300/45 blur-3xl" />
              <div className="pointer-events-none absolute top-10 right-10 w-64 h-64 rounded-full bg-cyan-300/40 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 right-1/3 w-72 h-72 rounded-full bg-amber-300/45 blur-3xl" />

              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Column: Title, Cute Mascot Greeting, Actions & Room Entry */}
                <div className="lg:col-span-7 text-center lg:text-left space-y-5">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 text-emerald-800 border-2 border-emerald-300 text-xs md:text-sm font-bold shadow-sm">
                    <Dna className="w-4 h-4 text-emerald-600" />
                    <span>Không gian triển lãm 3D giáo dục môn KHTN – Lĩnh vực Sinh học</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-display font-extrabold tracking-tight leading-[1.12]">
                    <span className="text-gradient-bio">BIOZONE</span>{' '}
                    <span className="text-slate-900">– KHÔNG GIAN SÁNG TẠO SINH HỌC</span>
                  </h1>

                  <p className="text-xl md:text-2xl font-display font-extrabold text-gradient-pop">
                    “Khám phá – Sáng tạo – Chia sẻ – Bình chọn”
                  </p>

                  {/* Cute Explorer Mascot Welcome Strip */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-white/95 border-2 border-emerald-300 shadow-md max-w-2xl mx-auto lg:mx-0">
                    <img
                      src={BIOZONE_ILLUSTRATIONS.mascot}
                      alt="Bạn nhỏ Biozone khám phá Sinh học"
                      className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border-2 border-emerald-300 shadow-sm shrink-0"
                    />
                    <div className="text-left space-y-1.5">
                      <div className="text-base md:text-lg font-display font-extrabold text-emerald-700 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Chào các nhà khoa học nhí!</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        BIOZONE - nơi những ý tưởng khoa học được khơi nguồn, những sản phẩm sáng tạo được trưng bày và những khám phá thú vị về thế giới tự nhiên được lan tỏa.
                        <span className="block mt-1 font-bold text-emerald-700">
                          Mỗi sản phẩm là một ý tưởng – Mỗi khám phá là một bước trưởng thành!
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons (Student mode: Join room only; Teacher mode: Create room + Join room) */}
                  <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 max-w-xl mx-auto lg:mx-0">
                    {/* 1. Tạo phòng trưng bày (Teacher only) */}
                    {userRole === 'teacher' && (
                      <button
                        onClick={() => {
                          setRoomToEdit(null);
                          setIsCreateRoomModalOpen(true);
                        }}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-105 text-white font-display font-extrabold text-base shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all shrink-0"
                      >
                        <span className="text-lg">👩‍🏫</span>
                        <span>TẠO PHÒNG TRƯNG BÀY</span>
                      </button>
                    )}

                    {/* 2. Tham quan phòng (Quick Code Input) */}
                    <div className="w-full sm:flex-1 flex items-center bg-white border-2 border-emerald-300 rounded-2xl p-1.5 focus-within:border-emerald-500 transition-all shadow-lg shadow-emerald-900/5">
                      <input
                        type="text"
                        placeholder="Nhập mã phòng (VD: BIO-7A1)"
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') enterRoomByCode(roomCodeInput);
                        }}
                        className="w-full bg-transparent text-base text-slate-900 placeholder-slate-400 px-3 py-1.5 font-mono font-bold focus:outline-none uppercase"
                      />
                      <button
                        onClick={() => enterRoomByCode(roomCodeInput)}
                        disabled={isLoadingRoom || !roomCodeInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:brightness-105 disabled:opacity-50 text-white font-bold text-sm flex items-center gap-1.5 shrink-0 active:scale-95 transition-all shadow-md"
                      >
                        <span>👨‍🎓 VÀO PHÒNG</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {enterCodeError && (
                    <p className="text-sm text-rose-600 font-bold animate-shake">
                      {enterCodeError}
                    </p>
                  )}

                  {/* Sample Quick Join Badges */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs md:text-sm text-slate-700">
                    <span className="font-bold">Vào nhanh phòng mẫu:</span>
                    <button
                      onClick={() => enterRoomByCode('BIO-7A1')}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 text-emerald-900 font-mono font-extrabold border-2 border-emerald-300 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
                    >
                      <Dna className="w-4 h-4 text-emerald-600" />
                      <span>BIO-7A1 (Biozone Sinh Học)</span>
                    </button>
                    <button
                      onClick={() => enterRoomByCode('7A1-STEM')}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-100 to-indigo-100 hover:from-sky-200 hover:to-indigo-200 text-sky-900 font-mono font-extrabold border-2 border-sky-300 transition-all active:scale-95 shadow-sm"
                    >
                      7A1-STEM
                    </button>
                  </div>

                  {/* Teacher Info Bar (Settings button hidden in student mode) */}
                  <div className="max-w-xl mx-auto lg:mx-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/95 border-2 border-emerald-200 text-xs md:text-sm shadow-sm">
                    <div className="flex items-center gap-2 text-slate-700">
                      <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        GV phụ trách: <strong className="text-slate-900">{teacherProfile.name}</strong> • {teacherProfile.schoolName}
                      </span>
                    </div>
                    {userRole === 'teacher' && (
                      <button
                        onClick={() => setIsTeacherProfileModalOpen(true)}
                        className="text-emerald-700 hover:text-emerald-800 font-bold underline flex items-center gap-1 shrink-0"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Cài đặt GV</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Column: Interactive Three.js 3D DNA Double Helix */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <HeroDna3D className="w-full h-[340px] md:h-[400px]" />
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar (Section II) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-sky-100 via-white to-cyan-100 border-2 border-sky-300 text-center space-y-1 shadow-md">
                <span className="text-sm font-bold text-sky-800">Phòng đang hoạt động</span>
                <div className="text-3xl md:text-4xl font-display font-extrabold text-sky-600 tabular-nums">
                  {totalPublicRooms}
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-100 via-white to-fuchsia-100 border-2 border-violet-300 text-center space-y-1 shadow-md">
                <span className="text-sm font-bold text-violet-800">Chủ đề phong phú</span>
                <div className="text-3xl md:text-4xl font-display font-extrabold text-violet-600 tabular-nums">11+</div>
              </div>
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-100 via-white to-teal-100 border-2 border-emerald-300 text-center space-y-1 shadow-md">
                <span className="text-sm font-bold text-emerald-800">Sản phẩm trưng bày</span>
                <div className="text-3xl md:text-4xl font-display font-extrabold text-emerald-600 tabular-nums">
                  {totalExhibits}
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-100 via-white to-orange-100 border-2 border-amber-300 text-center space-y-1 shadow-md">
                <span className="text-sm font-bold text-amber-800">Số lượt tham quan</span>
                <div className="text-3xl md:text-4xl font-display font-extrabold text-amber-600 tabular-nums">
                  {totalVisitorsAcross}
                </div>
              </div>
            </div>

            {/* Active Exhibitions List (Section II) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl md:text-3xl font-display font-extrabold text-slate-900 flex items-center gap-2">
                    <Compass className="w-6 h-6 text-emerald-600" />
                    <span>Các phòng triển lãm đang hoạt động</span>
                  </h3>
                  <p className="text-sm text-slate-600 font-medium">
                    Nhấp vào phòng để bước vào không gian bảo tàng 3D đầy màu sắc
                  </p>
                </div>

                {userRole === 'teacher' && (
                  <button
                    onClick={() => {
                      setRoomToEdit(null);
                      setIsCreateRoomModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 text-white text-sm font-bold shadow-md transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo phòng trưng bày</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roomsList.map((roomItem, idx) => {
                  const roomImg = getRoomIllustration(`${roomItem.code} ${roomItem.theme}`, idx);
                  return (
                    <div
                      key={roomItem.id}
                      onClick={() => enterRoomByCode(roomItem.code)}
                      className="group bg-white hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/70 border-2 border-emerald-200 hover:border-emerald-400 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-md hover:shadow-xl hover:shadow-emerald-500/15 flex flex-col justify-between"
                    >
                      {/* Cute Illustrated Room Banner */}
                      <div className="relative h-40 w-full overflow-hidden bg-emerald-50">
                        <img
                          src={roomImg}
                          alt={roomItem.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-xl bg-white/95 text-emerald-700 text-xs md:text-sm font-mono font-extrabold border-2 border-emerald-300 shadow-sm">
                            {roomItem.code}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-3 py-0.5 rounded-xl text-xs font-bold shadow-sm border ${
                                roomItem.status === 'active'
                                  ? 'bg-emerald-500 text-white border-emerald-300'
                                  : 'bg-rose-500 text-white border-rose-300'
                              }`}
                            >
                              {roomItem.status === 'active' ? 'Đang mở' : 'Đã đóng'}
                            </span>

                            {userRole === 'teacher' && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditRoom(roomItem);
                                  }}
                                  className="p-1.5 rounded-lg bg-white/95 hover:bg-sky-50 text-sky-600 border border-sky-200 shadow-sm transition-all"
                                  title="Chỉnh sửa phòng trưng bày"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRoomPendingDelete({
                                      id: roomItem.id,
                                      title: roomItem.title,
                                      code: roomItem.code,
                                    });
                                  }}
                                  className="p-1.5 rounded-lg bg-white/95 hover:bg-rose-50 text-rose-600 border border-rose-200 shadow-sm transition-all"
                                  title="Xóa phòng trưng bày"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-lg md:text-xl font-display font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                            {roomItem.title}
                          </h4>

                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                            {roomItem.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-emerald-100 space-y-3">
                          <div className="flex items-center justify-between text-xs md:text-sm text-slate-600 font-semibold">
                            <span className="truncate">{roomItem.teacherName}</span>
                            <span className="truncate max-w-[45%]">{roomItem.schoolName}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3 text-slate-700 font-bold tabular-nums">
                              <span>📦 {roomItem.productCount} SP</span>
                              <span>👁️ {roomItem.visitorCount} xem</span>
                              <span className="text-amber-600 font-extrabold">
                                ⭐ {roomItem.totalVotes}
                              </span>
                            </div>

                            <span className="text-sm text-emerald-600 font-display font-extrabold group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                              Vào phòng <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Featured Themes Strip (Section IV) with cute biology illustrations */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xl md:text-2xl font-display font-extrabold text-slate-800">
                Các chủ đề môn học THCS
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {THEME_OPTIONS.slice(0, 6).map((t, idx) => (
                  <div
                    key={t.id}
                    className={`rounded-2xl border-2 overflow-hidden text-center shadow-md hover:-translate-y-1 transition-all ${t.bgGradient}`}
                  >
                    <div className="h-24 w-full overflow-hidden bg-white/70 relative">
                      <img
                        src={getThemeIllustration(t.id, idx)}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-xl bg-white/95 border border-slate-200 flex items-center justify-center text-lg shadow-sm">
                        {t.icon}
                      </span>
                    </div>
                    <div className="p-3 space-y-1">
                      <h5 className="text-sm font-display font-extrabold text-slate-900 truncate">
                        {t.name.split(' ').slice(1).join(' ').replace('–', '').trim() || t.name}
                      </h5>
                      <p className="text-xs text-slate-700 line-clamp-1 font-medium">{t.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: ACTIVE EXHIBITION ROOM (Không gian triển lãm) */}
        {/* ============================================================ */}
        {currentView === 'room' && activeRoom && (
          <div className="space-y-6 animate-fadeIn">
            {/* Student Visitor Identity Badge & Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-3xl border-2 border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-200">
                  {userRole === 'teacher' ? '👩‍🏫' : '👨‍🎓'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {userRole === 'teacher' ? (
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Giáo viên quản trị: {activeRoom.teacherName}</span>
                        <button
                          onClick={() => setIsTeacherProfileModalOpen(true)}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 underline font-semibold"
                        >
                          [Thông tin GV]
                        </button>
                      </span>
                    ) : loggedInStudent ? (
                      <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                        <span>👨‍🎓 {loggedInStudent.name} (Lớp {loggedInStudent.className})</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono border border-emerald-200">
                          TK: {loggedInStudent.username}
                        </span>
                        <button
                          onClick={handleStudentLogout}
                          className="text-[10px] text-slate-500 hover:text-rose-600 underline font-normal"
                          title="Đăng xuất tài khoản học sinh"
                        >
                          [Thoát]
                        </button>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-900 flex flex-wrap items-center gap-2">
                        <span>{studentIdentity ? `Khách: ${studentIdentity.name} (${studentIdentity.className})` : 'Khách tham quan ẩn danh'}</span>
                        <button
                          onClick={() => setIsIdentityModalOpen(true)}
                          className="text-[11px] text-sky-600 hover:text-sky-700 underline font-semibold"
                        >
                          [Đổi tên]
                        </button>
                        <button
                          onClick={() => setIsStudentLoginModalOpen(true)}
                          className="text-[11px] px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold border border-emerald-300 flex items-center gap-1"
                        >
                          <LogIn className="w-3 h-3" />
                          <span>Đăng nhập TK HS để nộp SP</span>
                        </button>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                    <span>Phòng:</span>
                    <strong className="text-emerald-700">{activeRoom.title}</strong>
                    <span>• Mã:</span>
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                      {activeRoom.code}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons for Exhibition Room */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Submit Product Button for Students */}
                {userRole === 'student' && (
                  <button
                    onClick={handleStudentOpenAddProduct}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-105 text-white text-xs md:text-sm font-bold shadow-md shadow-emerald-500/25 transition-all active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm SP nhóm</span>
                  </button>
                )}

                {/* Hall of Fame Button */}
                <button
                  onClick={() => setIsHallOfFameModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-900 border border-amber-300 text-xs md:text-sm font-bold transition-all active:scale-95"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Góc vinh danh</span>
                </button>

                {/* 3D vs 2D Gallery Switch */}
                <button
                  onClick={() => setViewMode3D(!viewMode3D)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-all active:scale-95"
                >
                  {viewMode3D ? <Layers className="w-3.5 h-3.5 text-emerald-600" /> : <Box className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>{viewMode3D ? 'Chuyển sang 2D' : 'Không gian 3D'}</span>
                </button>

                {/* Leaderboard Button */}
                {activeRoom.showLeaderboard && (
                  <button
                    onClick={() => setIsLeaderboardOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all active:scale-95"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-500" />
                    <span>Bảng xếp hạng</span>
                  </button>
                )}

                {/* My Group's Product */}
                <button
                  onClick={() => setIsMyGroupOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-all active:scale-95"
                >
                  <Users className="w-3.5 h-3.5 text-sky-600" />
                  <span>SP nhóm tôi</span>
                </button>

                {/* Student Takeaway Reflection */}
                <button
                  onClick={() => setIsReflectionOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-50 to-emerald-50 hover:from-amber-100 hover:to-emerald-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all active:scale-95"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Em học được gì?</span>
                </button>

                {/* Share & QR Code */}
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-all active:scale-95"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>QR Code</span>
                </button>
              </div>
            </div>

            {/* IF USER ROLE IS TEACHER: Render Full Teacher Dashboard */}
            {userRole === 'teacher' ? (
              <div className="space-y-6">
                <TeacherDashboard
                  room={activeRoom}
                  onRefreshRoom={refreshActiveRoom}
                  onOpenShareModal={() => setIsShareModalOpen(true)}
                  onOpenCreateRoomModal={() => {
                    setRoomToEdit(null);
                    setIsCreateRoomModalOpen(true);
                  }}
                  onOpenEditRoomModal={() => handleOpenEditRoom(activeRoom)}
                  onRequestDeleteRoom={(r) =>
                    setRoomPendingDelete({ id: r.id, title: r.title, code: r.code })
                  }
                  onSwitchToStudentView={() => setUserRole('student')}
                  onOpenTeacherProfileModal={() => setIsTeacherProfileModalOpen(true)}
                  onOpenHallOfFameModal={() => setIsHallOfFameModalOpen(true)}
                  teacherProfile={teacherProfile}
                />

                {/* Below Teacher Dashboard, also show the interactive 3D exhibit for visual inspection */}
                <div className="pt-6 border-t border-emerald-200">
                  <h3 className="text-base md:text-lg font-display font-extrabold text-slate-900 mb-3">Xem trước không gian 3D của phòng</h3>
                  {viewMode3D ? (
                    <ExhibitionRoom3D
                      room={activeRoom}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onToggleViewMode={() => setViewMode3D(false)}
                      onChangeSpaceStyle={handleChangeSpaceStyle}
                    />
                  ) : (
                    <ExhibitionGallery2D
                      room={activeRoom}
                      userRole={userRole}
                      loggedInStudent={loggedInStudent}
                      studentIdentity={studentIdentity}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onQuickVote={(p) => setSelectedProduct(p)}
                      onAddProduct={handleStudentOpenAddProduct}
                      onEditProduct={handleStudentOpenEditProduct}
                      onDeleteProduct={handleStudentRequestDeleteProduct}
                    />
                  )}
                </div>
              </div>
            ) : (
              /* IF USER ROLE IS STUDENT: Render Main 3D Space or 2D Gallery */
              <div className="space-y-8">
                {viewMode3D ? (
                  <ExhibitionRoom3D
                    room={activeRoom}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onToggleViewMode={() => setViewMode3D(false)}
                    onChangeSpaceStyle={handleChangeSpaceStyle}
                  />
                ) : (
                  <ExhibitionGallery2D
                    room={activeRoom}
                    userRole={userRole}
                    loggedInStudent={loggedInStudent}
                    studentIdentity={studentIdentity}
                    onSelectProduct={(p) => setSelectedProduct(p)}
                    onQuickVote={(p) => setSelectedProduct(p)}
                    onAddProduct={handleStudentOpenAddProduct}
                    onEditProduct={handleStudentOpenEditProduct}
                    onDeleteProduct={handleStudentRequestDeleteProduct}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}

      {/* 1. Student Identity Modal */}
      {isIdentityModalOpen && (
        <StudentIdentityModal
          isOpen={isIdentityModalOpen}
          defaultClass={activeRoom?.className || '7/1'}
          onClose={() => setIsIdentityModalOpen(false)}
          onSubmit={handleSaveIdentity}
        />
      )}

      {/* 2. Product Detail Modal */}
      {selectedProduct && activeRoom && (
        <ProductDetailModal
          product={selectedProduct}
          room={activeRoom}
          currentUser={studentIdentity}
          loggedInStudent={loggedInStudent}
          isTeacherMode={userRole === 'teacher'}
          onRequireIdentity={() => setIsIdentityModalOpen(true)}
          onClose={() => setSelectedProduct(null)}
          onVoteSuccess={(prodId, voteType) => {
            handleVoteSuccess(prodId);
          }}
          onCommentSuccess={() => {
            refreshActiveRoom();
          }}
          onEditProduct={(prod) => {
            setSelectedProduct(null);
            handleStudentOpenEditProduct(prod);
          }}
          onDeleteProduct={(prod) => {
            handleStudentRequestDeleteProduct(prod);
          }}
        />
      )}

      {/* 3. Leaderboard Modal */}
      {isLeaderboardOpen && activeRoom && (
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          room={activeRoom}
          onClose={() => setIsLeaderboardOpen(false)}
          onSelectProduct={(id) => {
            const found = activeRoom.products.find((p) => p.id === id);
            if (found) setSelectedProduct(found);
          }}
        />
      )}

      {/* 4. My Group Lookup Modal */}
      {isMyGroupOpen && activeRoom && (
        <MyGroupModal
          isOpen={isMyGroupOpen}
          room={activeRoom}
          loggedInStudent={loggedInStudent}
          studentIdentity={studentIdentity}
          onClose={() => setIsMyGroupOpen(false)}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onOpenLogin={() => {
            setIsMyGroupOpen(false);
            setIsStudentLoginModalOpen(true);
          }}
          onAddProduct={() => {
            setIsMyGroupOpen(false);
            handleStudentOpenAddProduct();
          }}
          onEditProduct={(p) => {
            setIsMyGroupOpen(false);
            handleStudentOpenEditProduct(p);
          }}
          onDeleteProduct={(p) => {
            handleStudentRequestDeleteProduct(p);
          }}
        />
      )}

      {/* 5. Student Reflection Modal ("Em học được gì?") */}
      {isReflectionOpen && activeRoom && (
        <StudentReflectionModal
          isOpen={isReflectionOpen}
          room={activeRoom}
          currentUser={studentIdentity}
          onClose={() => setIsReflectionOpen(false)}
          onSubmitted={() => refreshActiveRoom()}
        />
      )}

      {/* 6. Share & QR Code Modal */}
      {isShareModalOpen && activeRoom && (
        <ShareAndQrModal
          isOpen={isShareModalOpen}
          room={activeRoom}
          onClose={() => setIsShareModalOpen(false)}
          onUpdatePrivacy={async (privacy) => {
            try {
              await fetch(`/api/rooms/${activeRoom.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ privacy }),
              });
              refreshActiveRoom();
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}

      {/* 7. Create / Edit Room Modal (Teacher mode only) */}
      {isCreateRoomModalOpen && userRole === 'teacher' && (
        <CreateRoomModal
          isOpen={isCreateRoomModalOpen}
          roomToEdit={roomToEdit}
          teacherProfile={teacherProfile}
          onClose={() => {
            setIsCreateRoomModalOpen(false);
            setRoomToEdit(null);
          }}
          onCreated={(newRoom) => {
            setActiveRoom(newRoom);
            setCurrentView('room');
            setUserRole('teacher');
            loadRoomsList();
          }}
          onUpdated={(updatedRoom) => {
            if (activeRoom?.id === updatedRoom.id) {
              setActiveRoom(updatedRoom);
            }
            loadRoomsList();
          }}
        />
      )}

      {/* 7b. Delete Room Confirmation Modal (Teacher mode only) */}
      {roomPendingDelete && userRole === 'teacher' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white border-2 border-rose-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Xác nhận xóa phòng trưng bày</h3>
                <p className="text-xs text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-slate-700 space-y-1">
              <p>
                Bạn có chắc muốn xóa phòng <strong className="text-slate-900">{roomPendingDelete.title}</strong>?
              </p>
              <p className="font-mono font-bold text-rose-700">Mã phòng: {roomPendingDelete.code}</p>
              <p className="text-slate-500">
                Toàn bộ sản phẩm, lượt bình chọn và nhận xét bên trong phòng sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingRoom}
                onClick={() => setRoomPendingDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeletingRoom}
                onClick={handleConfirmDeleteRoom}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-xs font-bold text-white flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeletingRoom ? 'Đang xóa...' : 'Xác nhận xóa phòng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7c. Delete Product Confirmation Modal (Student & Teacher) */}
      {studentProductPendingDelete && activeRoom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-white border-2 border-rose-300 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 border-2 border-rose-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-display font-extrabold text-slate-900">
                  Xác nhận xóa sản phẩm
                </h3>
                <p className="text-xs md:text-sm text-slate-500">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-sm text-slate-700 space-y-1.5">
              <p>
                Bạn có chắc muốn xóa sản phẩm{' '}
                <strong className="text-slate-900">{studentProductPendingDelete.title}</strong>?
              </p>
              <p className="text-xs text-slate-600">
                Nhóm/Tác giả: <strong>{studentProductPendingDelete.author}</strong>
                {studentProductPendingDelete.groupCode ? ` (${studentProductPendingDelete.groupCode})` : ''}
              </p>
            </div>

            {studentDeleteError && (
              <p className="text-sm text-rose-600 font-bold">{studentDeleteError}</p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingStudentProduct}
                onClick={() => {
                  setStudentDeleteError(null);
                  setStudentProductPendingDelete(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-sm font-bold text-slate-700"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeletingStudentProduct}
                onClick={handleConfirmDeleteStudentProduct}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:brightness-105 disabled:opacity-50 text-sm font-bold text-white flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingStudentProduct ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Student Account Login Modal */}
      {isStudentLoginModalOpen && (
        <StudentAccountLoginModal
          isOpen={isStudentLoginModalOpen}
          roomCode={activeRoom?.code || 'BIO-7A1'}
          onClose={() => setIsStudentLoginModalOpen(false)}
          onLoginSuccess={handleStudentLoginSuccess}
        />
      )}

      {/* 9. Student Add / Edit Product Modal */}
      {isStudentSubmitModalOpen && activeRoom && (
        <ProductFormModal
          isOpen={isStudentSubmitModalOpen}
          room={activeRoom}
          productToEdit={studentProductToEdit}
          studentAccount={loggedInStudent}
          isStudentMode={userRole === 'student'}
          onClose={() => {
            setIsStudentSubmitModalOpen(false);
            setStudentProductToEdit(null);
          }}
          onSaved={(savedProd) => {
            setIsStudentSubmitModalOpen(false);
            setStudentProductToEdit(null);
            refreshActiveRoom();
            setSelectedProduct(savedProd);
          }}
        />
      )}

      {/* 10. Teacher Profile Modal (Teacher mode only) */}
      {isTeacherProfileModalOpen && userRole === 'teacher' && (
        <TeacherProfileModal
          isOpen={isTeacherProfileModalOpen}
          profile={teacherProfile}
          isLoggedInGmail={true}
          onClose={() => setIsTeacherProfileModalOpen(false)}
          onUpdateProfile={(updated) => {
            setTeacherProfile(updated);
            refreshActiveRoom();
          }}
        />
      )}

      {/* 11. Hall of Fame Modal (Góc vinh danh) */}
      {isHallOfFameModalOpen && activeRoom && (
        <HallOfFameModal
          isOpen={isHallOfFameModalOpen}
          room={activeRoom}
          isTeacher={userRole === 'teacher'}
          onClose={() => setIsHallOfFameModalOpen(false)}
          onUpdateHallOfFame={handleUpdateHallOfFame}
          onSelectProduct={(prodId) => {
            const found = activeRoom.products.find((p) => p.id === prodId);
            if (found) {
              setIsHallOfFameModalOpen(false);
              setSelectedProduct(found);
            }
          }}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-emerald-200/80 bg-white/90 px-4 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-600">© 2026 BIOZONE 3D • Phòng Trưng Bày Tương Tác dành cho giáo viên & học sinh THCS</p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Khoa học tự nhiên • Sinh học</span>
            <span>•</span>
            <span>Tối ưu cho máy tính bảng, điện thoại & PC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
