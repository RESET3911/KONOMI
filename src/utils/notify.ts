import type { KonomiItem } from '../types';
import { writeNotification } from '../shared/notify';
import { other, USERS, type UserId } from '../shared/users';

const RATING_LABEL: Record<string, string> = {
  like: '好き ❤️',
  maybe: 'まあ好き 👍',
  dislike: '苦手 😬',
  ng: 'NG 🚫',
  conditional: '条件付き ⚡',
};

// 新しい好みメモが追加されたとき（相手に通知）
export async function notifyKonomiAdded(item: KonomiItem): Promise<void> {
  const owner = item.userId as UserId;
  const ratingLabel = RATING_LABEL[item.rating] ?? item.rating;

  await writeNotification({
    toUser: other(owner),
    fromApp: 'konomi',
    type: 'konomi_added',
    title: `💝 好みメモが追加されました`,
    body: `${USERS[owner].short}：「${item.name}」→ ${ratingLabel}（${item.category}）`,
    linkedUrl: 'https://RESET3911.github.io/KONOMI/',
    linkedId: item.id,
  });
}

// NG / 地雷アイテムが追加されたとき（優先度高め）
export async function notifyKonomiNG(item: KonomiItem): Promise<void> {
  const owner = item.userId as UserId;

  await writeNotification({
    toUser: other(owner),
    fromApp: 'konomi',
    type: 'konomi_conflict',
    title: `⚠️ NGアイテムが登録されました`,
    body: `${USERS[owner].short}にとって「${item.name}」は NG です（${item.category}）${item.memo ? `\nメモ: ${item.memo}` : ''}`,
    linkedUrl: 'https://RESET3911.github.io/KONOMI/',
    linkedId: item.id,
  });
}
