// MUDANÇA 1: A importação agora é mais específica para a versão 2 (v2)
import {onUserCreate} from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import {setGlobalOptions} from "firebase-functions/v2";

// Inicializa o Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Opcional, mas recomendado: define a região onde sua função vai rodar
setGlobalOptions({region: "southamerica-east1"});

// MUDANÇA 2: A sintaxe da função mudou. Usamos onUserCreate diretamente.
// O 'event' contém os dados do usuário.
export const createNewUserProfile = onUserCreate(async (event) => {
  // Os dados do usuário agora estão dentro de 'event.data'
  const user = event.data;
  const {uid, email} = user;

  // O resto da lógica continua a mesma
  const userProfile = {
    email: email || "",
    plan: "free",
    recipeCount: 0,
    lastResetDate: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection("users").doc(uid).set(userProfile);
    console.log(`Perfil criado com sucesso para o usuário: ${uid}`);
    return null;
  } catch (error) {
    console.error(`Erro ao criar perfil para o usuário ${uid}:`, error);
    return null;
  }
});