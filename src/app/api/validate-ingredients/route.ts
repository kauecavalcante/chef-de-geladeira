import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { z } from 'zod';
import * as Sentry from "@sentry/nextjs"; 

const ValidateIngredientsSchema = z.object({
  ingredients: z.string(),
  preferences: z.array(z.string()),
});

try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
} catch (error) {
  console.error('FIREBASE ADMIN SDK ERROR:', error);
}

const auth = admin.auth();
const db = getFirestore();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeSinglePreference(ingredients: string, preference: string): Promise<{ conflictingIngredients: string[] } | null> {
    if (!ingredients.trim()) {
        return null;
    }

  const prompt = `
    Você é um especialista em nutrição e restrições alimentares com extrema atenção aos detalhes. Sua tarefa é analisar uma lista de ingredientes e identificar violações a UMA regra específica.

    **Regra a ser Verificada:** "${preference}"

    **Lista de Ingredientes Fornecida:** "${ingredients}"

    **Instruções Críticas:**
    1.  Analise CADA ingrediente da lista individualmente.
    2.  **Seja literal:** Apenas identifique violações diretas. Por exemplo, "leite de amêndoas" NÃO viola "Sem Lactose". "Pão sem glúten" NÃO viola "Sem Glúten".
    3.  **Ambiguidade:** Se um ingrediente for ambíguo (ex: "creme"), assuma que ele VIOLA a restrição, a menos que o usuário especifique o contrário (ex: "creme de soja").
    4.  **Resposta:** Se um ingrediente violar a regra, adicione o nome EXATO que o usuário digitou à sua lista de resposta.

    **Formato de Saída OBRIGATÓRIO:**
    Responda APENAS com um objeto JSON no formato:
    { "conflictingIngredients": ["ingrediente1", "ingrediente2"] }

    Se nenhum ingrediente violar a regra, retorne o array vazio:
    { "conflictingIngredients": [] }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  try {
    const result = JSON.parse(response.choices[0].message.content || '{}');
    if (result.conflictingIngredients && result.conflictingIngredients.length > 0) {
      return result;
    }
    return null;
  } catch (e) {
    console.error("Falha ao analisar a resposta da IA:", e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader) return new NextResponse('Não autorizado', { status: 401 });
    const idToken = authorizationHeader.split('Bearer ')[1];
    const { uid } = await auth.verifyIdToken(idToken);

    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return new NextResponse('Utilizador não encontrado', { status: 404 });
    }

    const userData = userDoc.data()!;
    
    if (userData.plan !== 'premium') {
      return NextResponse.json({ conflict: false, conflicts: [] });
    }

    const body = await req.json();

    const validation = ValidateIngredientsSchema.safeParse(body);
    if (!validation.success) {
      return new NextResponse(JSON.stringify({ message: "Dados inválidos.", errors: validation.error.errors }), { status: 400 });
    }
    const { ingredients, preferences } = validation.data;

    if (!ingredients || !preferences || !Array.isArray(preferences) || preferences.length === 0) {
      return NextResponse.json({ conflict: false, conflicts: [] });
    }

    const ingredientExceptions = userData.ingredientExceptions || {};
    const allConflicts: { preference: string; ingredients: string[] }[] = [];

    const analysisPromises = preferences.map(async (preference: string) => {
      const exceptionsForPreference = ingredientExceptions[preference] || [];
      
      const ingredientsToCheck = ingredients
        .split(',')
        .map((i: string) => i.trim().toLowerCase())
        .filter((i: string) => i && !exceptionsForPreference.includes(i))
        .join(', ');

      const result = await analyzeSinglePreference(ingredientsToCheck, preference);
      if (result) {
        allConflicts.push({
          preference: preference,
          ingredients: result.conflictingIngredients,
        });
      }
    });

    await Promise.all(analysisPromises);

    if (allConflicts.length > 0) {
      return NextResponse.json({ conflict: true, conflicts: allConflicts });
    }

    return NextResponse.json({ conflict: false, conflicts: [] });

  } catch (error: any) {
    Sentry.captureException(error); 
    if (error instanceof z.ZodError) {
      return new NextResponse('Dados inválidos.', { status: 400 });
    }
    console.error('[VALIDATE_INGREDIENTS_ERROR]', error);
    return new NextResponse('Erro ao validar ingredientes.', { status: 500 });
  }
}