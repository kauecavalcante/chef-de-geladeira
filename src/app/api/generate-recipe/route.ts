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
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return new NextResponse('Não autorizado: Token não encontrado.', { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];
    
    let decodedToken;
    try {
        decodedToken = await auth.verifyIdToken(idToken);
    } catch (error) {
        return new NextResponse('Não autorizado: Token inválido.', { status: 401 });
    }
    const { uid } = decodedToken;

    
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return new NextResponse('Utilizador não encontrado no banco de dados.', { status: 404 });
    }

    const userData = userDoc.data()!;
    let { plan, recipeCount, lastResetDate } = userData;
    const freeTierLimit = 10;

    const now = new Date();
    const lastReset = lastResetDate.toDate();
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await userRef.update({
        recipeCount: 0,
        lastResetDate: FieldValue.serverTimestamp(),
      });
      recipeCount = 0;
    }

    
    if (plan === 'free' && recipeCount >= freeTierLimit) {
      return new NextResponse('Limite de receitas gratuitas atingido para este mês.', { status: 429 });
    }
    
    const body = await req.json();
    const { ingredients, styles } = body;

    if (!ingredients) {
      return new NextResponse('Ingredientes são obrigatórios.', { status: 400 });
    }

    const styleText = styles && styles.length > 0 
      ? `A receita deve ter os seguintes estilos: ${styles.join(', ')}.`
      : 'A receita pode ser de qualquer estilo, use sua criatividade.';

    const prompt = `Aja como um chef de cozinha criativo e experiente. Sua tarefa é criar uma receita deliciosa e clara usando os ingredientes fornecidos. Ingredientes disponíveis: ${ingredients}. ${styleText} Por favor, retorne a receita estritamente no seguinte formato JSON, sem nenhum texto ou explicação adicional antes ou depois do JSON. O JSON deve ter a seguinte estrutura: {"title": "Um nome curto, criativo e apetitoso para a receita","description": "Uma descrição curta e envolvente (2-3 frases) que faça a pessoa querer cozinhar o prato.","servings": "Serve quantas pessoas (ex: '2 pessoas')","time": "Tempo total de preparo (ex: '30 minutos')","ingredients": ["Uma lista de strings, cada uma sendo um ingrediente com a quantidade (ex: '2 ovos', '1 xícara de farinha')"],"instructions": ["Uma lista de strings, cada uma sendo um passo claro e numerado do modo de preparo."],"imagePrompt": "Crie um prompt de texto para um gerador de imagens de IA que descreva uma foto profissional e bonita do prato finalizado. Ex: 'Foto de um prato fundo branco com risoto de cogumelos cremoso, finalizado com parmesão ralado e salsinha fresca, em uma mesa de madeira rústica, com iluminação natural suave.'"}`;

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

    
    if (plan === 'free') {
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