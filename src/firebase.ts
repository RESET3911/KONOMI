// Firebase 初期化は全アプリ共通（src/shared/firebase.ts）に集約
import { getFunctions } from 'firebase/functions';
import { app } from './shared/firebase';

export { db } from './shared/firebase';
export const functions = getFunctions(app, 'asia-northeast1');
