import { useState } from 'react';
import type { KonomiItem, Category, Rating } from '../types';
import { USER_LABELS, USER_COLORS, CATEGORIES, CATEGORY_CONFIG, RATINGS } from '../types';

type Props = {
  items: KonomiItem[];
};

const QUICK_RATINGS: Rating[] = ['ng', 'like'];

export default function QuickViewScreen({ items }: Props) {
  const [catFilter, setCatFilter] = useState<Category | null>(null);
  const [ratingFilter, setRatingFilter] = useState<Rating | null>(null);

  function getItems(userId: 'saku' | 'takahashi', rating: Rating) {
    return items.filter(i =>
      i.userId === userId &&
      i.rating === rating &&
      (catFilter === null || i.category === catFilter),
    );
  }

  const displayRatings = ratingFilter ? [ratingFilter] : QUICK_RATINGS;

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 pt-3 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide mb-2">
          <button
            onClick={() => setCatFilter(null)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              catFilter === null ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            すべて
          </button>
          {CATEGORIES.map(cat => {
            const cfg = CATEGORY_CONFIG[cat];
            const active = catFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setCatFilter(active ? null : cat)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active ? `${cfg.bg} ${cfg.text} border-transparent` : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {cfg.emoji} {cat}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          {QUICK_RATINGS.map(r => {
            const cfg = RATINGS[r];
            const active = ratingFilter === r;
            return (
              <button
                key={r}
                onClick={() => setRatingFilter(active ? null : r)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  active ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 pt-3 flex flex-col gap-6">
        {displayRatings.map(rating => {
          const ratCfg = RATINGS[rating];
          const sakuItems = getItems('saku', rating);
          const takahashiItems = getItems('takahashi', rating);
          if (sakuItems.length === 0 && takahashiItems.length === 0) return null;

          return (
            <div key={rating}>
              {/* Section header */}
              <div className={`flex items-center gap-2 mb-3 px-1`}>
                <span className="text-lg">{ratCfg.emoji}</span>
                <span className={`font-bold text-sm ${ratCfg.text}`}>{ratCfg.label}</span>
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-2 gap-2">
                {(['saku', 'takahashi'] as const).map(uid => {
                  const userItems = uid === 'saku' ? sakuItems : takahashiItems;
                  const colors = USER_COLORS[uid];
                  return (
                    <div key={uid} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      {/* Column header */}
                      <div className={`px-3 py-2 bg-gradient-to-r ${colors.from} ${colors.to}`}>
                        <span className="text-white text-xs font-bold">{USER_LABELS[uid]}</span>
                      </div>

                      <div className="p-2 flex flex-col gap-1.5">
                        {userItems.length === 0 ? (
                          <p className="text-xs text-gray-300 py-3 text-center">なし</p>
                        ) : (
                          userItems.map(item => {
                            const catCfg = CATEGORY_CONFIG[item.category];
                            return (
                              <div key={item.id} className="flex flex-col">
                                <div className="flex items-start gap-1.5">
                                  <span className="text-sm mt-0.5">{catCfg.emoji}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 leading-snug">{item.name}</p>
                                    {item.condition && (
                                      <p className="text-xs text-violet-500 leading-snug">⚡ {item.condition}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {displayRatings.every(r => getItems('saku', r).length === 0 && getItems('takahashi', r).length === 0) && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-sm">該当するデータがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}
