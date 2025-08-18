import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
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
    
    const { uid, email } = decodedToken;

    if (!email) {
      return new NextResponse('E-mail do utilizador não encontrado.', { status: 400 });
    }

    const preference = new Preference(client);
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    const result = await preference.create({
      body: {
        
        purpose: 'subscription',
       
        items: [
          {
            id: process.env.MERCADOPAGO_PREMIUM_PLAN_ID!,
            title: 'Chef de Geladeira - Plano Premium',
            quantity: 1,
            unit_price: 9.90,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: email,
        },
        back_urls: {
          success: `${baseUrl}/`, 
          failure: `${baseUrl}/pricing`,
          pending: `${baseUrl}/pricing`,
        },
        external_reference: uid,
      },
    });

    return NextResponse.json({ checkoutUrl: result.init_point });

  } catch (error) {
    console.error('[CREATE_SUBSCRIPTION_ERROR]', error);
    if (error instanceof Error) {
        console.error((error as any).cause || error.message);
    }
    return new NextResponse('Erro interno do servidor.', { status: 500 });
  }
}