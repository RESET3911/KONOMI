import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { KonomiItem, UserId } from '../types';

type FsUser = 'saku' | 'takahashi' | 'both';

function konomiUserToFsId(userId: UserId): FsUser {
  return userId === 'takahashi' ? 'takahashi' : 'saku';
}

async function writeNotification(params: {
  toUser: FsUser;
  type: string;
  title: string;
  body: string;
  linkedId?: string | null;
}): Promise<void> {
  await addDoc(collection(db, 'notifications'), {
    toUser: params.toUser,
    fromApp: 'konomi',
    type: params.type,
    title: params.title,
    body: params.body,
    isRead: false,
    linkedUrl: 'https://RESET3911.github.io/KONOMI/',
    linkedId: params.linkedId ?? null,
    createdAt: Date.now(),
  });
}

const RATING_LABEL: Record<string, string> = {
  like: '好き ❤️',
  maybe: 'まあ好き 👍',
  dislike: '苦手 😬',
  ng: 'NG 🚫',
  conditional: '条件付き ⚡',
};

// 新しい好みメモが追加されたとき（相手に通知）
export async function notifyKonomiAdded(item: KonomiItem): Promise<void> {
  const otherUser: FsUser = item.userId === 'takahashi' ? 'saku' : 'takahashi';
  const ownerLabel = item.userId === 'takahashi' ? 'けんしん' : 'れな';
  const ratingLabel = RATING_LABEL[item.rating] ?? item.rating;

  await writeNotification({
    toUser: otherUser,
    type: 'konomi_added',
    title: `💝 好みメモが追加されました`,
    body: `${ownerLabel}：「${item.name}」→ ${ratingLabel}（${item.category}）`,
    linkedId: item.id,
  });
}

// NG / 地雷アイテムが追加されたとき（優先度高め）
export async function notifyKonomiNG(item: KonomiItem): Promise<void> {
  const otherUser: FsUser = item.userId === 'takahashi' ? 'saku' : 'takahashi';
  const ownerLabel = item.userId === 'takahashi' ? 'けんしん' : 'れな';

  await writeNotification({
    toUser: otherUser,
    type: 'konomi_conflict',
    title: `⚠️ NGアイテムが登録されました`,
    body: `${ownerLabel}にとって「${item.name}」は NG です（${item.category}）${item.memo ? `\nメモ: ${item.memo}` : ''}`,
    linkedId: item.id,
  });
}
