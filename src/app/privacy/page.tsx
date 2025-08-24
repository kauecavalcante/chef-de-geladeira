import { Navbar } from '@/components/Navbar/Navbar';
import styles from './Legal.module.css'; 

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className={styles.legalContainer}>
        <h1 className={styles.mainTitle}>Política de Privacidade</h1>
        <p className={styles.lastUpdated}>Última atualização: 23 de Agosto de 2025</p>

        <div className={styles.disclaimer}>
          <strong>AVISO:</strong> Este é um modelo de Política de Privacidade. Recomenda-se que você consulte um profissional legal para garantir que este documento atenda a todas as necessidades específicas do seu negócio e esteja em conformidade com leis de privacidade como GDPR, CCPA, etc.
        </div>

        <h2 className={styles.sectionTitle}>1. Informações que Coletamos</h2>
        <ul>
            <li><strong>Informações da Conta:</strong> Quando você se registra, coletamos informações como seu nome e endereço de e-mail.</li>
            <li><strong>Informações de Uso:</strong> Coletamos os ingredientes que você fornece para gerar receitas, bem como seu histórico de receitas geradas.</li>
            <li><strong>Informações de Pagamento:</strong> Para assinantes do plano Premium, nosso processador de pagamentos (Stripe) coleta e processa suas informações de pagamento. Não armazenamos os detalhes do seu cartão de crédito em nossos servidores.</li>
            <li><strong>Cookies:</strong> Usamos cookies para manter sua sessão de login e melhorar a experiência do usuário.</li>
        </ul>

        <h2 className={styles.sectionTitle}>2. Como Usamos Suas Informações</h2>
        <p>Utilizamos as informações coletadas para:</p>
        <ul>
          <li>Fornecer, operar e manter nosso serviço.</li>
          <li>Personalizar e melhorar sua experiência.</li>
          <li>Entender como nosso serviço é utilizado para desenvolver novos recursos.</li>
          <li>Processar suas transações de assinatura.</li>
          <li>Comunicar com você sobre sua conta ou para fins de marketing, com seu consentimento.</li>
          <li>Prevenir fraudes e garantir a segurança de nossa plataforma.</li>
        </ul>

        <h2 className={styles.sectionTitle}>3. Compartilhamento de Informações</h2>
        <p>Não compartilhamos suas informações de identificação pessoal com terceiros, exceto nos seguintes casos:</p>
        <ul>
            <li><strong>Provedores de Serviço:</strong> Podemos compartilhar informações com empresas terceirizadas que nos auxiliam na operação do nosso site (como Firebase para autenticação e banco de dados, Stripe para pagamentos e OpenAI para geração de receitas), mas eles são obrigados a manter suas informações confidenciais.</li>
            <li><strong>Obrigações Legais:</strong> Podemos divulgar suas informações se formos obrigados por lei a fazê-lo.</li>
        </ul>

        <h2 className={styles.sectionTitle}>4. Segurança dos Dados</h2>
        <p>Empregamos medidas de segurança para proteger suas informações. Usamos serviços confiáveis como o Firebase Authentication para proteger os dados da sua conta. No entanto, nenhum método de transmissão pela Internet ou armazenamento eletrônico é 100% seguro.</p>

        <h2 className={styles.sectionTitle}>5. Seus Direitos</h2>
        <p>Você tem o direito de acessar, atualizar ou solicitar a exclusão de suas informações pessoais. Você pode gerenciar as informações da sua conta na página "Minha Conta".</p>

        <h2 className={styles.sectionTitle}>6. Alterações a esta Política</h2>
        <p>Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações publicando a nova política nesta página.</p>

        <h2 className={styles.sectionTitle}>7. Contato</h2>
        <p>Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco.</p>
      </div>
    </>
  );
}