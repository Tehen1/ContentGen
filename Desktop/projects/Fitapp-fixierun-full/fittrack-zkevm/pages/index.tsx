import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ClientWalletConnect from '../components/ClientWalletConnect';
import styles from '../styles/Home.module.css';

const HomePage: React.FC = () => {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <Head>
        <title>FitTrack zkEVM | Privacy-Focused Fitness Tracking</title>
        <meta 
          name="description" 
          content="FitTrack zkEVM - Track your fitness journey with blockchain-powered privacy and rewards" 
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <h1 className={styles.logo}>FitTrack<span className={styles.highlight}>zkEVM</span></h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/workouts" className={styles.navLink}>Workouts</Link>
          <a href="#features" className={styles.navLink}>Features</a>
          <a href="#about" className={styles.navLink}>About</a>
        </nav>
        <div className={styles.walletContainer}>
          <ClientWalletConnect />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Privacy-First <span className={styles.highlight}>Fitness Tracking</span> on the Blockchain
            </h1>
            <p className={styles.description}>
              Track your workouts, earn rewards, and maintain complete privacy with 
              zero-knowledge proofs on Polygon zkEVM.
            </p>
            <div className={styles.buttonGroup}>
              <button 
                className={`${styles.button} ${styles.primaryButton}`}
                onClick={() => router.push('/workouts')}
              >
                Track Workout
              </button>
              <a 
                href="#features" 
                className={`${styles.button} ${styles.secondaryButton}`}
              >
                Learn More
              </a>
            </div>
          </div>
          <div className={styles.heroImage}>
            {/* Image placeholder */}
            <div className={styles.imagePlaceholder}>
              <span>Fitness Tracking Visualization</span>
            </div>
          </div>
        </section>

        <section id="features" className={styles.features}>
          <h2 className={styles.sectionTitle}>Key Features</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔒</div>
              <h3>Privacy Protection</h3>
              <p>Keep your fitness data private with zero-knowledge proofs on Polygon zkEVM.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🏃</div>
              <h3>Activity Tracking</h3>
              <p>Record runs, walks, strength training and more with blockchain verification.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🏆</div>
              <h3>Reward System</h3>
              <p>Earn tokens and NFT achievements as you reach fitness milestones.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3>Data Insights</h3>
              <p>View detailed analytics about your fitness journey while maintaining privacy.</p>
            </div>
          </div>
        </section>

        <section id="about" className={styles.about}>
          <h2 className={styles.sectionTitle}>About FitTrack zkEVM</h2>
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <p>
                FitTrack zkEVM combines the power of blockchain technology with zero-knowledge 
                proofs to create a fitness tracking application that respects your privacy.
              </p>
              <p>
                Built on Polygon&apos;s zkEVM network, FitTrack provides the security and 
                immutability of blockchain while ensuring your personal fitness data remains 
                private. Track your workouts, earn rewards, and maintain control over your data.
              </p>
              <p>
                Our smart contracts are optimized for the zkEVM environment, providing fast 
                transactions with minimal gas fees.
              </p>
            </div>
            <div className={styles.technologyStack}>
              <h3>Technology Stack</h3>
              <ul className={styles.techList}>
                <li>Polygon zkEVM</li>
                <li>Next.js & TypeScript</li>
                <li>Zero-Knowledge Proofs</li>
                <li>ERC-1155 Multi-Token Standard</li>
                <li>Hardhat Development Environment</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <h2>Ready to start your privacy-focused fitness journey?</h2>
          <button 
            className={`${styles.button} ${styles.primaryButton}`}
            onClick={() => router.push('/workouts')}
          >
            Get Started Now
          </button>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <h3>FitTrack<span className={styles.highlight}>zkEVM</span></h3>
          </div>
          <div className={styles.footerLinks}>
            <div className={styles.footerLinkSection}>
              <h4>Navigation</h4>
              <Link href="/">Home</Link>
              <Link href="/workouts">Workouts</Link>
              <a href="#features">Features</a>
              <a href="#about">About</a>
            </div>
            <div className={styles.footerLinkSection}>
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
            <div className={styles.footerLinkSection}>
              <h4>Connect</h4>
              <a href="#">Twitter</a>
              <a href="#">Discord</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} FitTrack zkEVM. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

