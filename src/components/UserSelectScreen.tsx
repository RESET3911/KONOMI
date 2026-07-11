import type { UserId } from '../types';
import { USER_LABELS, USER_COLORS } from '../types';

type Props = {
  onSelect: (user: UserId) => void;
};

export default function UserSelectScreen({ onSelect }: Props) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-10">
      <div className="text-center mb-10">
        <div className="text-6xl mb-4">💝</div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent tracking-tight">
          Konomi
        </h1>
        <p className="text-gray-400 text-sm mt-2">好みの相性データベース</p>
      </div>

      <p className="text-gray-500 text-sm font-medium mb-5">どちらで使いますか？</p>

      <div className="flex gap-4 w-full max-w-xs">
        {(['kenshin', 'rena'] as UserId[]).map(userId => {
          const colors = USER_COLORS[userId];
          return (
            <button
              key={userId}
              onClick={() => onSelect(userId)}
              className="flex-1 bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center gap-3 active:scale-95 transition-transform border-2 border-transparent active:border-pink-200"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center text-white text-2xl font-bold shadow-md`}>
                {USER_LABELS[userId].charAt(0)}
              </div>
              <span className="font-bold text-gray-900 text-lg">{USER_LABELS[userId]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
