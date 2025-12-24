import { BentoCard } from '@aether-link/ui';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-brand-dark">
      <div className="max-w-xl w-full text-center space-y-8 animate-fade-in">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-brand-green flex items-center justify-center shadow-[0_0_40px_-5px_theme(colors.brand.green)] border-4 border-brand-dark">
            <span className="text-5xl font-serif font-black text-brand-dark tracking-tighter italic">A</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-serif font-bold text-white tracking-tight">Aether Link</h1>
          <p className="text-xl text-brand-muted font-light tracking-wide">
            Your link-in-bio, <span className="text-brand-green italic font-serif">elevated</span>.
          </p>
        </div>

        <BentoCard className="p-8 text-left border-brand-border/50 bg-brand-gray/30">
          <p className="text-brand-text text-lg mb-4 font-sans">
            Visit a profile to see it in action:
          </p>
          <div className="flex items-center gap-3 bg-brand-dark p-3 rounded-xl border border-brand-border font-mono text-sm text-brand-muted">
            <span className="text-brand-green">$</span>
            <span>domain.com/</span>
            <span className="text-white">username</span>
          </div>
        </BentoCard>
      </div>
    </main>
  );
}