import { useEffect } from 'react';

type Props = {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
};

export default function Toast({ message, type, onClose }: Props) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl shadow-lg text-white text-sm font-medium z-50 whitespace-nowrap ${
      type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
    }`}>
      {message}
    </div>
  );
}
