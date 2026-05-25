import { useState } from 'react';
import type { KonomiItem, UserId, Category, Rating } from '../types';
import { USER_LABELS, USER_COLORS, CATEGORIES, CATEGORY_CONFIG, RATINGS, RATING_ORDER } from '../types';

type Props = {
  currentUser: UserId;
  items: KonomiItem[];
  onAdd: () => void;
  onEdit: (item: KonomiItem) => void;
  onDelete: (id: string) => void;
};

export default function HomeScreen({ currentUser, items, onAdd, onEdit, onDelete }: Props) {
  const partner: UserId = currentUser === 'saku' ? 'takahashi' : 'saku';
  const [viewUser, setViewUser] = useState<UserId>(currentUser);
  const [catFilter, setCatFilter] = useState<Category | null>(null);
  const [ratingFilter, setRatingFilter] = useState<Rating | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = items.filter(item => {
    if (item.userId !== viewUser) return false;
    if (catFilter && item.category !== catFilter) return false;
    if (ratingFilter && item.rating !== ratingFilter) return false;
    return true;
  });

  const viewColors = USER_COLORS[viewUser];

  return (
    <div className="flex flex-col flex-1 pb-20">
      {/* User tab switcher */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 pt-3 pb-2">
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          {([currentUser, partner] as UserId[]).map(uid => {
            const c = USER_COLORS[uid];
            const active = viewUser === uid;
            return (
              <button
                key={uid}
                onClick={() => setViewUser(uid)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  active
                    ? `bg-white shadow-sm ${c.text}`
                    : 'text-gray-400'
                }`}
              >
                {USER_LABELS[uid]}
                {uid === currentUser && <span className="text-xs font-normal ml-1 opacity-70">(自分)</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-3">
        {/* Category filter */}
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

        {/* Rating filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setRatingFilter(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              ratingFilter === null ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            全評価
          </button>
          {RATING_ORDER.map(r => {
            const cfg = RATINGS[r];
            const active = ratingFilter === r;
            return (
              <button
                key={r}
                onClick={() => setRatingFilter(active ? null : r)}
                className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  active ? `${cfg.bg} ${cfg.text} ${cfg.border}` : 'bg-white text-gray-500 border-gray-200'
                }`}
              >
                {cfg.emoji} {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="px-4 flex flex-col gap-2 mt-1">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-sm">まだ登録がありません</p>
            {viewUser === currentUser && (
              <p className="text-xs mt-1">下の＋ボタンから追加しよう</p>
            )}
          </div>
        ) : (
          filtered.map(item => {
            const catCfg = CATEGORY_CONFIG[item.category];
            const ratCfg = RATINGS[item.rating];
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      {/* Category chip */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${catCfg.bg} ${catCfg.text}`}>
                        {catCfg.emoji} {item.category}
                      </span>
                      {/* Rating badge */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${ratCfg.bg} ${ratCfg.text} ${ratCfg.border}`}>
                        {ratCfg.emoji} {ratCfg.label}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 text-base leading-snug">{item.name}</p>
                    {item.condition && (
                      <p className="text-xs text-violet-600 mt-1 flex items-start gap-1">
                        <span>⚡</span>
                        <span>{item.condition}</span>
                      </p>
                    )}
                    {item.memo && (
                      <p className="text-xs text-gray-400 mt-1">{item.memo}</p>
                    )}
                  </div>

                  {/* Actions (only for current user's items) */}
                  {viewUser === currentUser && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {deleteConfirm === item.id ? (
                        <>
                          <button
                            onClick={() => { onDelete(item.id); setDeleteConfirm(null); }}
                            className="px-2.5 py-1.5 text-xs bg-red-500 text-white rounded-lg font-medium"
                          >
                            削除
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2.5 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg font-medium"
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => onEdit(item)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 text-base rounded-lg hover:bg-gray-100"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 text-base rounded-lg hover:bg-gray-100"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FAB */}
      {viewUser === currentUser && (
        <button
          onClick={onAdd}
          className={`fixed bottom-20 right-5 w-14 h-14 rounded-full bg-gradient-to-br ${viewColors.from} ${viewColors.to} text-white text-2xl shadow-lg flex items-center justify-center active:scale-90 transition-transform z-10`}
        >
          +
        </button>
      )}
    </div>
  );
}
