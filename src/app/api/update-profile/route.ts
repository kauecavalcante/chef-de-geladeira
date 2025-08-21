import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';


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

export async function POST(req: Request) {
  try {
    
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];
    const { uid } = await auth.verifyIdToken(idToken);

   
    const { displayName, dietaryPreferences } = await req.json();
    
    const userRef = db.collection('users').doc(uid);
    const dataToUpdate: { [key: string]: any } = {};

    
    if (typeof displayName === 'string') {
        dataToUpdate.displayName = displayName;
        
        await auth.updateUser(uid, { displayName });
    }

    if (Array.isArray(dietaryPreferences)) {
        dataToUpdate.dietaryPreferences = dietaryPreferences;
    }

    
    if (Object.keys(dataToUpdate).length > 0) {
        await userRef.update(dataToUpdate);
    } else {
        return new NextResponse('Nenhum dado válido para atualizar.', { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Perfil atualizado com sucesso." });

  } catch (error: any) {
    console.error('[UPDATE_PROFILE_ERROR]', error);
    return new NextResponse('Erro interno do servidor.', { status: 500 });
  }
}