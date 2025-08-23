import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import OpenAI from 'openai';


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


async function getNormalizedIngredient(ingredient: string): Promise<string> {
  try {
    const prompt = `Corrija e normalize o seguinte termo de ingrediente para sua forma mais comum em português do Brasil, sem acentos e em minúsculas. Por exemplo, "leIte" vira "leite", "pao" vira "pao". Responda apenas com o termo corrigido.\n\nIngrediente: "${ingredient}"\n\nTermo corrigido:`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0, 
      max_tokens: 10,
    });

    const normalized = response.choices[0].message.content?.trim().toLowerCase() || ingredient.toLowerCase();
    
    return normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch (error) {
    console.error("Erro ao normalizar ingrediente, usando o original:", error);
   
    return ingredient.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
}


export async function POST(req: Request) {
  try {
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader) return new NextResponse('Não autorizado', { status: 401 });
    const idToken = authorizationHeader.split('Bearer ')[1];
    const { uid } = await auth.verifyIdToken(idToken);

    const { preference, ingredient } = await req.json();

    if (!preference || !ingredient) {
      return new NextResponse('Dados inválidos.', { status: 400 });
    }

    
    const normalizedIngredient = await getNormalizedIngredient(ingredient);

    const userRef = db.collection('users').doc(uid);
    
    const fieldToUpdate = `ingredientExceptions.${preference}`;
    await userRef.set({
      ingredientExceptions: {
        [preference]: FieldValue.arrayUnion(normalizedIngredient)
      }
    }, { merge: true });

    return NextResponse.json({ success: true, message: "Exceção salva com sucesso." });

  } catch (error: any) {
    console.error('[SAVE_EXCEPTION_ERROR]', error);
    return new NextResponse('Erro interno do servidor.', { status: 500 });
  }
}