import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { v4 as uuidv4 } from 'uuid';
import { functions } from '../firebase';
import { saveItem } from '../utils/storage';
import type { KonomiItem, UserId } from '../types';

type Conditions = {
  mood: string;
  budget: string;
  place: string;
  time: string;
};

type Suggestion = {
  name: string;
  reason: string;
  memo: string;
};

type Props = {
  currentUser: UserId;
  onToast: (message: string, type: 'success' | 'error') => void;
};

const MOOD_OPTIONS = ['和食', '洋食', '中華', '何でも'];
const BUDGET_OPTIONS = ['〜2,000円', '〜4,000円', '〜8,000円', '制限なし'];
const PLACE_OPTIONS = ['家で作る', '近所で外食', '少し遠くてもOK'];
const TIME_OPTIONS = ['すぐ食べたい', '1時間以内', 'こだわりたい'];

type SelectorProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
};

function ConditionSelector({ label, options, value, onChange }: SelectorProps) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              value === opt
                ? 'bg-gradient-to-r from-pink-500 to-violet-500 text-white border-transparent shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 active:bg-gray-50'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DinnerSuggestScreen({ currentUser, onToast }: Props) {
  const [conditions, setConditions] = useState<Conditions>({
    mood: '何でも',
    budget: '〜4,000円',
    place: '近所で外食',
    time: '1時間以内',
  });
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decided, setDecided] = useState<Set<string>>(new Set());

  const set = (key: keyof Conditions) => (v: string) =>
    setConditions(c => ({ ...c, [key]: v }));

  async function suggest() {
    setLoading(true);
    setError(null);
    setSuggestions(null);
    setDecided(new Set());
    try {
      const fn = httpsCallable<{ conditions: Conditions }, { suggestions: Suggestion[] }>(
        functions,
        'suggestDinner',
      );
      const result = await fn({ conditions });
      setSuggestions(result.data.suggestions);
    } catch {
      setError('提案の取得に失敗しました。しばらく待ってから再試行してください。');
    } finally {
      setLoading(false);
    }
  }

  async function decide(suggestion: Suggestion) {
    const now = Date.now();
    const item: KonomiItem = {
      id: uuidv4(),
      userId: currentUser,
      name: suggestion.name,
      category: '食べ物',
      rating: 'like',
      memo: suggestion.reason,
      learnedAt: now,
      createdAt: now,
    };
    try {
      await saveItem(item);
      setDecided(prev => new Set(prev).add(suggestion.name));
      onToast(`「${suggestion.name}」を記録しました 🍽️`, 'success');
    } catch {
      onToast('記録に失敗しました', 'error');
    }
  }

  return (
    <div className="flex flex-col flex-1 pb-24">
      <div className="px-4 pt-4">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🍽️</div>
          <h1 className="text-lg font-extrabold text-gray-900">今夜のごはん提案</h1>
          <p className="text-xs text-gray-400 mt-1">2人の好みをもとにClaudeが提案します</p>
        </div>

        {/* Condition selectors */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <ConditionSelector label="今夜の気分" options={MOOD_OPTIONS} value={conditions.mood} onChange={set('mood')} />
          <ConditionSelector label="予算（ふたり合計目安）" options={BUDGET_OPTIONS} value={conditions.budget} onChange={set('budget')} />
          <ConditionSelector label="場所" options={PLACE_OPTIONS} value={conditions.place} onChange={set('place')} />
          <ConditionSelector label="時間" options={TIME_OPTIONS} value={conditions.time} onChange={set('time')} />
        </div>

        {/* CTA button */}
        <button
          onClick={suggest}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-bold text-base shadow-lg transition-all ${
            loading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : suggestions
                ? 'bg-gray-100 text-gray-600 active:bg-gray-200'
                : 'bg-gradient-to-r from-pink-500 to-violet-500 text-white active:scale-95'
          }`}
        >
          {loading
            ? '🤔 Claudeが考え中...'
            : suggestions
              ? '🔄 もう一度提案してもらう'
              : '🍽️ 今夜のごはんを提案してもらう'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10">
          <div className="text-3xl mb-3 animate-bounce">🍳</div>
          <p className="text-sm font-medium text-gray-500">2人の好みを分析中...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Suggestion cards */}
      {suggestions && !loading && (
        <div className="px-4 mt-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-400 text-center">Claude からの提案 ✨</p>
          {suggestions.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base font-bold text-gray-900">{s.name}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                  案{i + 1}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">{s.reason}</p>
              {s.memo && (
                <p className="text-xs text-violet-600 bg-violet-50 rounded-xl px-3 py-2 leading-relaxed mb-3">
                  💡 {s.memo}
                </p>
              )}
              {decided.has(s.name) ? (
                <div className="flex items-center justify-center gap-1.5 py-2.5 text-sm text-emerald-600 font-bold bg-emerald-50 rounded-xl">
                  <span>✅</span>
                  <span>記録しました！</span>
                </div>
              ) : (
                <button
                  onClick={() => decide(s)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-pink-500 to-violet-500 text-white active:scale-95 transition-transform"
                >
                  🎉 これに決めた！
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
