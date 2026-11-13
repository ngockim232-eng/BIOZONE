import express, { type Request, type Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Initialize Gemini SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'exhibitions.json');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'student_accounts.json');
const TEACHER_PROFILE_FILE = path.join(DATA_DIR, 'teacher_profile.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default teacher profile
const initialTeacherProfile = {
  email: 'ngockim232@gmail.com',
  name: 'Cô Trần Thị Kim Ngọc',
  titleHonor: 'Giáo viên KHTN - Sinh học',
  schoolName: 'Trường PTDTBT TH&THCS Lý Tự Trọng',
  phone: '0379197677',
  bio: 'Cử nhân Sư phạm Sinh học',
  subjectExpertise: 'Khoa học tự nhiên (Sinh học), STEM Sinh thái, Vi sinh vật & Tế bào học',
  avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80'
};

// Seed data with "BIOZONE- KHÔNG GIAN SÁNG TẠO SINH HỌC"
const initialSeedRooms = [
  {
    id: 'room-biozone-7a1',
    code: 'BIO-7A1',
    title: 'BIOZONE- KHÔNG GIAN SÁNG TẠO SINH HỌC',
    theme: '🧬 BIOZONE – SINH HỌC & TẾ BÀO',
    description: 'Không gian triển lãm số 3D dành riêng cho các dự án KHTN THCS',
    teacherName: 'Cô Trần Thị Kim Ngọc',
    teacherEmail: 'ngockim232@gmail.com',
    schoolName: 'Trường PTDTBT TH&THCS Lý Tự Trọng',
    className: '7/1',
    spaceStyle: 'eco', // 'eco' | 'science' | 'classroom' | 'future' | 'classic' | 'cultural' | 'custom'
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    status: 'active',
    privacy: 'public',
    maxVotesPerStudent: 3,
    showLeaderboard: true,
    visitorCount: 248,
    createdAt: new Date().toISOString(),
    hallOfFame: {
      welcomeBanner: 'Vinh danh tinh thần say mê khám phá thế giới sinh vật học của học sinh',
      topTeamHonorTitle: 'CÚP VÀNG SÁNG TẠO BIOZONE 2026',
      topTeamName: 'Nhóm Sinh Thái Xanh',
      topTeamProjectTitle: 'Mô hình hệ sinh thái tuần hoàn',
      teacherCommendation: 'Khen ngợi nhóm đã có tư duy mô hình hóa chu trình sinh địa hóa xuất sắc, tính thực tiễn cao và khả năng tự cân bằng độ ẩm ấn tượng trong 30 ngày.',
      honoredAwardDate: '2026-11-10'
    },
    reflections: [
      {
        id: 'ref-1',
        studentName: 'Trần Minh Khang',
        studentClass: '7/2',
        mostImpressive: 'Mô hình tế bào thực vật 3D và hệ sinh thái tuần hoàn.',
        whatILearned: 'Hiểu được cấu trúc không bào, lục lạp và chu trình quang hợp sinh oxy trong tế bào lá cây.',
        favoriteProduct: 'Mô hình cấu trúc tế bào thực vật 3D từ đất sét sinh học',
        ideaToTry: 'Em muốn thử làm tiêu bản biểu bì củ hành tím để quan sát dưới kính hiển vi tại nhà.',
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
      {
        id: 'ref-2',
        studentName: 'Lê Thùy Dung',
        studentClass: '7/1',
        mostImpressive: 'Các bạn thuyết minh rất tự tin và mô hình nuôi cấy nấm men hoạt động thật.',
        whatILearned: 'Hiểu được vai trò của nấm men trong lên men đường tạo bọt khí CO2 và làm bánh mì.',
        favoriteProduct: 'Thí nghiệm lên men nấm men Saccharomyces cerevisiae',
        ideaToTry: 'Cùng nhóm bạn làm vườn rau mầm khí canh mini trên ban công lớp học.',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      }
    ],
    products: [
      {
        id: 'prod-bio-1',
        title: 'Mô hình cấu trúc tế bào thực vật 3D từ đất sét sinh học',
        author: 'Nhóm Tế Bào Sống (Minh Anh, Tuấn Kiệt)',
        groupCode: 'BIO-01',
        className: '7/1',
        subject: 'Khoa học tự nhiên (Sinh học 7)',
        theme: 'TẾ BÀO HỌC & DI TRUYỀN',
        description: 'Mô hình giải phẫu chi tiết tế bào thực vật có lát cắt nhìn thấu lục lạp, không bào trung tâm, nhân tế bào và màng xenlulôzơ.',
        idea: 'Xuất phát từ bài học quan sát tế bào dưới kính hiển vi, nhóm muốn biến hình ảnh 2D trên sách giáo khoa thành mô hình 3D sờ nắm trực quan.',
        process: 'Bước 1: Tạo khuôn màng tế bào bằng thạch agar và đất sét tự khô an toàn.\nBước 2: Nặn các bào quan: lục lạp có các hạt grana xếp lớp, ti thể, lưới nội chất hạt, nhân tế bào chứa chất nhiễm sắc.\nBước 3: Gắn đèn LED dạ quang mô phỏng dòng vận chuyển chất tế bào chất.\nBước 4: Gắn thẻ chú thích tên khoa học từng bào quan.',
        result: 'Mô hình trực quan tỷ lệ phóng đại x10.000 lần, giúp cả lớp ghi nhớ ngay 8 bào quan chính chỉ sau 5 phút.',
        highlights: 'Có hệ thống đèn LED phân tầng các bào quan và tương tác lật mở xem cấu trúc bên trong lục lạp.',
        message: 'Tế bào là đơn vị cơ sở kỳ diệu cấu tạo nên mọi sự sống trên Trái Đất.',
        teacherAdvisor: 'Cô Trần Thị Kim Ngọc',
        primaryImage: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1000&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        views: 215,
        likes: 64,
        interactiveQuestions: [
          { id: 'q-bio-1', question: 'Tại sao tế bào thực vật có hình đa giác cố định còn tế bào động vật thì không?' },
          { id: 'q-bio-2', question: 'Bào quan nào đóng vai trò chuyển hóa quang năng thành hóa năng trong mô hình?' }
        ],
        votes: [
          { studentName: 'Võ Minh Quân', studentClass: '7/3', voteType: 'impressive', createdAt: new Date(Date.now() - 86400000).toISOString() },
          { studentName: 'Đặng Mai Lan', studentClass: '7/1', voteType: 'creative', createdAt: new Date(Date.now() - 72000000).toISOString() },
          { studentName: 'Bùi Hải Đăng', studentClass: '7/2', voteType: 'favorite', createdAt: new Date(Date.now() - 36000000).toISOString() },
          { studentName: 'Nguyễn Thảo Ly', studentClass: '7/4', voteType: 'impressive', createdAt: new Date(Date.now() - 18000000).toISOString() }
        ],
        comments: [
          {
            id: 'c-1',
            studentName: 'Hoàng Quốc Bảo',
            studentClass: '7/2',
            comment: 'Lục lạp nặn màu xanh ngọc rất đẹp! Các bạn chú thích tên bào quan rất rõ ràng.',
            reaction: '❤️',
            createdAt: new Date(Date.now() - 36000000).toISOString(),
            isPinned: true,
          }
        ],
        answers: [
          {
            id: 'ans-1',
            questionId: 'q-bio-1',
            studentName: 'Hoàng Quốc Bảo',
            answer: 'Vì tế bào thực vật có thành tế bào dày cấu tạo từ xenlulôzơ giúp nâng đỡ và cố định hình dạng.',
            createdAt: new Date(Date.now() - 36000000).toISOString(),
          }
        ]
      },
      {
        id: 'prod-bio-2',
        title: 'Mô hình hệ sinh thái tuần hoàn & chu trình Cacbon',
        author: 'Nhóm Sinh Thái Xanh (Thanh Hằng, Đức Phúc, Gia Huy)',
        groupCode: 'BIO-02',
        className: '7/1',
        subject: 'Khoa học tự nhiên (Sinh học)',
        theme: 'MÔI TRƯỜNG & SINH THÁI',
        description: 'Mô hình sinh thái khép kín mô phỏng chu trình nước, cacbon và chuỗi thức ăn trong đầm lầy nhiệt đới thu nhỏ.',
        idea: 'Xuất phát từ bài học về chu trình sinh địa hóa, nhóm muốn tạo ra một sinh cảnh mini tự duy trì sự sống mà không cần can thiệp thường xuyên từ bên ngoài.',
        process: 'Bước 1: Chuẩn bị bể kính, lớp sỏi thoát nước, than hoạt tính, đất dinh dưỡng.\nBước 2: Trồng các loài rêu, dương xỉ và thả vi sinh vật có lợi.\nBước 3: Thiết lập hệ thống phun sương tuần hoàn và đèn LED quang hợp hẹn giờ.\nBước 4: Theo dõi và ghi nhật ký sinh trưởng trong 4 tuần.',
        result: 'Hệ thống duy trì độ ẩm ổn định 85%, cây cối phát triển xanh tốt, chu trình nước tự bốc hơi ngưng tụ thành giọt mưa nhân tạo.',
        highlights: 'Khả năng tự cân bằng độ ẩm và chu trình quang hợp 100% tự nhiên không cần tưới nước trong 30 ngày.',
        message: 'Bảo vệ từng mắt xích nhỏ nhất trong tự nhiên chính là bảo vệ sự sống của Trái Đất.',
        teacherAdvisor: 'Cô Trần Thị Kim Ngọc',
        primaryImage: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?auto=format&fit=crop&w=1000&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        views: 198,
        likes: 58,
        interactiveQuestions: [
          { id: 'q1', question: 'Theo em, tại sao than hoạt tính lại quan trọng trong chu trình lọc đất kín?' }
        ],
        votes: [
          { studentName: 'Trịnh Nhật Minh', studentClass: '7/2', voteType: 'creative', createdAt: new Date(Date.now() - 60000000).toISOString() },
          { studentName: 'Vũ Ngọc Hân', studentClass: '7/4', voteType: 'good_idea', createdAt: new Date(Date.now() - 40000000).toISOString() },
          { studentName: 'Ngô Đức Trí', studentClass: '7/1', voteType: 'impressive', createdAt: new Date(Date.now() - 20000000).toISOString() }
        ],
        comments: [
          {
            id: 'c-3',
            studentName: 'Trịnh Nhật Minh',
            studentClass: '7/2',
            comment: 'Mô hình rất mát mắt và sống động, rất hợp với chủ đề Biozone!',
            reaction: '👍',
            createdAt: new Date(Date.now() - 50000000).toISOString(),
            isPinned: true
          }
        ],
        answers: []
      },
      {
        id: 'prod-bio-3',
        title: 'Vườn rau thủy canh hồi lưu mini tự động quang hợp',
        author: 'Nhóm BioTech (Tuấn Kiệt, Minh Anh, Gia Huy)',
        groupCode: 'BIO-03',
        className: '7/1',
        subject: 'Sinh học & Công nghệ',
        theme: 'CÔNG NGHỆ SINH HỌC 4.0',
        description: 'Mô hình giàn trồng rau xà lách thủy canh trong phòng học sử dụng dung dịch dinh dưỡng hữu cơ và đèn LED quang hợp chuyên dụng.',
        idea: 'Nghiên cứu tốc độ sinh trưởng của thực vật khi được cung cấp đầy đủ quang phổ xanh đỏ (450nm - 660nm) trong môi trường không dùng đất.',
        process: 'Bước 1: Pha chế dung dịch dinh dưỡng Knop loãng nồng độ PPM 600.\nBước 2: Ươm hạt rau muống và xà lách mầm trong giá thể xơ dừa tiệt trùng.\nBước 3: Lắp đặt bơm tuần hoàn hẹn giờ 15 phút tưới - 45 phút nghỉ.\nBước 4: Đo chỉ số diện tích lá và chiều cao rễ mỗi tuần.',
        result: 'Rau phát triển nhanh hơn 35% so với trồng đất thông thường, rễ trắng muốt không sâu bệnh.',
        highlights: 'Hệ sinh thái thủy canh khép kín, sạch 100% không dùng thuốc bảo vệ thực vật.',
        message: 'Nông nghiệp đô thị công nghệ cao vì bữa ăn an toàn học đường.',
        teacherAdvisor: 'Cô Trần Thị Kim Ngọc',
        primaryImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1000&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        views: 184,
        likes: 51,
        interactiveQuestions: [
          { id: 'q-bio-3', question: 'Tại sao rễ cây trong hệ thủy canh cần có khoảng nghỉ để tiếp xúc với không khí?' }
        ],
        votes: [
          { studentName: 'Đặng Tuấn Anh', studentClass: '7/1', voteType: 'good_idea', createdAt: new Date(Date.now() - 40000000).toISOString() },
          { studentName: 'Trần Hải Vy', studentClass: '7/3', voteType: 'impressive', createdAt: new Date(Date.now() - 10000000).toISOString() }
        ],
        comments: [],
        answers: []
      },
      {
        id: 'prod-bio-4',
        title: 'Mô hình giải phẫu tim & hệ tuần hoàn kép ở người',
        author: 'Nhóm Y Sinh Nhí (Quang Huy, Bảo Ngọc)',
        groupCode: 'BIO-04',
        className: '7/1',
        subject: 'Khoa học tự nhiên (Cơ thể người)',
        theme: 'GIẢI PHẪU & SỨC KHỎE',
        description: 'Mô hình thủy lực mô phỏng dòng máu đỏ giàu oxy và máu đỏ thẫm giàu CO2 lưu thông qua 4 ngăn tim và 2 vòng tuần hoàn.',
        idea: 'Giúp học sinh dễ hiểu con đường đi của vòng tuần hoàn lớn (nuôi cơ thể) và vòng tuần hoàn nhỏ (trao đổi khí ở phổi).',
        process: 'Bước 1: Đúc tim 4 ngăn (2 tâm nhĩ, 2 tâm thất) và hệ van tim 1 chiều.\nBước 2: Dùng 2 ống màu đỏ và xanh dẫn dung dịch màu mô phỏng máu.\nBước 3: Lắp xi-lanh trợ lực bóp nhịp nhàng mô phỏng pha co tâm nhĩ và tâm thất.\nBước 4: Thử nghiệm lưu lượng dòng chảy và áp lực van tim.',
        result: 'Mô phỏng chân thực nhịp đập tim 75 lần/phút, van tổ chim và van nhĩ thất đóng mở chuẩn xác.',
        highlights: 'Van tim 1 chiều tự chế hoạt động hoàn hảo ngăn dòng máu chảy ngược.',
        message: 'Trái tim khỏe mạnh bắt đầu từ chế độ vận động và ăn uống khoa học.',
        teacherAdvisor: 'Cô Trần Thị Kim Ngọc',
        primaryImage: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1000&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        views: 160,
        likes: 47,
        interactiveQuestions: [
          { id: 'q-bio-4', question: 'Máu ở nửa bên trái của quả tim là máu giàu oxy hay nghèo oxy?' }
        ],
        votes: [
          { studentName: 'Vũ Đức Thịnh', studentClass: '7/2', voteType: 'creative', createdAt: new Date(Date.now() - 30000000).toISOString() }
        ],
        comments: [],
        answers: []
      },
      {
        id: 'prod-bio-5',
        title: 'Bộ sưu tập tiêu bản giải phẫu thực vật & lá cây ép khô',
        author: 'Nhóm Thực Vật Trẻ (Phương Linh, Khánh Huyền, Đăng Khoa)',
        groupCode: 'BIO-05',
        className: '7/1',
        subject: 'Mỹ thuật & Sinh học (Bio-Art)',
        theme: 'NGHỆ THUẬT SINH HỌC',
        description: 'Bộ sưu tập 30 tiêu bản hiển vi khí khổng lá thài lài tía, gân lá bồ đề và tranh nghệ thuật sinh thái bảo tồn đa dạng thực vật.',
        idea: 'Kết hợp mỹ thuật ứng dụng và kiến thức sinh học hình thái lá để tạo nên những tác phẩm trưng bày lưu niệm học đường.',
        process: 'Bước 1: Thu thập mẫu lá đa dạng hình thái (lá kép, lá đơn, gân lá song song và hình mạng).\nBước 2: Xử lý khử diệp lục bằng dung dịch kiềm loãng an toàn để giữ lại bộ khung gân lá.\nBước 3: Nhuộm màu thực phẩm hữu cơ và ép chân không tiêu bản.\nBước 4: Đóng khung gỗ kèm mã QR tra cứu tên khoa học từng loài cây.',
        result: 'Tạo nên 30 tiêu bản nghệ thuật tuyệt đẹp bền vững không phai màu theo năm tháng.',
        highlights: 'Giữ nguyên 100% mạng lưới mạch rây và mạch gỗ tinh xảo của gân lá tự nhiên.',
        message: 'Mỗi chiếc lá rơi đều là một kỳ quan kiến trúc của Mẹ Thiên Nhiên.',
        teacherAdvisor: 'Cô Trần Thị Kim Ngọc',
        primaryImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        views: 175,
        likes: 54,
        interactiveQuestions: [
          { id: 'q-bio-5', question: 'Mặt dưới của lá cây thường có nhiều khí khổng hơn mặt trên có ý nghĩa thích nghi gì?' }
        ],
        votes: [
          { studentName: 'Nguyễn Bích Ngọc', studentClass: '7/4', voteType: 'favorite', createdAt: new Date(Date.now() - 50000000).toISOString() }
        ],
        comments: [],
        answers: []
      },
      {
        id: 'prod-bio-6',
        title: 'Mô hình bảo vệ rạn san hô & rừng ngập mặn sinh thái',
        author: 'Nhóm Vì Biển Đảo (Thanh Hằng, Mai Anh)',
        groupCode: 'BIO-06',
        className: '7/1',
        subject: 'Sinh học & Địa lí',
        theme: 'HỆ SINH THÁI & MÔI TRƯỜNG',
        description: 'Mô hình sa bàn động sinh học chứng minh rạn san hô và rừng ngập mặn là lá chắn sống giảm 70% sóng biển triều cường.',
        idea: 'Nâng cao ý thức bảo vệ tài nguyên sinh vật biển đảo thiêng liêng của Tổ quốc Việt Nam.',
        process: 'Bước 1: Đắp sa bàn thềm lục địa và bãi bồi ven biển.\nBước 2: Đan hệ rễ chân nơm của cây đước bằng sợi dừa tự nhiên.\nBước 3: Tạo sóng nhân tạo để quan sát khả năng tiêu giảm áp lực nước.\nBước 4: Ghi nhận số liệu thực nghiệm khoa học.',
        result: 'Chứng minh rễ đước giữ lại hơn 80% trầm tích phù sa và che chở cho ấu trùng tôm cá.',
        highlights: 'Thực nghiệm trực quan sống động với cơ cấu tạo sóng cơ học.',
        message: 'Rừng đước giữ bờ, san hô chở che đại dương Tổ quốc.',
        teacherAdvisor: 'Cô Trần Thị Kim Ngọc',
        primaryImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80',
        images: [
          'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80'
        ],
        videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
        views: 188,
        likes: 62,
        interactiveQuestions: [
          { id: 'q-bio-6', question: 'Hệ rễ chân nơm của cây đước giúp cây đứng vững thế nào trong môi trường bùn lầy ven biển?' }
        ],
        votes: [
          { studentName: 'Trần Duy Anh', studentClass: '7/3', voteType: 'good_idea', createdAt: new Date(Date.now() - 15000000).toISOString() }
        ],
        comments: [],
        answers: []
      }
    ]
  }
];

// Seed initial student accounts for room BIO-7A1
const initialStudentAccounts = [
  { id: 'acc-1', username: 'hs01', password: '123', name: 'Trần Minh Khang', className: '7/1', roomCode: 'BIO-7A1', createdAt: new Date().toISOString() },
  { id: 'acc-2', username: 'hs02', password: '123', name: 'Lê Thùy Dung', className: '7/1', roomCode: 'BIO-7A1', createdAt: new Date().toISOString() },
  { id: 'acc-3', username: 'hs03', password: '123', name: 'Nhóm Tế Bào Sống', className: '7/1', roomCode: 'BIO-7A1', createdAt: new Date().toISOString() },
  { id: 'acc-4', username: 'hs04', password: '123', name: 'Nhóm Sinh Thái Xanh', className: '7/1', roomCode: 'BIO-7A1', createdAt: new Date().toISOString() },
  { id: 'acc-5', username: 'hs05', password: '123', name: 'Hoàng Quốc Bảo', className: '7/2', roomCode: 'BIO-7A1', createdAt: new Date().toISOString() },
  { id: 'acc-6', username: 'hs06', password: '123', name: 'Vũ Ngọc Hân', className: '7/4', roomCode: 'BIO-7A1', createdAt: new Date().toISOString() }
];

// Helper functions for reading and writing data
function readRooms(): any[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeedRooms, null, 2), 'utf-8');
      return initialSeedRooms;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    const rooms = JSON.parse(data);
    // Ensure room title is BIOZONE- KHÔNG GIAN SÁNG TẠO SINH HỌC
    if (rooms.length > 0 && (!rooms[0].title.includes('BIOZONE') || !rooms[0].hallOfFame)) {
      rooms[0].title = 'BIOZONE- KHÔNG GIAN SÁNG TẠO SINH HỌC';
      rooms[0].code = 'BIO-7A1';
      rooms[0].spaceStyle = rooms[0].spaceStyle || 'eco';
      rooms[0].hallOfFame = rooms[0].hallOfFame || initialSeedRooms[0].hallOfFame;
      writeRooms(rooms);
    }
    return rooms;
  } catch (err) {
    console.error('Error reading rooms:', err);
    return initialSeedRooms;
  }
}

function writeRooms(rooms: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(rooms, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing rooms:', err);
  }
}

function readAccounts(): any[] {
  try {
    if (!fs.existsSync(ACCOUNTS_FILE)) {
      fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(initialStudentAccounts, null, 2), 'utf-8');
      return initialStudentAccounts;
    }
    const data = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading accounts:', err);
    return initialStudentAccounts;
  }
}

function writeAccounts(accounts: any[]) {
  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing accounts:', err);
  }
}

function readTeacherProfile(): any {
  try {
    if (!fs.existsSync(TEACHER_PROFILE_FILE)) {
      fs.writeFileSync(TEACHER_PROFILE_FILE, JSON.stringify(initialTeacherProfile, null, 2), 'utf-8');
      return initialTeacherProfile;
    }
    const data = fs.readFileSync(TEACHER_PROFILE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading teacher profile:', err);
    return initialTeacherProfile;
  }
}

function writeTeacherProfile(profile: any) {
  try {
    fs.writeFileSync(TEACHER_PROFILE_FILE, JSON.stringify(profile, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing teacher profile:', err);
  }
}

// REST API Endpoints

// 1. Get all public / active rooms
app.get('/api/rooms', (req: Request, res: Response) => {
  const rooms = readRooms();
  const summary = rooms.map(r => ({
    id: r.id,
    code: r.code,
    title: r.title,
    theme: r.theme,
    description: r.description,
    teacherName: r.teacherName,
    teacherEmail: r.teacherEmail,
    schoolName: r.schoolName,
    className: r.className,
    spaceStyle: r.spaceStyle,
    startDate: r.startDate,
    endDate: r.endDate,
    status: r.status,
    privacy: r.privacy,
    productCount: r.products?.length || 0,
    visitorCount: r.visitorCount || 0,
    totalVotes: r.products?.reduce((acc: number, p: any) => acc + (p.votes?.length || 0), 0) || 0,
    createdAt: r.createdAt
  }));
  res.json(summary);
});

// Helper: robust room lookup by id, code or legacy code
function findRoom(rooms: any[], idOrCode: string) {
  if (!idOrCode) return undefined;
  const clean = idOrCode.trim();
  const upper = clean.toUpperCase();
  return rooms.find(
    (r) =>
      r.id === clean ||
      r.code?.toUpperCase() === upper ||
      (upper === '7A1-STEM' && r.id === 'room-biozone-7a1') ||
      (upper === 'BIO-7A1' && r.id === 'room-biozone-7a1')
  );
}

// 2. Get room by code or id
app.get('/api/rooms/:code', (req: Request, res: Response) => {
  const rooms = readRooms();
  const room = findRoom(rooms, req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Không tìm thấy phòng triển lãm với mã này' });
  }

  // Check if room has expired
  if (room.endDate) {
    const today = new Date().toISOString().split('T')[0];
    if (today > room.endDate && room.status === 'active') {
      room.status = 'closed';
      writeRooms(rooms);
    }
  }

  res.json(room);
});

// 3. Create new room
app.post('/api/rooms', (req: Request, res: Response) => {
  const {
    title,
    code,
    theme,
    description,
    teacherName,
    teacherEmail,
    schoolName,
    className,
    spaceStyle,
    startDate,
    endDate,
    privacy,
    maxVotesPerStudent,
    showLeaderboard
  } = req.body;

  if (!title || !theme) {
    return res.status(400).json({ error: 'Vui lòng nhập tên phòng và chủ đề' });
  }

  const rooms = readRooms();
  const cleanCode = (code && code.trim().length > 0)
    ? code.trim().toUpperCase()
    : 'BIO-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  // Check duplicate code
  if (rooms.some(r => r.code.toUpperCase() === cleanCode)) {
    return res.status(400).json({ error: `Mã phòng "${cleanCode}" đã tồn tại. Vui lòng chọn mã khác.` });
  }

  const newRoom = {
    id: 'room-' + Date.now(),
    code: cleanCode,
    title,
    theme,
    description: description || '',
    teacherName: teacherName || 'Cô Trần Thị Kim Ngọc',
    teacherEmail: teacherEmail || 'ngockim232@gmail.com',
    schoolName: schoolName || 'Trường PTDTBT TH&THCS Lý Tự Trọng',
    className: className || '',
    spaceStyle: spaceStyle || 'eco',
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || '',
    status: 'active',
    privacy: privacy || 'public',
    maxVotesPerStudent: maxVotesPerStudent ? Number(maxVotesPerStudent) : 3,
    showLeaderboard: showLeaderboard !== false,
    visitorCount: 1,
    createdAt: new Date().toISOString(),
    hallOfFame: {
      welcomeBanner: `Góc vinh danh sáng tạo sinh học - ${title}`,
      topTeamHonorTitle: 'GIẢI NHẤT SÁNG TẠO SINH HỌC THCS',
      topTeamName: 'Đang cập nhật',
      topTeamProjectTitle: 'Dự án xuất sắc nhất',
      teacherCommendation: 'Khen ngợi tinh thần học tập và năng lực thực hành nghiên cứu của các em học sinh.',
      honoredAwardDate: new Date().toISOString().split('T')[0]
    },
    reflections: [],
    products: []
  };

  rooms.push(newRoom);
  writeRooms(rooms);
  res.status(201).json(newRoom);
});

// 4. Update room settings (including hallOfFame)
app.put('/api/rooms/:id', (req: Request, res: Response) => {
  const rooms = readRooms();
  const target = findRoom(rooms, req.params.id);
  const index = target ? rooms.findIndex(r => r.id === target.id) : -1;
  if (index === -1) {
    return res.status(404).json({ error: 'Không tìm thấy phòng triển lãm' });
  }

  const current = rooms[index];
  const nextCode = req.body.code ? String(req.body.code).trim().toUpperCase() : current.code;
  if (nextCode && rooms.some(r => r.id !== current.id && r.code?.toUpperCase() === nextCode)) {
    return res.status(400).json({ error: `Mã phòng "${nextCode}" đã tồn tại. Vui lòng chọn mã khác.` });
  }

  const updated = {
    ...current,
    ...req.body,
    id: current.id,
    code: nextCode,
    hallOfFame: req.body.hallOfFame ? { ...current.hallOfFame, ...req.body.hallOfFame } : current.hallOfFame
  };

  rooms[index] = updated;
  writeRooms(rooms);
  res.json(updated);
});

// 5. Delete room
app.delete('/api/rooms/:id', (req: Request, res: Response) => {
  let rooms = readRooms();
  const target = findRoom(rooms, req.params.id);
  if (!target) {
    return res.status(404).json({ error: 'Không tìm thấy phòng' });
  }
  rooms = rooms.filter(r => r.id !== target.id);
  writeRooms(rooms);
  res.json({ success: true, message: 'Đã xóa phòng thành công' });
});

// 6. Record visit
app.post('/api/rooms/:id/visit', (req: Request, res: Response) => {
  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (room) {
    room.visitorCount = (room.visitorCount || 0) + 1;
    writeRooms(rooms);
    res.json({ visitorCount: room.visitorCount });
  } else {
    res.status(404).json({ error: 'Phòng không tồn tại' });
  }
});

// 7. Add product to room (supports student upload as well)
app.post('/api/rooms/:id/products', (req: Request, res: Response) => {
  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Không tìm thấy phòng triển lãm' });
  }

  const {
    title,
    author,
    groupCode,
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
    primaryImage,
    images,
    videoUrl,
    interactiveQuestions,
    submittedByStudentId
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Tên sản phẩm là bắt buộc' });
  }

  const newProduct = {
    id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    title,
    author: author || 'Nhóm tác giả học sinh',
    groupCode: groupCode || '',
    className: className || room.className || '',
    subject: subject || 'Khoa học tự nhiên (Sinh học)',
    theme: theme || room.theme || 'BIOZONE – SINH HỌC & TẾ BÀO',
    description: description || '',
    idea: idea || '',
    process: process || '',
    result: result || '',
    highlights: highlights || '',
    message: message || '',
    teacherAdvisor: teacherAdvisor || room.teacherName || '',
    primaryImage: primaryImage || 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1000&q=80',
    images: Array.isArray(images) && images.length > 0 ? images : [primaryImage || 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=1000&q=80'],
    videoUrl: videoUrl || '',
    views: 0,
    likes: 0,
    interactiveQuestions: interactiveQuestions || [
      { id: 'q-default-1', question: 'Điểm sáng tạo hoặc kiến thức sinh học em ấn tượng nhất ở sản phẩm này là gì?' }
    ],
    votes: [],
    comments: [],
    answers: [],
    submittedByStudentId: submittedByStudentId || ''
  };

  room.products.push(newProduct);
  writeRooms(rooms);
  res.status(201).json(newProduct);
});

// Helper: check if student owns or belongs to product's group
function checkStudentProductOwnership(product: any, studentId: string): boolean {
  if (!studentId || !product) return false;
  if (product.submittedByStudentId && product.submittedByStudentId === studentId) {
    return true;
  }
  const accounts = readAccounts();
  const acc = accounts.find((a: any) => a.id === studentId);
  if (!acc) return false;

  if (
    product.groupCode &&
    acc.username &&
    String(product.groupCode).trim().toUpperCase() === `BIO-${String(acc.username).trim().toUpperCase()}`
  ) {
    return true;
  }
  const accName = String(acc.name || '').trim().toLowerCase();
  const prodAuthor = String(product.author || '').trim().toLowerCase();
  if (accName.length >= 2 && prodAuthor.includes(accName)) {
    return true;
  }
  return false;
}

// 8. Update product
app.put('/api/rooms/:id/products/:productId', (req: Request, res: Response) => {
  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng' });

  const pIndex = room.products.findIndex((p: any) => p.id === req.params.productId);
  if (pIndex === -1) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

  const current = room.products[pIndex];
  const requesterRole = req.headers['x-user-role'] || req.body?.requesterRole;
  const requesterStudentId = String(req.headers['x-student-id'] || req.body?.requesterStudentId || '');

  if (requesterRole === 'student') {
    if (!checkStudentProductOwnership(current, requesterStudentId)) {
      return res.status(403).json({ error: 'Bạn chỉ có thể chỉnh sửa sản phẩm của nhóm mình!' });
    }
  }

  const { requesterRole: _r, requesterStudentId: _s, ...productFields } = req.body || {};

  room.products[pIndex] = {
    ...current,
    ...productFields,
    id: current.id,
    votes: current.votes,
    comments: current.comments,
    answers: current.answers
  };

  writeRooms(rooms);
  res.json(room.products[pIndex]);
});

// 9. Reorder products
app.put('/api/rooms/:id/reorder-products', (req: Request, res: Response) => {
  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng' });

  const { productIds } = req.body;
  if (Array.isArray(productIds)) {
    const map = new Map(room.products.map((p: any) => [p.id, p]));
    const reordered: any[] = [];
    for (const id of productIds) {
      if (map.has(id)) reordered.push(map.get(id));
    }
    for (const p of room.products) {
      if (!reordered.some(r => r.id === p.id)) reordered.push(p);
    }
    room.products = reordered;
    writeRooms(rooms);
  }
  res.json(room.products);
});

// 10. Delete product
app.delete('/api/rooms/:id/products/:productId', (req: Request, res: Response) => {
  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (!room) return res.status(404).json({ error: 'Không tìm thấy phòng' });

  const target = room.products.find((p: any) => p.id === req.params.productId);
  if (!target) return res.status(404).json({ error: 'Không tìm thấy sản phẩm' });

  const requesterRole = req.headers['x-user-role'] || req.query?.requesterRole;
  const requesterStudentId = String(req.headers['x-student-id'] || req.query?.requesterStudentId || '');

  if (requesterRole === 'student') {
    if (!checkStudentProductOwnership(target, requesterStudentId)) {
      return res.status(403).json({ error: 'Bạn chỉ có thể xóa sản phẩm của nhóm mình!' });
    }
  }

  room.products = room.products.filter((p: any) => p.id !== req.params.productId);
  writeRooms(rooms);
  res.json({ success: true, message: 'Đã xóa sản phẩm' });
});

// 11. Vote for product
app.post('/api/rooms/:id/products/:productId/vote', (req: Request, res: Response) => {
  const { studentName, studentClass, voteType } = req.body;
  if (!studentName || !voteType) {
    return res.status(400).json({ error: 'Vui lòng cung cấp tên học sinh và loại bình chọn' });
  }

  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (!room) return res.status(404).json({ error: 'Phòng không tồn tại' });

  if (room.status === 'closed') {
    return res.status(400).json({ error: 'Phòng triển lãm hiện đã đóng bình chọn' });
  }

  const product = room.products.find((p: any) => p.id === req.params.productId);
  if (!product) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });

  const maxVotes = room.maxVotesPerStudent || 3;
  let studentTotalVotes = 0;
  for (const p of room.products) {
    const existing = (p.votes || []).find((v: any) => v.studentName?.toLowerCase() === studentName.toLowerCase().trim());
    if (existing) studentTotalVotes++;
  }

  const alreadyVotedThis = (product.votes || []).some(
    (v: any) => v.studentName?.toLowerCase() === studentName.toLowerCase().trim()
  );

  if (alreadyVotedThis) {
    return res.status(400).json({ error: 'Bạn đã bình chọn cho sản phẩm này rồi!' });
  }

  if (studentTotalVotes >= maxVotes) {
    return res.status(400).json({
      error: `Bạn đã dùng hết ${maxVotes} lượt bình chọn cho phòng này theo quy định của giáo viên.`
    });
  }

  const newVote = {
    studentName: studentName.trim(),
    studentClass: studentClass?.trim() || '',
    voteType,
    createdAt: new Date().toISOString()
  };

  product.votes = product.votes || [];
  product.votes.push(newVote);
  product.likes = (product.likes || 0) + 1;

  writeRooms(rooms);
  res.json({ success: true, product, totalVotesForStudent: studentTotalVotes + 1, remainingVotes: maxVotes - (studentTotalVotes + 1) });
});

// 12. Add comment
app.post('/api/rooms/:id/products/:productId/comment', (req: Request, res: Response) => {
  const { studentName, studentClass, comment, reaction } = req.body;
  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung nhận xét' });
  }

  const finalName = (studentName && String(studentName).trim()) ? String(studentName).trim() : 'Học sinh tham quan';
  const finalClass = (studentClass && String(studentClass).trim()) ? String(studentClass).trim() : '';

  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (!room) return res.status(404).json({ error: 'Phòng không tồn tại' });

  const product = room.products.find((p: any) => p.id === req.params.productId);
  if (!product) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });

  const newComment = {
    id: 'c-' + Date.now(),
    studentName: finalName,
    studentClass: finalClass,
    comment: comment.trim(),
    reaction: reaction || '❤️',
    createdAt: new Date().toISOString(),
    isPinned: false,
    isHidden: false
  };

  product.comments = product.comments || [];
  product.comments.unshift(newComment); // Prepend so it shows at the top

  writeRooms(rooms);
  res.json({ success: true, comment: newComment, totalComments: product.comments.length });
});

// 12b. Update space style (Live 3D style switching)
app.patch('/api/rooms/:id/style', (req: Request, res: Response) => {
  const { spaceStyle } = req.body;
  if (!spaceStyle) return res.status(400).json({ error: 'Thiếu thông tin spaceStyle' });
  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (!room) return res.status(404).json({ error: 'Phòng không tồn tại' });

  room.spaceStyle = spaceStyle;
  writeRooms(rooms);
  res.json({ success: true, spaceStyle: room.spaceStyle, room });
});

// 13. Manage comment
app.patch('/api/rooms/:id/comments/:commentId', (req: Request, res: Response) => {
  const { action } = req.body;
  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (!room) return res.status(404).json({ error: 'Phòng không tồn tại' });

  let found = false;
  for (const product of room.products) {
    if (!product.comments) continue;
    const cIndex = product.comments.findIndex((c: any) => c.id === req.params.commentId);
    if (cIndex !== -1) {
      found = true;
      if (action === 'delete') {
        product.comments.splice(cIndex, 1);
      } else if (action === 'pin') {
        product.comments[cIndex].isPinned = true;
      } else if (action === 'unpin') {
        product.comments[cIndex].isPinned = false;
      } else if (action === 'hide') {
        product.comments[cIndex].isHidden = true;
      } else if (action === 'unhide') {
        product.comments[cIndex].isHidden = false;
      }
      break;
    }
  }

  if (!found) return res.status(404).json({ error: 'Không tìm thấy nhận xét' });

  writeRooms(rooms);
  res.json({ success: true });
});

// 14. Answer interactive question
app.post('/api/rooms/:id/products/:productId/answer', (req: Request, res: Response) => {
  const { questionId, studentName, answer } = req.body;
  if (!questionId || !studentName || !answer) {
    return res.status(400).json({ error: 'Vui lòng trả lời câu hỏi đầy đủ' });
  }

  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (!room) return res.status(404).json({ error: 'Phòng không tồn tại' });

  const product = room.products.find((p: any) => p.id === req.params.productId);
  if (!product) return res.status(404).json({ error: 'Sản phẩm không tồn tại' });

  const newAns = {
    id: 'ans-' + Date.now(),
    questionId,
    studentName: studentName.trim(),
    answer: answer.trim(),
    createdAt: new Date().toISOString()
  };

  product.answers = product.answers || [];
  product.answers.push(newAns);

  writeRooms(rooms);
  res.json({ success: true, answer: newAns });
});

// 15. Student reflection
app.post('/api/rooms/:id/reflections', (req: Request, res: Response) => {
  const { studentName, studentClass, mostImpressive, whatILearned, favoriteProduct, ideaToTry } = req.body;
  if (!studentName || !whatILearned) {
    return res.status(400).json({ error: 'Vui lòng chia sẻ điều em đã học được' });
  }

  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (!room) return res.status(404).json({ error: 'Phòng không tồn tại' });

  const ref = {
    id: 'ref-' + Date.now(),
    studentName: studentName.trim(),
    studentClass: studentClass?.trim() || '',
    mostImpressive: mostImpressive || '',
    whatILearned: whatILearned.trim(),
    favoriteProduct: favoriteProduct || '',
    ideaToTry: ideaToTry || '',
    createdAt: new Date().toISOString()
  };

  room.reflections = room.reflections || [];
  room.reflections.push(ref);

  writeRooms(rooms);
  res.json({ success: true, reflection: ref });
});

// 16. Record product view
app.post('/api/rooms/:id/products/:productId/view', (req: Request, res: Response) => {
  const rooms = readRooms();
  const room = findRoom(rooms, req.params.id);
  if (room) {
    const product = room.products.find((p: any) => p.id === req.params.productId);
    if (product) {
      product.views = (product.views || 0) + 1;
      writeRooms(rooms);
      return res.json({ views: product.views });
    }
  }
  res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
});

// ============================================
// STUDENT ACCOUNTS & BATCH GENERATION ENDPOINTS
// ============================================

// Get all student accounts for a room
app.get('/api/rooms/:code/student-accounts', (req: Request, res: Response) => {
  const roomCode = req.params.code.trim().toUpperCase();
  const accounts = readAccounts();
  const roomAccounts = accounts.filter(a => a.roomCode?.toUpperCase() === roomCode);
  res.json(roomAccounts);
});

// Student login endpoint
app.post('/api/student-auth/login', (req: Request, res: Response) => {
  const { username, password, roomCode } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
  }

  const accounts = readAccounts();
  const user = accounts.find(
    a => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password.trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu học sinh!' });
  }

  if (roomCode && user.roomCode && user.roomCode.toUpperCase() !== roomCode.trim().toUpperCase()) {
    // If account was created for specific room, warn or assign
  }

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    className: user.className,
    roomCode: user.roomCode || roomCode
  });
});

// Create single student account
app.post('/api/rooms/:code/student-accounts', (req: Request, res: Response) => {
  const roomCode = req.params.code.trim().toUpperCase();
  const { username, password, name, className } = req.body;

  if (!username || !name) {
    return res.status(400).json({ error: 'Tên đăng nhập và họ tên học sinh là bắt buộc' });
  }

  const accounts = readAccounts();
  const cleanUsername = username.trim().toLowerCase();

  if (accounts.some(a => a.username.toLowerCase() === cleanUsername)) {
    return res.status(400).json({ error: `Tên đăng nhập "${cleanUsername}" đã tồn tại. Vui lòng chọn tên khác.` });
  }

  const newAccount = {
    id: 'acc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    username: cleanUsername,
    password: password?.trim() || '123456',
    name: name.trim(),
    className: className?.trim() || '7/1',
    roomCode,
    createdAt: new Date().toISOString()
  };

  accounts.push(newAccount);
  writeAccounts(accounts);
  res.status(201).json(newAccount);
});

// Batch create student accounts (Cấp tài khoản hàng loạt cho học sinh)
app.post('/api/rooms/:code/student-accounts/batch', (req: Request, res: Response) => {
  const roomCode = req.params.code.trim().toUpperCase();
  const { count, prefix, defaultPassword, className, namesList } = req.body;

  const accounts = readAccounts();
  const numCount = Math.min(60, Math.max(1, Number(count) || 10));
  const pre = (prefix || 'hs').trim().toLowerCase();
  const defPass = defaultPassword?.trim() || '123456';
  const cName = className?.trim() || '7/1';

  const createdList: any[] = [];
  const existingUsernames = new Set(accounts.map(a => a.username.toLowerCase()));

  // If namesList provided (split by newlines or commas)
  if (Array.isArray(namesList) && namesList.length > 0) {
    namesList.forEach((rawName, i) => {
      const cleanName = String(rawName).trim();
      if (!cleanName) return;

      let idx = i + 1;
      let uname = `${pre}${idx < 10 ? '0' + idx : idx}`;
      while (existingUsernames.has(uname)) {
        idx++;
        uname = `${pre}${idx < 10 ? '0' + idx : idx}`;
      }
      existingUsernames.add(uname);

      const acc = {
        id: 'acc-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 4),
        username: uname,
        password: defPass,
        name: cleanName,
        className: cName,
        roomCode,
        createdAt: new Date().toISOString()
      };
      createdList.push(acc);
      accounts.push(acc);
    });
  } else {
    // Generate sequential accounts
    for (let i = 1; i <= numCount; i++) {
      let idx = i;
      let uname = `${pre}${idx < 10 ? '0' + idx : idx}`;
      while (existingUsernames.has(uname)) {
        idx++;
        uname = `${pre}${idx < 10 ? '0' + idx : idx}`;
      }
      existingUsernames.add(uname);

      const acc = {
        id: 'acc-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 4),
        username: uname,
        password: defPass,
        name: `Học sinh ${idx}`,
        className: cName,
        roomCode,
        createdAt: new Date().toISOString()
      };
      createdList.push(acc);
      accounts.push(acc);
    }
  }

  writeAccounts(accounts);
  res.status(201).json({ success: true, count: createdList.length, accounts: createdList });
});

// Delete student account
app.delete('/api/rooms/:code/student-accounts/:id', (req: Request, res: Response) => {
  let accounts = readAccounts();
  accounts = accounts.filter(a => a.id !== req.params.id);
  writeAccounts(accounts);
  res.json({ success: true, message: 'Đã xóa tài khoản học sinh' });
});

// ============================================
// TEACHER PROFILE SETTINGS & GMAIL AUTH
// ============================================

// Get teacher profile
app.get('/api/teacher-profile', (req: Request, res: Response) => {
  const profile = readTeacherProfile();
  res.json(profile);
});

// Update teacher profile
app.put('/api/teacher-profile', (req: Request, res: Response) => {
  const current = readTeacherProfile();
  const updated = {
    ...current,
    ...req.body
  };
  writeTeacherProfile(updated);

  // Sync teacher info to rooms owned by this teacher
  const rooms = readRooms();
  let changed = false;
  rooms.forEach(r => {
    if (r.teacherEmail === updated.email || !r.teacherEmail) {
      r.teacherName = updated.name;
      r.teacherEmail = updated.email;
      r.schoolName = updated.schoolName || r.schoolName;
      changed = true;
    }
  });
  if (changed) writeRooms(rooms);

  res.json(updated);
});

// ============================================
// GEMINI AI INTEGRATION ENDPOINTS FOR TEACHER
// ============================================

// AI 1: Gợi ý chủ đề triển lãm Sinh học THCS
app.post('/api/ai/suggest-topics', async (req: Request, res: Response) => {
  try {
    const { grade, subject } = req.body;
    const prompt = `Bạn là chuyên gia cố vấn phương pháp dạy học môn Khoa học tự nhiên (phân môn Sinh học) THCS Việt Nam.
Hãy gợi ý 6 chủ đề triển lãm Biozone sinh học hấp dẫn, phù hợp lứa tuổi học sinh lớp ${grade || '7'}, môn ${subject || 'Sinh học & KHTN'}.
Các chủ đề tập trung vào: Tế bào học, Quang hợp, Hô hấp, Đa dạng sinh vật, Cơ thể người, Hệ sinh thái, Thực vật và Bio-Art.
Với mỗi chủ đề, đưa ra:
- Tên chủ đề ngắn gọn, mang phong cách "BIOZONE"
- Mô tả ý nghĩa sư phạm (2 câu)
- 3 ví dụ sản phẩm học sinh có thể tự chế tạo trưng bày
Trả về định dạng JSON thuần túy (Array of objects) có cấu trúc:
[
  {
    "title": "Tên chủ đề",
    "themeTag": "Tên danh mục",
    "description": "Mô tả ý nghĩa...",
    "examples": ["Ví dụ 1", "Ví dụ 2", "Ví dụ 3"]
  }
]
Không bao gồm markdown backticks ngoài JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '[]');
    res.json({ topics: parsed });
  } catch (err: any) {
    console.error('AI suggest topics error:', err);
    res.status(500).json({ error: 'Không thể tạo gợi ý chủ đề: ' + (err.message || 'Lỗi kết nối AI') });
  }
});

// AI 2: Viết lời giới thiệu phòng triển lãm
app.post('/api/ai/generate-intro', async (req: Request, res: Response) => {
  try {
    const { title, theme, className, teacherName, schoolName } = req.body;
    const prompt = `Viết một lời chào mừng và giới thiệu khai mạc cho phòng triển lãm 3D:
- Tên phòng: ${title}
- Chủ đề: ${theme}
- Lớp: ${className || 'Học sinh THCS'}
- Giáo viên hướng dẫn: ${teacherName}
- Trường: ${schoolName}

Yêu cầu: Lời văn truyền cảm hứng về thế giới sinh vật học kỳ diệu, khích lệ tinh thần nghiên cứu khoa học, súc tích (khoảng 120-180 từ).
Trả về JSON: { "intro": "Nội dung lời giới thiệu..." }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI generate intro error:', err);
    res.status(500).json({ error: 'Không thể tạo lời giới thiệu: ' + err.message });
  }
});

// AI 3: Viết chú thích & thuyết minh sản phẩm
app.post('/api/ai/generate-caption', async (req: Request, res: Response) => {
  try {
    const { title, subject, roughIdea } = req.body;
    const prompt = `Viết nội dung thuyết minh sư phạm chuyên nghiệp cho sản phẩm học tập Sinh học & KHTN THCS:
- Tên sản phẩm: ${title}
- Môn học: ${subject || 'Sinh học / KHTN 7'}
- Ý tưởng sơ lược: ${roughIdea || 'Sản phẩm sáng tạo từ học sinh'}

Hãy hoàn thiện các mục sau:
1. "description": Mô tả tổng quan ngắn gọn (2-3 câu).
2. "idea": Nguồn gốc ý tưởng và lý do nhóm học sinh chọn đề tài sinh học này.
3. "process": 4 bước thực hiện ngắn gọn, rõ ràng theo quy trình nghiên cứu khoa học / thiết kế kỹ thuật.
4. "highlights": 1-2 điểm nổi bật nhất của sản phẩm.
5. "message": Thông điệp bảo vệ sự sống / môi trường sinh thái.

Trả về JSON thuần túy có các key: { "description", "idea", "process", "highlights", "message" }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI generate caption error:', err);
    res.status(500).json({ error: 'Lỗi tạo chú thích: ' + err.message });
  }
});

// AI 4: Gợi ý câu hỏi tương tác cho học sinh
app.post('/api/ai/suggest-questions', async (req: Request, res: Response) => {
  try {
    const { productTitle, subject } = req.body;
    const prompt = `Gợi ý 3 câu hỏi gợi mở tư duy sinh học (về cấu tạo, chức năng, tính thích nghi, ứng dụng) để giáo viên THCS đặt cho học sinh khi tham quan sản phẩm "${productTitle}" (môn ${subject || 'Sinh học'}).
Trả về JSON: { "questions": ["Câu 1", "Câu 2", "Câu 3"] }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI suggest questions error:', err);
    res.status(500).json({ error: 'Lỗi tạo câu hỏi: ' + err.message });
  }
});

// AI 5: Tổng hợp nhận xét & cảm nhận của học sinh
app.post('/api/ai/summarize-feedback', async (req: Request, res: Response) => {
  try {
    const { comments, reflections } = req.body;
    const commentTexts = (comments || []).map((c: any) => `${c.studentName}: ${c.comment}`).join('\n');
    const refTexts = (reflections || []).map((r: any) => `${r.studentName} đã học được: ${r.whatILearned}. Thích nhất: ${r.mostImpressive}`).join('\n');

    const prompt = `Bạn là chuyên gia đánh giá học tập môn Sinh học THCS. Hãy tổng hợp nhận xét và cảm nhận của học sinh trong phòng triển lãm Biozone:
DANH SÁCH NHẬN XÉT:
${commentTexts || 'Chưa có nhận xét'}

GÓC HỌC ĐƯỢC GÌ:
${refTexts || 'Chưa có phản hồi'}

Trả về JSON:
{
  "generalSentiment": "Tích cực / Hào hứng / Say mê khám phá sinh học (2 câu)",
  "topPraisedAspects": ["Điểm được khen ngợi 1", "Điểm 2"],
  "commonConstructiveFeedback": ["Góp ý cải tiến hoặc thắc mắc khoa học"],
  "pedagogicalValue": "Đánh giá mức độ tiếp thu khái niệm sinh học và năng lực tìm tòi (2-3 câu)",
  "teacherAdvice": "Lời khuyên cho giáo viên để củng cố kiến thức trong tiết tổng kết"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI summarize feedback error:', err);
    res.status(500).json({ error: 'Lỗi tổng hợp phản hồi: ' + err.message });
  }
});

// AI 6: Viết báo cáo tổng kết triển lãm
app.post('/api/ai/generate-report', async (req: Request, res: Response) => {
  try {
    const { roomTitle, teacherName, schoolName, totalVisitors, totalVotes, totalComments, topProducts } = req.body;

    const prompt = `Viết bản BÁO CÁO TỔNG KẾT TRIỂN LÃM SẢN PHẨM SINH HỌC & STEM THCS hoàn chỉnh:
- Tên phòng: ${roomTitle}
- Giáo viên phụ trách: ${teacherName}
- Đơn vị: ${schoolName}
- Lượt tham quan: ${totalVisitors}
- Lượt bình chọn: ${totalVotes}
- Số nhận xét: ${totalComments}
- Sản phẩm tiêu biểu: ${JSON.stringify(topProducts || [])}

Cấu trúc báo cáo gồm:
1. Mục tiêu và ý nghĩa triển lãm Biozone
2. Kết quả thống kê tham gia và bình chọn
3. Đánh giá phẩm chất, năng lực tìm hiểu tự nhiên của học sinh THCS
4. Vinh danh các nhóm sản phẩm xuất sắc
5. Đề xuất phát triển góc sáng tạo sinh học cho các kỳ tiếp theo

Trả về JSON: { "reportMarkdown": "Toàn văn nội dung báo cáo bằng Markdown chuẩn..." }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('AI generate report error:', err);
    res.status(500).json({ error: 'Lỗi tạo báo cáo: ' + err.message });
  }
});

// Vite middleware or production static serving
async function setupViteOrStatic() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic().catch(err => {
  console.error('Failed to start server:', err);
});
