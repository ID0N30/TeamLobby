

export enum Platform {
  PC = 'PC',
  PS5 = 'PS5',
  XBOX = 'Xbox Series X',
  SWITCH = 'Switch'
}

export enum GameGenre {
  ACTION = 'Action',
  ADVENTURE = 'Adventure',
  RPG = 'RPG',
  SHOOTER = 'Shooter',
  STRATEGY = 'Strategy',
  SIMULATION = 'Simulation',
  SPORTS = 'Sports',
  RACING = 'Racing',
  PLATFORMER = 'Platformer',
  FIGHTING = 'Fighting',
  HORROR = 'Horror',
  SURVIVAL = 'Survival',
  PUZZLE = 'Puzzle',
  SANDBOX = 'Sandbox',
  ROGUELIKE = 'Roguelike',
  INDIE = 'Indie',
  MULTIPLAYER = 'Multiplayer',
  CASUAL = 'Casual'
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface Game {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  genre: GameGenre;
  platforms: Platform[];
  votedBy: Record<string, boolean> | string[];
  tags: string[];
  link?: string;
  proposedBy?: string;
  status?: 'pending' | 'approved';
  // Fix: Firebase Realtime Database stores nested collections as objects (Maps), 
  // so we use Record<string, Comment> instead of Comment[] to match the incoming data structure and prevent spread errors.
  comments?: Record<string, Comment>;
}

export interface User {
  id: string;
  alias: string;
  nickname?: string;
  email?: string; 
  avatarUrl: string;
  platforms: Platform[];
  isReady: boolean;
  isGuest?: boolean; 
  isAdmin?: boolean; 
  isBanned?: boolean;
  isMuted?: boolean;
  score?: number;
  isOnline?: boolean;
  playerCode?: string;
  showcasePrivacy?: ShowcasePrivacy;
}

export type ShowcasePrivacy = 'public' | 'friends' | 'private';

export interface ShowcaseTrophies {
  isPlatinum?: boolean;
  isHardcore?: boolean;
  isSpeedrun?: boolean;
  isNoHit?: boolean;
  isCoop?: boolean;
  coopFriendAlias?: string;
  customBadges?: string[];
}

export interface ShowcaseComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: number;
}

export type GameStatus = 'completed' | 'playing' | '100_percent' | 'backlog' | 'on_hold' | 'dropped';

export interface ShowcaseGame {
  id: string;
  gameTitle: string;
  imageUrl: string;
  genre: GameGenre;
  platform: Platform;
  status: GameStatus;
  difficulty?: 'easy' | 'normal' | 'hard' | 'nightmare' | 'custom';
  customDifficulty?: string;
  trophies?: ShowcaseTrophies;
  notes?: string;
  rating?: number; // 1 to 5
  completedAt?: number;
  privacy?: ShowcasePrivacy;
  comments?: Record<string, ShowcaseComment>;
}

export type FriendshipStatus = 'pending_sent' | 'pending_received' | 'accepted';

export interface Friendship {
  friendId: string;
  alias: string;
  avatarUrl: string;
  playerCode: string;
  status: FriendshipStatus;
  createdAt: number;
}

export interface GamerChallenge {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId: string;
  toUserName: string;
  gameTitle: string;
  gameImageUrl: string;
  challengeGoal: string;
  status: 'pending' | 'accepted' | 'completed' | 'declined';
  createdAt: number;
  completedAt?: number;
  notes?: string;
}

export interface Message {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface ReadySession {
  type: 'roulette' | 'voting';
  status: 'idle' | 'collecting' | 'results';
  suggestions: Record<string, { gameId: string, gameTitle: string, userName: string }>;
  votes: Record<string, string>; // voterId -> gameId
  winner?: string | string[]; // gameId or array of IDs if tie
  active: boolean;
}

export interface Room {
  code: string;
  name?: string;
  isPrivate?: boolean;
  password?: string;
  hostId: string;
  members: User[];
  gameQueue: Game[];
  chatHistory: Message[];
  createdAt: number;
  readySession?: ReadySession;
  activePresence?: Record<string, boolean>;
}

export interface RoomSummary {
  code: string;
  name: string;
  lastVisited: number;
  hostAlias: string;
  savedPassword?: string;
}

export type ViewState = 'LOBBY' | 'ADMIN' | 'PROFILE' | 'READY';

export interface UserSummary {
  id: string;
  alias: string;
  nickname?: string;
  avatarUrl: string;
  isAdmin?: boolean;
  isBanned?: boolean;
  isMuted?: boolean;
  playerCode?: string;
}
