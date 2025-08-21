import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';



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


export async function POST(req: Request) {
  try {
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader) return new NextResponse('Não autorizado', { status: 401 });
    const idToken = authorizationHeader.split('Bearer ')[1];
    const { uid } = await auth.verifyIdToken(idToken);

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return new NextResponse('Utilizador não encontrado.', { status: 404 });
    }

    const userData = userDoc.data()!;

    const body = await req.json();
    const { ingredients, styles } = body;

    
    const dietaryPreferences = userData.dietaryPreferences || [];

   
    const preferencesText = dietaryPreferences.length > 0 
      ? `Importante: A receita DEVE seguir estas restrições alimentares: ${dietaryPreferences.join(', ')}. Não inclua nenhum ingrediente que viole estas regras.`
      : '';
    

    const styleText = styles && styles.length > 0 
      ? `A receita deve ter os seguintes estilos: ${styles.join(', ')}.`
      : 'A receita pode ser de qualquer estilo, use sua criatividade.';

   
    const prompt = `Aja como um chef de cozinha criativo e experiente. Sua tarefa é criar uma receita deliciosa e clara usando os ingredientes fornecidos. Ingredientes disponíveis: ${ingredients}. ${styleText} ${preferencesText} Por favor, retorne a receita estritamente no seguinte formato JSON, sem nenhum texto ou explicação adicional antes ou depois do JSON... (o resto do seu prompt continua igual)`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const recipeContent = response.choices[0].message?.content;
    if (!recipeContent) {
      return new NextResponse('Não foi possível gerar a receita.', { status: 500 });
    }

    const recipeJson = JSON.parse(recipeContent);

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

  } catch (error) {
    console.error('[GENERATE_RECIPE_ERROR]', error);
    return new NextResponse('Erro interno do servidor.', { status: 500 });
  }
}