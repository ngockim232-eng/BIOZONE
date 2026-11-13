export type SpaceStyle = 'classic' | 'science' | 'eco' | 'future' | 'classroom' | 'cultural' | 'custom';

export type VoteType = 'impressive' | 'creative' | 'good_idea' | 'favorite';

export interface VoteItem {
  studentName: string;
  studentClass?: string;
  voteType: VoteType;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  studentName: string;
  studentClass?: string;
  comment: string;
  reaction: '❤️' | '😊' | '👍' | '💡';
  createdAt: string;
  isPinned?: boolean;
  isHidden?: boolean;
}

export interface InteractiveQuestion {
  id: string;
  question: string;
}

export interface InteractiveAnswer {
  id: string;
  questionId: string;
  studentName: string;
  answer: string;
  createdAt: string;
}

export interface ExhibitionProduct {
  id: string;
  title: string;
  author: string;
  groupCode?: string;
  className?: string;
  subject?: string;
  theme?: string;
  description: string;
  idea: string;
  process: string;
  result: string;
  highlights?: string;
  message?: string;
  teacherAdvisor?: string;
  primaryImage: string;
  images: string[];
  videoUrl?: string;
  views: number;
  likes: number;
  interactiveQuestions?: InteractiveQuestion[];
  votes: VoteItem[];
  comments: CommentItem[];
  answers: InteractiveAnswer[];
  submittedByStudentId?: string; // If submitted by student account
}

export interface VisitorReflection {
  id: string;
  studentName: string;
  studentClass?: string;
  mostImpressive: string;
  whatILearned: string;
  favoriteProduct: string;
  ideaToTry: string;
  createdAt: string;
}

export interface StudentAccount {
  id: string;
  username: string; // e.g. hs01, hs02, dung.le
  password: string; // easy password, e.g. 123456
  name: string;
  className: string;
  roomCode: string;
  createdAt: string;
  productCount?: number;
}

export interface TeacherProfile {
  id?: string;
  email: string;
  name: string;
  avatar?: string;
  titleHonor?: string; // e.g. Giáo viên Sinh học - KHTN
  schoolName: string;
  phone?: string;
  bio?: string;
  subjectExpertise?: string;
  joinedDate?: string;
}

export interface RoomHallOfFame {
  welcomeBanner?: string;
  topTeamHonorTitle?: string;
  topTeamName?: string;
  topTeamProjectTitle?: string;
  teacherCommendation?: string;
  honoredAwardDate?: string;
}

export interface GalleryRoom {
  id: string;
  code: string;
  title: string;
  theme: string;
  description: string;
  teacherName: string;
  teacherEmail?: string;
  schoolName: string;
  className: string;
  spaceStyle: SpaceStyle;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed';
  privacy: 'public' | 'code_only' | 'private';
  maxVotesPerStudent: number;
  showLeaderboard: boolean;
  visitorCount: number;
  createdAt: string;
  reflections: VisitorReflection[];
  products: ExhibitionProduct[];
  hallOfFame?: RoomHallOfFame;
}

export interface RoomSummary {
  id: string;
  code: string;
  title: string;
  theme: string;
  description: string;
  teacherName: string;
  teacherEmail?: string;
  schoolName: string;
  className: string;
  spaceStyle: SpaceStyle;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed';
  privacy: 'public' | 'code_only' | 'private';
  productCount: number;
  visitorCount: number;
  totalVotes: number;
  createdAt: string;
}
