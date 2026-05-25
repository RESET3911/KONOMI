import {
  collection, doc, onSnapshot, setDoc, deleteDoc,
  query, orderBy,
} from 'firebase/firestore';
import type { QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';
import type { KonomiItem } from '../types';

const col = () => collection(db, 'konomi_items');

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}

export function subscribeItems(
  onData: (items: KonomiItem[]) => void,
  onError?: () => void,
) {
  const q = query(col(), orderBy('createdAt', 'desc'));
  return onSnapshot(q,
    (snap: QuerySnapshot<DocumentData>) => {
      onData(snap.docs.map(d => ({ ...d.data(), id: d.id } as KonomiItem)));
    },
    () => onError?.(),
  );
}

export async function saveItem(item: KonomiItem) {
  await setDoc(doc(col(), item.id), stripUndefined(item));
}

export async function deleteItem(id: string) {
  await deleteDoc(doc(col(), id));
}
