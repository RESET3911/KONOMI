import { useState, useEffect, useCallback } from 'react';
import type { KonomiItem, UserId } from './types';
import { USER_LABELS, USER_COLORS } from './types';
import { subscribeItems, saveItem, deleteItem } from './utils/storage';
import UserSelectScreen from './components/UserSelectScreen';
import HomeScreen from './components/HomeScreen';
import QuickViewScreen from './components/QuickViewScreen';
import ItemFormModal from './components/ItemFormModal';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';

type Screen = 'list' | 'quickview';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserId | null>(null);
  const [items, setItems] = useState<KonomiItem[]>([]);
  const [screen, setScreen] = useState<Screen>('list');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<KonomiItem | undefined>(undefined);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsub = subscribeItems(
      data => { setItems(data); setLoading(false); },
      () => { setLoading(false); setToast({ message: 'DB接続エラー', type: 'error' }); },
    );
    return unsub;
  }, []);

  const handleSave = useCallback(async (item: KonomiItem) => {
    try {
      await saveItem(item);
      setToast({ message: editItem ? '更新しました' : '追加しました', type: 'success' });
    } catch {
      setToast({ message: '保存に失敗しました', type: 'error' });
    }
  }, [editItem]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteItem(id);
      setToast({ message: '削除しました', type: 'success' });
    } catch {
      setToast({ message: '削除に失敗しました', type: 'error' });
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <div className="text-center">
          <div className="text-4xl mb-3">💝</div>
          <p className="text-gray-400 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <UserSelectScreen onSelect={setCurrentUser} />;
  }

  const colors = USER_COLORS[currentUser];

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2 bg-white/70 backdrop-blur-sm sticky top-0 z-30 border-b border-gray-100">
        <button
          onClick={() => setCurrentUser(null)}
          className="text-gray-400 text-xl w-8 h-8 flex items-center justify-center"
        >
          ←
        </button>
        <div className="text-center">
          <span className="font-extrabold text-sm bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
            💝 Konomi
          </span>
          <div className="flex justify-center mt-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.badge}`}>
              {USER_LABELS[currentUser]}モード
            </span>
          </div>
        </div>
        <div className="w-8" />
      </header>

      {/* Screens */}
      <main className="flex-1 flex flex-col">
        {screen === 'list' && (
          <HomeScreen
            currentUser={currentUser}
            items={items}
            onAdd={() => { setEditItem(undefined); setShowForm(true); }}
            onEdit={item => { setEditItem(item); setShowForm(true); }}
            onDelete={handleDelete}
          />
        )}
        {screen === 'quickview' && (
          <QuickViewScreen items={items} />
        )}
      </main>

      <BottomNav current={screen} onChange={setScreen} />

      {showForm && (
        <ItemFormModal
          currentUser={currentUser}
          editItem={editItem}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditItem(undefined); }}
        />
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
