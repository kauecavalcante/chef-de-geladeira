import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import { getApps, initializeApp, cert } from 'firebase-admin/app';


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


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    
    const authorizationHeader = req.headers.get('Authorization');
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      return new NextResponse('Não autorizado: Token não fornecido.', { status: 401 });
    }
    const idToken = authorizationHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    if (!email) {
      return new NextResponse('E-mail do utilizador não encontrado.', { status: 400 });
    }
    
    const host = req.headers.get('host');
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', 
      customer_email: email, 
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, 
          quantity: 1,
        },
      ],
     
      success_url: `${baseUrl}/subscription-success`,
      cancel_url: `${baseUrl}/pricing`,
      
      metadata: {
        firebaseUID: uid,
      },
    });

    
    if (!session.url) {
        throw new Error("O Stripe não retornou uma URL de sessão.");
    }

    return NextResponse.json({ checkoutUrl: session.url });

  } catch (error: any) {
    console.error('[STRIPE_SUBSCRIPTION_ERROR]', error);
    return new NextResponse(JSON.stringify({ message: error.message || 'Erro interno do servidor.' }), { status: 500 });
  }
}