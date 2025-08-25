import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import * as Sentry from "@sentry/nextjs";

const FilterIngredientsSchema = z.object({
  ingredients: z.string(),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = FilterIngredientsSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ message: "Dados inválidos." }), { status: 400 });
    }

    const { ingredients } = validation.data;

    const prompt = `
      Analise a lista de itens a seguir e separe-os em duas categorias: "ingredientesComestiveis" e "itensNaoComestiveis".
      Itens: "${ingredients}".

      Responda APENAS com um objeto JSON no formato:
      {
        "ingredientesComestiveis": ["...", "..."],
        "itensNaoComestiveis": ["...", "..."]
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json(result);

  } catch (error: any) {
    Sentry.captureException(error);
    console.error('[FILTER_INGREDIENTS_ERROR]', error);
    return new NextResponse('Erro ao filtrar ingredientes.', { status: 500 });
  }
}