import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { KonomiItem, UserId, Category, Rating } from '../types';
import { CATEGORIES, CATEGORY_CONFIG, RATINGS, RATING_ORDER, USER_LABELS } from '../types';

type Props = {
  currentUser: UserId;
  editItem?: KonomiItem;
  onSave: (item: KonomiItem) => void;
  onClose: () => void;
};

export default function ItemFormModal({ currentUser, editItem, onSave, onClose }: Props) {
  const [name, setName] = useState(editItem?.name ?? '');
  const [category, setCategory] = useState<Category>(editItem?.category ?? '食べ物');
  const [rating, setRating] = useState<Rating>(editItem?.rating ?? 'like');
  const [condition, setCondition] = useState(editItem?.condition ?? '');
  const [memo, setMemo] = useState(editItem?.memo ?? '');

  useEffect(() => {
    if (rating !== 'conditional') setCondition('');
  }, [rating]);

  const canSave = name.trim().length > 0 && (rating !== 'conditional' || condition.trim().length > 0);

  function handleSave() {
    if (!canSave) return;
    const now = Date.now();
    onSave({
      id: editItem?.id ?? uuidv4(),
      userId: currentUser,
      name: name.trim(),
      category,
      rating,
      condition: rating === 'conditional' ? condition.trim() : undefined,
      memo: memo.trim() || undefined,
      learnedAt: editItem?.learnedAt ?? now,
      createdAt: editItem?.createdAt ?? now,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl pb-8 max-h-[92dvh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="px-5 pt-2 pb-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              {editItem ? '編集' : `${USER_LABELS[currentUser]}の好み追加`}
            </h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 text-xl">×</button>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">名前</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例: 納豆、カラオケ、ネクタイ..."
              className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">カテゴリ</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const cfg = CATEGORY_CONFIG[cat];
                const selected = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      selected
                        ? `${cfg.bg} ${cfg.text} border-transparent shadow-sm`
                        : 'bg-white text-gray-500 border-gray-200'
                    }`}
                  >
                    <span>{cfg.emoji}</span>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">評価</label>
            <div className="flex flex-col gap-2">
              {RATING_ORDER.map(r => {
                const cfg = RATINGS[r];
                const selected = rating === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRating(r)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                      selected
                        ? `${cfg.bg} ${cfg.text} ${cfg.border} shadow-sm`
                        : 'bg-white text-gray-500 border-gray-200'
                    }`}
                  >
                    <span className="text-base">{cfg.emoji}</span>
                    <span>{cfg.label}</span>
                    {r === 'conditional' && <span className="text-xs text-gray-400 ml-1">→ 条件を記入</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Condition (only for conditional) */}
          {rating === 'conditional' && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                条件 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={condition}
                onChange={e => setCondition(e.target.value)}
                placeholder="例: 薄味ならOK、週1回まで..."
                className="w-full border border-violet-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          )}

          {/* Memo */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">メモ（任意）</label>
            <textarea
              value={memo}
              onChange={e => setMemo(e.target.value)}
              placeholder="補足など..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100 resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {editItem ? '更新する' : '追加する'}
          </button>
        </div>
      </div>
    </div>
  );
}
