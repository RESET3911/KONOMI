type Screen = 'list' | 'quickview' | 'dinner';

type Props = {
  current: Screen;
  onChange: (s: Screen) => void;
};

const TABS: { key: Screen; icon: string; label: string }[] = [
  { key: 'list',      icon: '📋', label: '一覧' },
  { key: 'quickview', icon: '⚡', label: 'NG/LIKE' },
  { key: 'dinner',    icon: '🍽️', label: '提案' },
];

export default function BottomNav({ current, onChange }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-20">
      <div className="max-w-lg mx-auto flex">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 min-h-[60px] transition-colors ${
              current === tab.key ? 'text-pink-500' : 'text-gray-400'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
