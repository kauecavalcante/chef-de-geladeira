'use client';

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  User
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, db } from '@/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import styles from './Auth.module.css';
import toast from 'react-hot-toast'; 

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.emailVerified) {
      router.push('/');
    }
  }, [user, router]);


  const createUserProfile = async (user: User) => {
    const userProfile = {
      email: user.email || "",
      plan: "free",
      recipeCount: 0,
      lastResetDate: serverTimestamp(),
    };
    await setDoc(doc(db, "users", user.uid), userProfile);
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (isLoginView) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await userCredential.user.reload();
        const freshUser = auth.currentUser;

        if (freshUser && freshUser.emailVerified) {
          router.push('/');
        } else {
          toast.error('Por favor, verifique seu e-mail antes de fazer o login.');
          await signOut(auth);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(userCredential.user);
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        setShowVerificationMessage(true);
      }
    } catch (err) {
      if (err instanceof FirebaseError) {
        toast.error(getFirebaseErrorMessage(err.code));
      } else {
        toast.error('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      toast.error("Por favor, insira seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Se uma conta com este e-mail existir, um link para redefinir a senha foi enviado.");
    } catch (err) {
      if (err instanceof FirebaseError) {
        toast.error(getFirebaseErrorMessage(err.code));
      } else {
        toast.error("Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleGoogleSignIn = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;


      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);


      if (!userDoc.exists()) {
        await createUserProfile(user);
      }


      router.push('/');

    } catch (err) {
      if (err instanceof FirebaseError) {
        toast.error(getFirebaseErrorMessage(err.code));
      } else {
        toast.error('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getFirebaseErrorMessage = (errorCode: string): string => {
    console.log("Firebase Error Code:", errorCode);
    switch (errorCode) {
      case 'auth/invalid-email': return 'O formato do e-mail é inválido.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Credenciais inválidas. Verifique seu e-mail e senha.';
      case 'auth/email-already-in-use': return 'Este e-mail já está em uso por outra conta.';
      case 'auth/weak-password': return 'Sua senha precisa ter no mínimo 6 caracteres.';
      case 'auth/too-many-requests': return 'Acesso bloqueado temporariamente. Tente novamente mais tarde.';
      case 'auth/popup-closed-by-user': return 'A janela de login foi fechada antes da conclusão.';
      default:
        console.error("Unhandled Firebase Auth Error:", errorCode);
        return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
    }
  };

  const switchToForgotPasswordView = () => {
    setIsForgotPasswordView(true);
    setIsLoginView(false);
    setShowVerificationMessage(false);
  };

  const switchToLoginView = () => {
    setIsForgotPasswordView(false);
    setIsLoginView(true);
    setShowVerificationMessage(false);
  };

  const switchToRegisterView = () => {
    setIsForgotPasswordView(false);
    setIsLoginView(false);
    setShowVerificationMessage(false);
  }

  if (showVerificationMessage) {
    return (
      <main className={styles.container}>
        <div className={styles.authBox}>
          <h1 className={styles.heading}>Verifique seu E-mail</h1>
          <p className={styles.subheading} style={{ maxWidth: '300px', lineHeight: '1.5' }}>
            Enviamos um link de verificação para <strong>{email}</strong>. Por favor, clique no link para ativar sua conta.
          </p>
          <button onClick={switchToLoginView} className={`${styles.button} ${styles.primaryButton}`}>
            Ir para Login
          </button>
        </div>
      </main>
    )
  }

  if (isForgotPasswordView) {
    return (
      <main className={styles.container}>
        <div className={styles.authBox}>
          <h1 className={styles.heading}>Redefinir Senha</h1>
          <p className={styles.subheading}>Insira seu e-mail para receber o link de redefinição.</p>

          <form onSubmit={handlePasswordReset} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input id="email" name="email" type="email" placeholder="seu@email.com" required className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button type="submit" className={`${styles.button} ${styles.primaryButton}`} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Link'}
            </button>
          </form>
          <span onClick={switchToLoginView} className={styles.backToLoginLink}>
            &larr; Voltar para o Login
          </span>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.container}>
      <div className={styles.authBox}>
        <div className={styles.logoWrapper}>
          <Image src="/logo/Logochef.svg" alt="Logo Chef de Geladeira" width={180} height={40} priority />
        </div>
        <h1 className={styles.heading}>{isLoginView ? 'Acesse sua conta' : 'Crie sua conta'}</h1>
        <p className={styles.subheading}>Bem-vindo(a) de volta!</p>

        <form onSubmit={handleAuth} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input id="email" name="email" type="email" placeholder="seu@email.com" required className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>Senha</label>
            <input id="password" name="password" type="password" placeholder="••••••••" required className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {isLoginView && (
             <div className={styles.forgotPasswordWrapper}>
                <span onClick={switchToForgotPasswordView} className={styles.toggleLink}>
                  Esqueceu a senha?
                </span>
             </div>
          )}

          <button type="submit" className={`${styles.button} ${styles.primaryButton}`} disabled={loading}>
            {loading ? 'Carregando...' : (isLoginView ? 'Entrar' : 'Criar conta')}
          </button>
        </form>

        <div className={styles.divider}><span>OU</span></div>

        <button onClick={handleGoogleSignIn} className={`${styles.button} ${styles.googleButton}`} disabled={loading}>
          <FcGoogle size={22} />
          <span>Continuar com o Google</span>
        </button>

        <p className={styles.toggleText}>
          {isLoginView ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          <span onClick={isLoginView ? switchToRegisterView : switchToLoginView} className={styles.toggleLink}>
            {isLoginView ? ' Cadastre-se' : ' Faça login'}
          </span>
        </p>
      </div>
    </main>
  );
}