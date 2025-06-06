import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Head>
        <title>FitApp Dashboard</title>
        <meta name="description" content="A decentralized fitness app on Polygon zkEVM" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary-600 mb-2">
              FitApp Dashboard
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Track your fitness, earn rewards, and collect achievements on Polygon zkEVM
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/dashboard" className="btn-primary">
                Launch App
              </Link>
              <Link href="/about" className="btn-secondary">
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Fitness Tracking</h2>
              <p>Connect with Google Fit to track your steps, calories, and more.</p>
            </div>
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Token Rewards</h2>
              <p>Earn HLTH tokens for reaching your fitness goals and milestones.</p>
            </div>
            <div className="card">
              <h2 className="text-xl font-bold mb-4">NFT Achievements</h2>
              <p>Collect unique NFT badges for your fitness accomplishments.</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

