// 正規ID（全ST APPS共通）。定義は src/shared/users.ts
export type { UserId } from './shared/users';
import type { UserId } from './shared/users';

export const USER_LABELS: Record<UserId, string> = {
  kenshin: 'けんしん',
  rena: 'れなちゃん',
};

export const USER_COLORS: Record<UserId, { from: string; to: string; text: string; badge: string }> = {
  kenshin: {
    from: 'from-violet-400',
    to: 'to-indigo-400',
    text: 'text-violet-600',
    badge: 'bg-violet-100 text-violet-600',
  },
  rena: {
    from: 'from-pink-400',
    to: 'to-rose-400',
    text: 'text-rose-600',
    badge: 'bg-rose-100 text-rose-600',
  },
};

export type Category = '食べ物' | '飲み物' | '場所' | 'プレゼント' | 'コミュニケーション' | '地雷' | '喜びポイント';

export const CATEGORIES: Category[] = [
  '食べ物', '飲み物', '場所', 'プレゼント', 'コミュニケーション', '地雷', '喜びポイント',
];

export const CATEGORY_CONFIG: Record<Category, { emoji: string; bg: string; text: string }> = {
  '食べ物':         { emoji: '🍽️', bg: 'bg-orange-100', text: 'text-orange-700' },
  '飲み物':         { emoji: '🥤', bg: 'bg-sky-100',    text: 'text-sky-700' },
  '場所':           { emoji: '📍', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'プレゼント':     { emoji: '🎁', bg: 'bg-pink-100',   text: 'text-pink-700' },
  'コミュニケーション': { emoji: '💬', bg: 'bg-violet-100', text: 'text-violet-700' },
  '地雷':           { emoji: '💣', bg: 'bg-red-100',    text: 'text-red-700' },
  '喜びポイント':   { emoji: '✨', bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

export type Rating = 'like' | 'maybe' | 'dislike' | 'ng' | 'conditional';

export const RATINGS: Record<Rating, { label: string; emoji: string; bg: string; text: string; border: string }> = {
  like:        { label: '好き',    emoji: '❤️',  bg: 'bg-rose-50',   text: 'text-rose-600',   border: 'border-rose-200' },
  maybe:       { label: 'まあ好き', emoji: '👍',  bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200' },
  dislike:     { label: '苦手',    emoji: '😬',  bg: 'bg-gray-50',   text: 'text-gray-500',   border: 'border-gray-200' },
  ng:          { label: 'NG',      emoji: '🚫',  bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  conditional: { label: '条件付き', emoji: '⚡', bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200' },
};

export const RATING_ORDER: Rating[] = ['like', 'maybe', 'dislike', 'ng', 'conditional'];

export interface KonomiItem {
  id: string;
  userId: UserId;
  name: string;
  category: Category;
  rating: Rating;
  condition?: string;
  memo?: string;
  learnedAt: number;
  createdAt: number;
}
