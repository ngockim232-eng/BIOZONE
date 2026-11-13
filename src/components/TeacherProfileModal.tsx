import React, { useState, useEffect } from 'react';
import { TeacherProfile } from '../types';
import { Mail, User, School, Phone, BookOpen, Award, CheckCircle2, X, Sparkles } from 'lucide-react';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TeacherProfile;
  onUpdateProfile: (updated: TeacherProfile) => void;
  onTeacherLoginGoogle?: () => void;
  isLoggedInGmail?: boolean;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onTeacherLoginGoogle,
  isLoggedInGmail,
}) => {
  const [name, setName] = useState(profile.name || 'Cô Trần Thị Kim Ngọc');
  const [email, setEmail] = useState(profile.email || 'ngockim232@gmail.com');
  const [titleHonor, setTitleHonor] = useState(profile.titleHonor || 'Giáo viên KHTN - Sinh học');
  const [schoolName, setSchoolName] = useState(profile.schoolName || 'Trường PTDTBT TH&THCS Lý Tự Trọng');
  const [phone, setPhone] = useState(profile.phone || '0379197677');
  const [subjectExpertise, setSubjectExpertise] = useState(
    profile.subjectExpertise || 'Khoa học tự nhiên (Sinh học), STEM Sinh thái, Vi sinh vật & Tế bào học'
  );
  const [bio, setBio] = useState(
    profile.bio || 'Cử nhân Sư phạm Sinh học'
  );
  const [avatar, setAvatar] = useState(
    profile.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setName(profile.name || 'Cô Trần Thị Kim Ngọc');
    setEmail(profile.email || 'ngockim232@gmail.com');
    setTitleHonor(profile.titleHonor || 'Giáo viên KHTN - Sinh học');
    setSchoolName(profile.schoolName || 'Trường PTDTBT TH&THCS Lý Tự Trọng');
    setPhone(profile.phone || '0379197677');
    setSubjectExpertise(
      profile.subjectExpertise || 'Khoa học tự nhiên (Sinh học), STEM Sinh thái, Vi sinh vật & Tế bào học'
    );
    setBio(profile.bio || 'Cử nhân Sư phạm Sinh học');
    setAvatar(
      profile.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'
    );
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const updated: TeacherProfile = {
      name: name.trim(),
      email: email.trim(),
      titleHonor: titleHonor.trim(),
      schoolName: schoolName.trim(),
      phone: phone.trim(),
      subjectExpertise: subjectExpertise.trim(),
      bio: bio.trim(),
      avatar: avatar.trim()
    };

    try {
      const res = await fetch('/api/teacher-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        onUpdateProfile(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/35 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white border-2 border-emerald-200 rounded-3xl p-6 shadow-2xl flex flex-col text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Hồ sơ & Cài đặt thông tin Giáo viên</h3>
              <p className="text-xs text-slate-500">
                Thông tin xuất hiện trên các phòng triển lãm Biozone và chứng nhận vinh danh
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 py-4 space-y-4">
          {/* Gmail Auth status badge */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-slate-900 block">Tài khoản Gmail giáo viên</span>
                <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                  ● {email}
                </span>
              </div>
            </div>

            {onTeacherLoginGoogle && (
              <button
                type="button"
                onClick={onTeacherLoginGoogle}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-xs text-emerald-700 font-bold border border-emerald-200 flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Đổi tài khoản Gmail</span>
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã lưu cập nhật thông tin giáo viên thành công!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên giáo viên:</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Chức danh / Môn giảng dạy:</label>
              <input
                type="text"
                value={titleHonor}
                onChange={(e) => setTitleHonor(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trường học công tác:</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lĩnh vực chuyên môn & Đề tài yêu thích:</label>
            <input
              type="text"
              value={subjectExpertise}
              onChange={(e) => setSubjectExpertise(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Giới thiệu ngắn (Bio):</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl p-3 border border-emerald-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Link ảnh đại diện giáo viên (URL):</label>
            <input
              type="text"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-slate-50 text-xs text-slate-800 rounded-xl px-3.5 py-2.5 border border-emerald-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-emerald-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md active:scale-95"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thông tin giáo viên'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
