import Link from 'next/link';

export const metadata = {
  title: 'Neon Rush',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-black to-black"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-2 tracking-widest drop-shadow-[0_0_25px_rgba(0,255,255,0.4)]">
          NEON RUSH
        </h1>
        <p className="text-xl text-cyan-200/60 mb-12 tracking-[0.3em] uppercase">
          Endless Synthwave Racing
        </p>

        <div className="flex gap-6 mt-8">
          <Link 
            href="/game"
            className="group relative px-12 py-4 bg-transparent overflow-hidden rounded-sm transition-all"
          >
            <div className="absolute inset-0 border border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.5)_inset]"></div>
            <div className="absolute inset-0 bg-cyan-400 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300 ease-out"></div>
            <span className="relative z-10 text-cyan-400 group-hover:text-black font-bold tracking-[0.2em] uppercase transition-colors duration-300">
              Start Engine
            </span>
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-10 text-cyan-500/30 text-sm tracking-widest uppercase font-mono">
        W A S D / Arrows to Drive
      </div>
    </main>
  );
}
