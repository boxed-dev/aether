import Link from 'next/link';
import { BentoCard } from '@aether-link/ui';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-brand-dark text-brand-text">
      <div className="relative">
        <div className="absolute -inset-10 bg-brand-green/10 blur-[100px] rounded-full"></div>
        <BentoCard className="relative max-w-lg text-center p-12 border-brand-border bg-brand-gray/80 backdrop-blur-xl">
          <h1 className="text-9xl font-serif font-black text-brand-green mb-2 tracking-tighter opacity-90">404</h1>
          <div className="w-16 h-1 bg-brand-green mx-auto mb-8"></div>

          <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
          <p className="text-lg text-brand-muted mb-10 font-light leading-relaxed">
            The profile you are looking for doesn't exist or has been moved to another dimension.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-green text-brand-dark font-bold text-lg hover:scale-105 hover:shadow-[0_0_30px_-5px_theme(colors.brand.green)] transition-all duration-300"
          >
            <span>Return Home</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </BentoCard>
      </div>
    </main>
  );
}