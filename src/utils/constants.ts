import { SpaceStyle } from '../types';

export interface ThemeOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgGradient: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'bio-stem',
    name: '🧬 BIOZONE – SINH HỌC & TẾ BÀO',
    icon: '🧬',
    color: 'from-emerald-500 to-teal-500',
    bgGradient: 'bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 border-emerald-300',
    description: 'Sinh học THCS: Tế bào học, quang hợp, hô hấp, cơ thể sinh vật và di truyền'
  },
  {
    id: 'stem',
    name: '🔬 STEM & SÁNG TẠO KHOA HỌC',
    icon: '🔬',
    color: 'from-sky-500 to-indigo-500',
    bgGradient: 'bg-gradient-to-br from-sky-100 via-cyan-50 to-indigo-100 border-sky-300',
    description: 'Khoa học tự nhiên liên môn, kỹ thuật vi sinh, vật liệu sinh học'
  },
  {
    id: 'environment',
    name: '🌱 HỆ SINH THÁI & MÔI TRƯỜNG',
    icon: '🌱',
    color: 'from-green-500 to-emerald-500',
    bgGradient: 'bg-gradient-to-br from-lime-100 via-emerald-50 to-green-100 border-green-300',
    description: 'Chuỗi thức ăn, lưới thức ăn, đa dạng sinh học và bảo vệ rừng cây'
  },
  {
    id: 'human-body',
    name: '🫀 GIẢI PHẪU & SỨC KHỎE CON NGƯỜI',
    icon: '🫀',
    color: 'from-rose-500 to-pink-500',
    bgGradient: 'bg-gradient-to-br from-rose-100 via-pink-50 to-orange-100 border-rose-300',
    description: 'Hệ tuần hoàn, hệ tiêu hóa, dinh dưỡng học đường và lối sống khỏe mạnh'
  },
  {
    id: 'botany-micro',
    name: '🔬 THỰC VẬT & VI SINH VẬT',
    icon: '🌿',
    color: 'from-teal-500 to-emerald-500',
    bgGradient: 'bg-gradient-to-br from-teal-100 via-emerald-50 to-lime-100 border-teal-300',
    description: 'Mô hình tiêu bản kính hiển vi, vi khuẩn có lợi, nấm men, thủy canh'
  },
  {
    id: 'history',
    name: '🏛️ LỊCH SỬ KHOA HỌC',
    icon: '🏛️',
    color: 'from-amber-500 to-orange-500',
    bgGradient: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border-amber-300',
    description: 'Lịch sử phát minh kính hiển vi, học thuyết Mendel, Darwin'
  },
  {
    id: 'geography',
    name: '🌏 SINH ĐỊA & HẢI DƯƠNG',
    icon: '🌏',
    color: 'from-cyan-500 to-sky-500',
    bgGradient: 'bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100 border-cyan-300',
    description: 'Các đới khí hậu, thảm thực vật địa phương và san hô biển đảo'
  },
  {
    id: 'arts',
    name: '🎨 NGHỆ THUẬT SINH HỌC (BIO-ART)',
    icon: '🎨',
    color: 'from-fuchsia-500 to-pink-500',
    bgGradient: 'bg-gradient-to-br from-fuchsia-100 via-pink-50 to-rose-100 border-fuchsia-300',
    description: 'Vẽ tranh tiêu bản tế bào, ép hoa lá khô, mô hình ADN nghệ thuật'
  },
  {
    id: 'tech',
    name: '🧑💻 CÔNG NGHỆ SINH HỌC 4.0',
    icon: '🧑💻',
    color: 'from-sky-500 to-cyan-500',
    bgGradient: 'bg-gradient-to-br from-sky-100 via-teal-50 to-cyan-100 border-sky-300',
    description: 'Cảm biến giám sát cây trồng, IoT nông nghiệp thông minh'
  },
  {
    id: 'custom',
    name: '🌈 CHỦ ĐỀ TỰ CHỌN',
    icon: '🌈',
    color: 'from-violet-500 to-pink-500',
    bgGradient: 'bg-gradient-to-br from-violet-100 via-amber-50 to-pink-100 border-violet-300',
    description: 'Chủ đề tùy biến linh hoạt theo từng bài học môn KHTN THCS'
  }
];

export interface SpaceStyleConfig {
  id: SpaceStyle;
  name: string;
  icon: string;
  description: string;
  badge: string;
  floorColor: number;
  wallColor: number;
  ceilingColor: number;
  lightColor: number;
  accentColor: number;
  accentHex: string;
  cssBackground: string;
  pedestalColor: number;
}

export const SPACE_STYLES: Record<SpaceStyle, SpaceStyleConfig> = {
  eco: {
    id: 'eco',
    name: '🌿 BIOZONE – PHÒNG SINH THÁI & THỰC VẬT',
    icon: '🌿',
    description: 'Không gian sinh học xanh tươi, sàn vân rêu đá, giàn cây cối tự nhiên, ánh sáng lục diệp mát dịu',
    badge: 'Biozone Sinh thái THCS',
    floorColor: 0x1f3822,
    wallColor: 0x0f2214,
    ceilingColor: 0x08160c,
    lightColor: 0xd4ffdb,
    accentColor: 0x22c55e,
    accentHex: '#22c55e',
    cssBackground: 'from-emerald-100 via-teal-50 to-sky-50',
    pedestalColor: 0x13301a
  },
  science: {
    id: 'science',
    name: '🧬 PHÒNG THÍ NGHIỆM SINH HỌC VI THỂ',
    icon: '🔬',
    description: 'Phòng thực hành KHTN với kính hiển vi, chuỗi ADN phát sáng, tiêu bản hiển vi, ánh sáng lam ngọc',
    badge: 'Lab Sinh học & Vi sinh',
    floorColor: 0x112836,
    wallColor: 0x0a1b24,
    ceilingColor: 0x051016,
    lightColor: 0xa5f3fc,
    accentColor: 0x06b6d4,
    accentHex: '#06b6d4',
    cssBackground: 'from-cyan-100 via-sky-50 to-white',
    pedestalColor: 0x0f2f3e
  },
  classroom: {
    id: 'classroom',
    name: '🏫 PHÒNG HỌC KHOA HỌC TỰ NHIÊN',
    icon: '🏫',
    description: 'Lớp học Sinh học thân thiện, bảng từ xanh phấn trắng, sa bàn sinh thái, mô hình giải phẫu',
    badge: 'Lớp học Sinh học THCS',
    floorColor: 0x263327,
    wallColor: 0x142017,
    ceilingColor: 0x0c140e,
    lightColor: 0xfffaed,
    accentColor: 0x84cc16,
    accentHex: '#84cc16',
    cssBackground: 'from-lime-100 via-emerald-50 to-white',
    pedestalColor: 0x1e3321
  },
  future: {
    id: 'future',
    name: '🌌 CÔNG NGHỆ SINH HỌC TƯƠNG LAI',
    icon: '🌌',
    description: 'Bio-tech Sci-Fi, ánh sáng hologram xanh sinh thái, mô phỏng gen và công nghệ sinh học vũ trụ',
    badge: 'Công nghệ sinh học 4.0',
    floorColor: 0x0f2930,
    wallColor: 0x07171c,
    ceilingColor: 0x030d10,
    lightColor: 0x99f6e4,
    accentColor: 0x14b8a6,
    accentHex: '#14b8a6',
    cssBackground: 'from-teal-100 via-cyan-50 to-sky-50',
    pedestalColor: 0x0c3138
  },
  classic: {
    id: 'classic',
    name: '🏛️ BẢO TÀNG SINH VẬT & LỊCH SỬ TỰ NHIÊN',
    icon: '🏛️',
    description: 'Bảo tàng tiêu bản động thực vật, hóa thạch tự nhiên cổ điển, ánh sáng trưng bày bảo tàng ấm áp',
    badge: 'Bảo tàng Lịch sử Tự nhiên',
    floorColor: 0x3d3024,
    wallColor: 0x221a13,
    ceilingColor: 0x140e0a,
    lightColor: 0xffeedd,
    accentColor: 0xeab308,
    accentHex: '#eab308',
    cssBackground: 'from-amber-100 via-orange-50 to-white',
    pedestalColor: 0x38291c
  },
  cultural: {
    id: 'cultural',
    name: '🏺 VƯỜN THỰC THẢO DƯỢC DÂN TỘC',
    icon: '🏺',
    description: 'Không gian cây thuốc nam học đường, thảo dược cổ truyền, kiến trúc tre nứa và gốm nung',
    badge: 'Vườn thuốc Nam học đường',
    floorColor: 0x332318,
    wallColor: 0x21140d,
    ceilingColor: 0x120a06,
    lightColor: 0xffe4cc,
    accentColor: 0xf97316,
    accentHex: '#f97316',
    cssBackground: 'from-orange-100 via-amber-50 to-white',
    pedestalColor: 0x3b2112
  },
  custom: {
    id: 'custom',
    name: '✨ KHÔNG GIAN SÁNG TẠO SINH HỌC TỰ DO',
    icon: '✨',
    description: 'Không gian tùy chỉnh với ánh sáng dạ quang huỳnh quang sinh học (bioluminescence) tuyệt đẹp',
    badge: 'Huỳnh quang sinh học Bio-Glow',
    floorColor: 0x162b24,
    wallColor: 0x0c1c17,
    ceilingColor: 0x06110e,
    lightColor: 0xccfbf1,
    accentColor: 0x10b981,
    accentHex: '#10b981',
    cssBackground: 'from-emerald-100 via-sky-50 to-amber-50',
    pedestalColor: 0x12362b
  }
};

export const VOTE_CONFIGS = [
  {
    type: 'impressive' as const,
    label: '⭐ Rất ấn tượng',
    shortLabel: 'Rất ấn tượng',
    icon: '⭐',
    color: 'text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100'
  },
  {
    type: 'creative' as const,
    label: '👍 Sáng tạo',
    shortLabel: 'Sáng tạo',
    icon: '👍',
    color: 'text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
  },
  {
    type: 'good_idea' as const,
    label: '💡 Ý tưởng hay',
    shortLabel: 'Ý tưởng hay',
    icon: '💡',
    color: 'text-sky-800 bg-sky-50 border-sky-200 hover:bg-sky-100'
  },
  {
    type: 'favorite' as const,
    label: '❤️ Yêu thích',
    shortLabel: 'Yêu thích',
    icon: '❤️',
    color: 'text-rose-800 bg-rose-50 border-rose-200 hover:bg-rose-100'
  }
];

export const FUN_NICKNAMES = [
  'Nhà sinh thái nhí',
  'Kỹ sư sinh học 4.0',
  'Nhà vi sinh trẻ tuổi',
  'Hiệp sĩ bảo vệ rừng',
  'Bác sĩ thực vật',
  'Nhà thám hiểm đại dương',
  'Nhà thực vật học nhí',
  'Chuyên gia tế bào học'
];
