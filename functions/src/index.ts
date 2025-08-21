// A importação correta para o evento de autenticação
import { onUserCreate, AuthEvent } from "firebase-functions/v2/auth"; 
import * as admin from "firebase-admin";
import { setGlobalOptions } from "firebase-functions/v2";

admin.initializeApp();
const db = admin.firestore();

setGlobalOptions({ region: "southamerica-east1" });

// Adicionamos o tipo correto para o evento: AuthEvent
export const createNewUserProfile = onUserCreate(async (event: AuthEvent) => {
  const user = event.data;
  const { uid, email, displayName } = user;

  const userProfile = {
    email: email || "",
    displayName: displayName || "", // Guarda o nome do Google ou uma string vazia
    plan: "free",
    recipeCount: 0,
    lastResetDate: admin.firestore.FieldValue.serverTimestamp(),
    dietaryPreferences: [], // Inicializa as preferências como um array vazio
  };

  try {
    await db.collection("users").doc(uid).set(userProfile);
    console.log(`Perfil criado com sucesso para o utilizador: ${uid}`);
    return null;
  } catch (error) {
    console.error(`Erro ao criar perfil para o utilizador ${uid}:`, error);
    return null;
  }
});