import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Footer } from '@/components/Footer/Footer';
import { Toaster } from 'react-hot-toast'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chef de Geladeira',
  description: 'Transforme ingredientes em pratos incríveis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              // Estilos para notificações de sucesso
              success: {
                style: {
                  background: '#2e7d32', // Verde
                  color: '#ffffff',
                },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#2e7d32',
                },
              },
              // Estilos para notificações de erro
              error: {
                style: {
                  background: '#d32f2f', // Vermelho
                  color: '#ffffff',
                },
                 iconTheme: {
                  primary: '#ffffff',
                  secondary: '#d32f2f',
                },
              },
              // Estilos gerais
              style: {
                borderRadius: '8px',
                background: '#333',
                color: '#fff',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              },
            }}
          />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}