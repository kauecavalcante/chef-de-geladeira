import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago';
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

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));

    let userId: string | undefined = undefined;
    let status: string | undefined = undefined;
    let subscriptionId: string | undefined = undefined;

    if (body.type === 'payment') {
      const paymentId = body.data.id;
      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });
      
      if (paymentInfo && paymentInfo.status === 'approved') {
        userId = paymentInfo.external_reference;
        status = 'authorized';
        
        
        if (userId) {
          const preApproval = new PreApproval(client);
          
          const searchResult = await preApproval.search({ 
            external_reference: userId,
            limit: 1,
            sort: 'date_created',
            criteria: 'desc',
          } as any);

          if (searchResult.results && searchResult.results.length > 0) {
            subscriptionId = searchResult.results[0].id;
          }
        }
      }
    } else if (body.type === 'preapproval') {
      subscriptionId = body.data.id;
      if (subscriptionId) {
        const preApproval = new PreApproval(client);
        const subscriptionInfo = await preApproval.get({ id: subscriptionId });
        userId = subscriptionInfo.external_reference;
        status = subscriptionInfo.status;
      }
    }

    if (userId && status) {
      const userRef = db.collection('users').doc(userId);
      
      const updateData: { [key: string]: any } = {
        plan: status === 'authorized' ? 'premium' : 'free',
        subscription_status: status,
      };

      
      if (subscriptionId) {
        updateData.mercadopago_subscription_id = subscriptionId;
      }
      
      await userRef.update(updateData);

      console.log(`Estado da assinatura para o utilizador ${userId} atualizado para: ${status}`);
    }

    return new NextResponse('Notificação recebida.', { status: 200 });

  } catch (error) {
    console.error('[MERCADOPAGO_WEBHOOK_ERROR]', error);
    return new NextResponse('Erro interno do servidor.', { status: 500 });
  }
}