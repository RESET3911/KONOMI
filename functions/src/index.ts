import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';

admin.initializeApp();
const db = admin.firestore();

const anthropicKey = defineSecret('ANTHROPIC_API_KEY');

interface DinnerConditions {
  mood: string;
  budget: string;
  place: string;
  time: string;
}

interface KonomiDoc {
  userId: string;
  name: string;
  category: string;
  rating: string;
}

interface Suggestion {
  name: string;
  reason: string;
  memo: string;
}

function foodNG(items: KonomiDoc[]): string[] {
  return items
    .filter(i => ['食べ物', '飲み物'].includes(i.category) && ['ng', 'dislike'].includes(i.rating))
    .map(i => i.name);
}

function foodLike(items: KonomiDoc[]): string[] {
  return items
    .filter(i => ['食べ物', '飲み物'].includes(i.category) && ['like', 'maybe'].includes(i.rating))
    .map(i => i.name);
}

function placeLike(items: KonomiDoc[]): string[] {
  return items
    .filter(i => i.category === '場所' && ['like', 'maybe'].includes(i.rating))
    .map(i => i.name);
}

export const suggestDinner = onCall(
  {
    secrets: [anthropicKey],
    allowUnauthenticated: true,
    region: 'asia-northeast1',
  },
  async (request) => {
    const { conditions } = request.data as { conditions: DinnerConditions };

    if (!conditions?.mood || !conditions?.budget || !conditions?.place || !conditions?.time) {
      throw new HttpsError('invalid-argument', 'conditions is required');
    }

    const snapshot = await db.collection('konomi_items').get();
    const allItems = snapshot.docs.map(d => d.data() as KonomiDoc);

    const sakuItems = allItems.filter(i => i.userId === 'saku');
    const takahashiItems = allItems.filter(i => i.userId === 'takahashi');

    const join = (arr: string[]) => arr.join('、') || 'なし';

    const systemPrompt = `あなたはカップルの食事提案アシスタントです。
2人の好みデータを分析して、今夜の食事を3案提案してください。
必ずNGリストに含まれる食材・料理ジャンルは避けてください。
回答は日本語で、以下のJSON形式のみで返してください（コードブロック不要）:
{ "suggestions": [
  { "name": "料理名またはお店ジャンル", "reason": "提案理由（2人の好みのどこに合うか）", "memo": "具体的なメニュー例や検索ワード" },
  { "name": "料理名またはお店ジャンル", "reason": "提案理由", "memo": "具体的なメニュー例や検索ワード" },
  { "name": "料理名またはお店ジャンル", "reason": "提案理由", "memo": "具体的なメニュー例や検索ワード" }
]}`;

    const userPrompt = `さくのNG: ${join(foodNG(sakuItems))}
たかはしのNG: ${join(foodNG(takahashiItems))}
さくの好き: ${join(foodLike(sakuItems))}
たかはしの好き: ${join(foodLike(takahashiItems))}
さくの好む雰囲気: ${join(placeLike(sakuItems))}
たかはしの好む雰囲気: ${join(placeLike(takahashiItems))}
今夜の条件: 気分=${conditions.mood}、予算=${conditions.budget}、場所=${conditions.place}、時間=${conditions.time}`;

    const client = new Anthropic({ apiKey: anthropicKey.value() });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    let suggestions: Suggestion[];
    try {
      const parsed = JSON.parse(text) as { suggestions: Suggestion[] };
      if (!Array.isArray(parsed.suggestions) || parsed.suggestions.length === 0) {
        throw new Error('invalid format');
      }
      suggestions = parsed.suggestions;
    } catch {
      throw new HttpsError('internal', 'AIのレスポンスを解析できませんでした');
    }

    return { suggestions };
  }
);
