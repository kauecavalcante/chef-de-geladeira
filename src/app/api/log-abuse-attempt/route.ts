import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as Sentry from "@sentry/nextjs";


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

export async function POST(req: Request) {
  try {
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader) {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];
    const { uid } = await auth.verifyIdToken(idToken);

    const userRef = db.collection('users').doc(uid);

   
    await userRef.update({
      invalidRequestCount: FieldValue.increment(1),
      lastInvalidRequestAt: FieldValue.serverTimestamp(),
    });

 

    return NextResponse.json({ success: true, message: "Tentativa de abuso registrada." });

  } catch (error: any) {
    Sentry.captureException(error);
    console.error('[LOG_ABUSE_ERROR]', error);
    
    return new NextResponse('OK', { status: 200 });
  }
}