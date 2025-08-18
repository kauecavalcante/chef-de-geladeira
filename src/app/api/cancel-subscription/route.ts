import { NextResponse } from 'next/server';
import { MercadoPagoConfig, PreApproval } from 'mercadopago';
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


const db = getFirestore();
const auth = admin.auth();

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(req: Request) {
  try {
   
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return new NextResponse('Não autorizado', { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid } = decodedToken;

    
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists || !userDoc.data()?.mercadopago_subscription_id) {
      return new NextResponse('Assinatura não encontrada.', { status: 404 });
    }
    const subscriptionId = userDoc.data()!.mercadopago_subscription_id;

    
    const preApproval = new PreApproval(client);
    const result = await preApproval.update({
      id: subscriptionId,
      body: {
        status: 'cancelled',
      },
    });

   
    console.log(`Pedido de cancelamento enviado para a assinatura ${subscriptionId}`, result);

    return new NextResponse('Pedido de cancelamento processado.', { status: 200 });

  } catch (error) {
    console.error('[CANCEL_SUBSCRIPTION_ERROR]', error);
    return new NextResponse('Erro interno do servidor.', { status: 500 });
  }
}