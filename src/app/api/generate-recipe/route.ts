import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import * as Sentry from "@sentry/nextjs"; 

const GenerateRecipeSchema = z.object({
  ingredients: z.string().min(3, { message: "Os ingredientes são obrigatórios." }),
  styles: z.array(z.string()).optional(),
  conflictResolution: z.string().optional(),
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

const db = getFirestore();
const auth = admin.auth();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const isRecipeValid = (recipe: any): boolean => {
  return (
    recipe &&
    typeof recipe.title === 'string' &&
    typeof recipe.description === 'string' &&
    typeof recipe.servings === 'string' &&
    typeof recipe.time === 'string' &&
    typeof recipe.difficulty === 'string' &&
    Array.isArray(recipe.ingredients) &&
    Array.isArray(recipe.instructions) &&
    Array.isArray(recipe.chefTips)
  );
};

export async function POST(req: Request) {
  try {
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader) return new NextResponse('Não autorizado', { status: 401 });
    const idToken = authorizationHeader.split('Bearer ')[1];
    const { uid } = await auth.verifyIdToken(idToken);

    const body = await req.json();

    const validation = GenerateRecipeSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ message: "Dados inválidos.", errors: validation.error.errors }), { status: 400 });
    }

    const { ingredients, styles, conflictResolution } = validation.data;

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return new NextResponse('Utilizador não encontrado.', { status: 404 });
    }

    const userData = userDoc.data()!;
    const dietaryPreferences = userData.plan === 'premium' ? (userData.dietaryPreferences || []) : [];

    let preferencesText = '';

    if (conflictResolution === 'suggest_alternatives' && userData.plan === 'premium') {
      preferencesText = `Importante: O usuário selecionou a preferência "${dietaryPreferences.join(', ')}", mas forneceu ingredientes que podem violar essa regra. Sua tarefa é criar a receita usando os ingredientes fornecidos, mas SUBSTITUINDO os itens problemáticos por alternativas adequadas (ex: substituir 'leite' por 'leite de amêndoas'). Mencione a substituição na lista de ingredientes.`;
    } else if (conflictResolution === 'ignore_preference') {
      preferencesText = 'Atenção: Ignore as preferências alimentares do usuário para esta receita específica e use os ingredientes exatamente como fornecidos.';
    } else if (conflictResolution === 'assume_compliant' && userData.plan === 'premium') {
      preferencesText = `Importante: A receita DEVE seguir estas restrições alimentares: ${dietaryPreferences.join(', ')}. O usuário informou que os ingredientes fornecidos (como 'leite' ou 'pão') já são da versão compatível (ex: 'leite sem lactose', 'pão sem glúten'). Portanto, use-os na receita mantendo a restrição.`;
    } else if (dietaryPreferences.length > 0 && userData.plan === 'premium') {
      preferencesText = `Importante: A receita DEVE seguir estas restrições alimentares: ${dietaryPreferences.join(', ')}. Não inclua nenhum ingrediente que viole estas regras.`;
    }
    
    const styleText = styles && styles.length > 0
      ? `A receita deve ter os seguintes estilos: ${styles.join(', ')}.`
      : 'A receita pode ser de qualquer estilo, use sua criatividade.';

   
    const prompt = `
      Aja como um chef de cozinha especialista. Sua missão é criar uma receita completa e profissional.

      **Contexto:**
      - Ingredientes disponíveis: "${ingredients}".
      - Estilos desejados: "${styleText}".
      - Restrições a seguir: "${preferencesText}".

      **Formato de Saída OBRIGATÓRIO:**
      Responda APENAS com um objeto JSON. As chaves "ingredients", "instructions" e "chefTips" DEVEM ser arrays de strings.
      A chave "difficulty" deve ser "Fácil", "Médio" ou "Difícil".
      
      O formato exato deve ser:
      {
        "title": "...",
        "description": "...",
        "servings": "...",
        "time": "...",
        "difficulty": "...",
        "ingredients": ["...", "..."],
        "instructions": ["...", "..."],
        "chefTips": ["...", "..."]
      }
    `;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const recipeContent = response.choices[0].message.content;
    if (!recipeContent) {
      return new NextResponse('A IA não conseguiu gerar uma receita.', { status: 500 });
    }

    const recipeJson = JSON.parse(recipeContent);

    if (!isRecipeValid(recipeJson)) {
      console.error('Resposta inválida da IA:', recipeContent);
      return new NextResponse('A resposta da IA está incompleta. Por favor, tente novamente.', { status: 500 });
    }

    const recipeToSave = {
      ...recipeJson,
      createdAt: FieldValue.serverTimestamp(),
    };
    await db.collection('users').doc(uid).collection('recipes').add(recipeToSave);

    if (userData.plan === 'free') {
      await userRef.update({
        recipeCount: FieldValue.increment(1),
      });
    }

    return NextResponse.json(recipeJson);

  } catch (error: any) {
   
    Sentry.captureException(error);

    if (error instanceof z.ZodError) {
      return new NextResponse('Dados inválidos.', { status: 400 });
    }
    console.error('[GENERATE_RECIPE_ERROR]', error);
    return new NextResponse('Erro interno do servidor.', { status: 500 });
  }
}