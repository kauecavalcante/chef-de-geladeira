import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
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
    const { uid } = await auth.verifyIdToken(idToken);

    
    const { paymentId } = await req.json();
    if (!paymentId) {
      return new NextResponse('ID do pagamento é obrigatório.', { status: 400 });
    }

    
    const payment = new Payment(client);
    const paymentInfo = await payment.get({ id: paymentId });

    
    if (paymentInfo && paymentInfo.status === 'approved' && paymentInfo.external_reference === uid) {
      const subscriptionId = (paymentInfo as any).preapproval_id;

      if (subscriptionId) {
        
        const userRef = db.collection('users').doc(uid);
        await userRef.update({
          plan: 'premium',
          subscription_status: 'authorized',
          mercadopago_subscription_id: subscriptionId,
        });
        console.log(`Assinatura ${subscriptionId} verificada e guardada para o utilizador ${uid}.`);
        return new NextResponse('Assinatura verificada com sucesso.', { status: 200 });
      }
    }

    return new NextResponse('Pagamento não pôde ser verificado.', { status: 400 });

  } catch (error) {
    console.error('[VERIFY_SUBSCRIPTION_ERROR]', error);
    return new NextResponse('Erro interno do servidor.', { status: 500 });
  }
}