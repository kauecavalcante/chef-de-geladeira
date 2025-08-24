import { Navbar } from '@/components/Navbar/Navbar';
import styles from './Legal.module.css';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className={styles.legalContainer}>
        <h1 className={styles.mainTitle}>Termos de Serviço</h1>
        <p className={styles.lastUpdated}>Última atualização: 23 de Agosto de 2025</p>

        <div className={styles.disclaimer}>
          <strong>AVISO:</strong> Este é um modelo de Termos de Serviço. Recomenda-se que você consulte um profissional legal para garantir que este documento atenda a todas as necessidades específicas do seu negócio e esteja em conformidade com as leis locais e internacionais.
        </div>

        <h2 className={styles.sectionTitle}>1. Contas de Usuário</h2>
        <p>Ao criar uma conta conosco, você deve nos fornecer informações precisas, completas e atuais em todos os momentos. A falha em fazer isso constitui uma violação dos Termos, o que pode resultar na rescisão imediata de sua conta em nosso Serviço.</p>
        <p>Você é responsável por proteger a senha que usa para acessar o Serviço e por quaisquer atividades ou ações sob sua senha.</p>

        <h2 className={styles.sectionTitle}>2. Assinaturas e Pagamentos</h2>
        <p>Oferecemos um plano gratuito e um plano "Premium" pago.</p>
        <ul>
          <li><strong>Plano Gratuito:</strong> Sujeito a limitações, como um número máximo de receitas geradas por mês.</li>
          <li><strong>Plano Premium:</strong> Oferece acesso ilimitado e funcionalidades exclusivas mediante o pagamento de uma taxa de assinatura recorrente.</li>
        </ul>
        <p>Os pagamentos são processados através do nosso parceiro de pagamentos, Stripe. Ao fornecer informações de pagamento, você declara e garante que as informações são precisas e que você está autorizado a usar o método de pagamento fornecido.</p>

        <h2 className={styles.sectionTitle}>3. Conteúdo Gerado por IA</h2>
        <p>As receitas, dicas e outras informações fornecidas pelo nosso Serviço são geradas por um modelo de inteligência artificial. Embora nos esforcemos para fornecer conteúdo de alta qualidade, não garantimos a precisão, adequação ou segurança de qualquer receita.</p>
        <p><strong>Você é o único responsável por sua segurança na cozinha.</strong> Sempre use o bom senso, verifique alergias e siga as práticas seguras de manuseio de alimentos. O Chef de Geladeira não se responsabiliza por quaisquer resultados adversos, incluindo, mas não se limitando a, reações alérgicas ou acidentes culinários.</p>

        <h2 className={styles.sectionTitle}>4. Propriedade Intelectual</h2>
        <p>O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva do Chef de Geladeira e de seus licenciadores.</p>

        <h2 className={styles.sectionTitle}>5. Rescisão</h2>
        <p>Podemos rescindir ou suspender sua conta imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.</p>

        <h2 className={styles.sectionTitle}>6. Limitação de Responsabilidade</h2>
        <p>Em nenhuma circunstância o Chef de Geladeira, nem seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados, serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do seu uso do Serviço.</p>

        <h2 className={styles.sectionTitle}>7. Alterações nos Termos</h2>
        <p>Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes Termos a qualquer momento. Iremos notificá-lo sobre quaisquer alterações, publicando os novos Termos de Serviço nesta página.</p>

        <h2 className={styles.sectionTitle}>8. Contato</h2>
        <p>Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco.</p>
      </div>
    </>
  );
}