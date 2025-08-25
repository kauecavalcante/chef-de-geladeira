'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LightRays from '@/components/LightRays/LightRays';
import { List, Wand2, ChefHat, DollarSign, Clock, Sparkles, Check, Star } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import Faq from '@/components/Faq/Faq';
import SafariBrowserMockup from '@/components/ui/SafariBrowserMockup/SafariBrowserMockup';
import AvatarCircles from '@/components/ui/AvatarCircles/AvatarCircles';
import StarConfettiButton from '@/components/ui/StarConfettiButton/StarConfettiButton';
import HandWrittenTitle from '@/components/ui/HandWrittenTitle/HandWrittenTitle';
import AnimatedUnderline from '@/components/ui/AnimatedUnderline/AnimatedUnderline';
import styles from './Landing.module.css';


function LandingNavbar() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIconWrapper}>
            <Image 
              src="/logo/Logochef.svg" 
              alt="Logótipo Chef de Geladeira"
              width={24} 
              height={24}
              className={styles.logoImage} 
            />
          </div>
          <span>Chef de Geladeira</span>
        </Link>
        <div className={styles.navActions}>
          <Link href="/auth" className={styles.loginButton}>
            Entrar
          </Link>
          <Link href="/auth" className={styles.ctaButton}>
            Criar Conta
          </Link>
        </div>
      </nav>
    </header>
  );
}

const avatarUrls = [
  "/avatars/user-1.png",
  "/avatars/user-2.png",
  "/avatars/user-3.png",
  "/avatars/user-4.png",
];

export default function LandingPage() {
  const gridVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <main className={styles.pageWrapper}>
      <LandingNavbar />
      <section className={styles.heroSection}>
        <div className={styles.heroBackground}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#FF6900" 
            raysSpeed={0.6}
            lightSpread={0.8}
            rayLength={1.2}
            followMouse={true}
            mouseInfluence={0.05}
            noiseAmount={0.05}
            distortion={0.02}
          />
        </div>
        
        <div className={styles.heroContent}>
          <div className={styles.textContent}>
            <div className={styles.socialProof}>
              <AvatarCircles numPeople={100} avatarUrls={avatarUrls} />
              <p>Amado por mais de 100 chefs caseiros!</p>
            </div>
            
            <h1 className={styles.heroTitle}>
              Sua geladeira cheia, suas ideias vazias?
            </h1>
            <p className={styles.heroSubtitle}>
              Transforme os ingredientes que você já tem em casa em receitas incríveis com o poder da Inteligência Artificial.
            </p>
            
            <StarConfettiButton>
              <Link href="/auth" className={`${styles.ctaButton} ${styles.heroCtaButton}`}>
                Começar a cozinhar de graça
              </Link>
            </StarConfettiButton>
          </div>

          <div className={styles.browserMockupContainer}>
            <SafariBrowserMockup>
              <video
                className={styles.heroVideo}
                autoPlay
                loop
                muted
                playsInline 
                src="/videos/hero-demo.mp4" 
              />
            </SafariBrowserMockup>
          </div>
        </div>
      </section>

      <section className={styles.howItWorksSection}>
        <div className={styles.sectionTitleWrapper}>
          <HandWrittenTitle title={"Cozinhar de forma inteligente\nem 3 passos"} />
        </div>
        
        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>
              <List size={24} />
            </div>
            <h3 className={styles.stepTitle}>Liste o que você tem</h3>
            <p className={styles.stepText}>
              Abra sua geladeira e armário. Diga-nos quais ingredientes você quer usar.
            </p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>
              <Wand2 size={24} />
            </div>
            <h3 className={styles.stepTitle}>Personalize seu prato</h3>
            <p className={styles.stepText}>
              Quer algo rápido, saudável ou econômico? Adicione estilos para refinar sua receita.
            </p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepIcon}>
              <ChefHat size={24} />
            </div>
            <h3 className={styles.stepTitle}>Receba e cozinhe!</h3>
            <p className={styles.stepText}>
              Em segundos, nosso Chef IA cria uma receita completa com passo a passo e dicas especiais.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.benefitsSection}>
        <div className={styles.sectionTitleWrapper}>
          <AnimatedUnderline text="Menos desperdício, mais sabor." />
        </div>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <DollarSign size={24} />
            </div>
            <h3 className={styles.benefitTitle}>Economize Dinheiro</h3>
            <p className={styles.benefitText}>
              Reduza o desperdício de alimentos e aproveite ao máximo suas compras.
            </p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Clock size={24} />
            </div>
            <h3 className={styles.benefitTitle}>Poupe Tempo</h3>
            <p className={styles.benefitText}>
              Chega de procurar por receitas. Crie pratos deliciosos em segundos.
            </p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>
              <Sparkles size={24} />
            </div>
            <h3 className={styles.benefitTitle}>Desperte a Criatividade</h3>
            <p className={styles.benefitText}>
              Descubra combinações e pratos que você nunca imaginou com os ingredientes de sempre.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.pricingSection}>
        <div className={styles.sectionTitleWrapper}>
            <AnimatedUnderline text="Um plano para cada tipo de fome." />
        </div>
        <motion.div 
          className={styles.pricingGrid}
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={cardVariants} className={styles.pricingCard}>
            <h3 className={styles.planTitle}>Gratuito</h3>
            <p className={styles.planPrice}>R$0 <span className={styles.planPeriod}>/mês</span></p>
            <ul className={styles.planFeatures}>
              <li><Check size={16} /> 10 receitas por mês</li>
              <li><Check size={16} /> Acesso às 3 últimas receitas no histórico</li>
              <li><Check size={16} /> Suporte por e-mail</li>
            </ul>
            <Link href="/auth" className={styles.planCta}>
              Começar agora
            </Link>
          </motion.div>
          <motion.div variants={cardVariants} className={`${styles.pricingCard} ${styles.premiumCard}`}>
            <div className={styles.premiumBadge}>Recomendado</div>
            <h3 className={styles.planTitle}><Star size={18} /> Premium</h3>
            <p className={styles.planPrice}>R$9,90 <span className={styles.planPeriod}>/mês</span></p>
            <ul className={styles.planFeatures}>
              <li><Check size={16} /> Receitas <strong>ilimitadas</strong></li>
              <li><Check size={16} /> Personalização com <strong>restrições alimentares</strong></li>
              <li><Check size={16} /> Acesso a <strong>funcionalidades futuras</strong></li>
              <li><Check size={16} /> Suporte <strong>prioritário</strong></li>
            </ul>
            <Link href="/pricing" className={`${styles.planCta} ${styles.premiumCta}`}>
              Quero ser Premium
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.faqSection}>
        <div className={styles.sectionTitleWrapper}>
            <AnimatedUnderline text="Ainda tem dúvidas?" />
        </div>
        <Faq />
      </section>

      <section className={styles.finalCtaSection}>
        <h2 className={styles.finalCtaTitle}>Pronto para transformar sua cozinha?</h2>
        <p className={styles.finalCtaSubtitle}>Chega de stress na hora de cozinhar. Deixe a criatividade fluir.</p>
        <StarConfettiButton>
          <Link href="/auth" className={`${styles.ctaButton} ${styles.heroCtaButton}`}>
            Criar minha conta gratuita
          </Link>
        </StarConfettiButton>
      </section>
    </main>
  );
}