import { NextResponse } from 'next/server';
import Stripe from 'stripe';
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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;


async function updateUserSubscriptionStatus(subscriptionId: string, dataToUpdate: object) {
    const userQuery = await db.collection('users').where('stripe_subscription_id', '==', subscriptionId).get();
    
    if (!userQuery.empty) {
        const userDoc = userQuery.docs[0];
        await userDoc.ref.update(dataToUpdate);
        console.log(`Dados da assinatura atualizados para o utilizador: ${userDoc.id}`, dataToUpdate);
        return userDoc.id;
    }
    return null;
}


export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return new NextResponse('Configuração de webhook incompleta.', { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    console.log(`Webhook do Stripe recebido: ${event.type}`);

    const subscription = event.data.object as Stripe.Subscription;

    switch (event.type) {
      
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const firebaseUID = session.metadata?.firebaseUID;

        if (firebaseUID) {
          const userRef = db.collection('users').doc(firebaseUID);
          await userRef.update({
            plan: 'premium',
            subscription_status: 'active',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
          });
          console.log(`Plano premium ativado para o utilizador: ${firebaseUID}`);
        }
        break;
      }
      
      
      case 'customer.subscription.updated': {
        const status = subscription.status;
        let plan = 'free';
        let cancelAt = null;

        if (status === 'active') {
          plan = 'premium';
        }

        if (subscription.cancel_at_period_end) {
            cancelAt = new Date(subscription.cancel_at! * 1000);
        }

        await updateUserSubscriptionStatus(subscription.id, {
            plan: plan,
            subscription_status: status, 
            subscription_cancel_at: cancelAt,
        });
        break;
      }

      
      case 'customer.subscription.deleted': {
        await updateUserSubscriptionStatus(subscription.id, {
            plan: 'free',
            subscription_status: 'cancelled',
        });
        break;
      }
    }

    return new NextResponse('Webhook recebido com sucesso!', { status: 200 });

  } catch (error: any) {
    console.error('[STRIPE_WEBHOOK_ERROR]', error.message);
    return new NextResponse(`Erro no webhook: ${error.message}`, { status: 400 });
  }
}