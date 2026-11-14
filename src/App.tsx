import { useEffect, useState } from 'react';
import { AnalyzerWorkspace } from './components/AnalyzerWorkspace';
import { FAQ } from './components/FAQ';
import { Features } from './components/Features';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Navbar } from './components/Navbar';

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  const [sampleTriggerCount, setSampleTriggerCount] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      try {
        localStorage.setItem('resumelens_theme', 'dark');
      } catch {
        // Ignore storage errors
      }
    } else {
      root.classList.remove('dark');
      try {
        localStorage.setItem('resumelens_theme', 'light');
      } catch {
        // Ignore storage errors
      }
    }
  }, [isDark]);

  const scrollToAnalyzer = () => {
    const el = document.getElementById('analyzer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleHeroTrySample = () => {
    setSampleTriggerCount((c) => c + 1);
    scrollToAnalyzer();
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Navbar
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onJumpToAnalyzer={scrollToAnalyzer}
      />

      <main>
        <Hero onAnalyzeClick={scrollToAnalyzer} onTrySampleClick={handleHeroTrySample} />
        <HowItWorks />
        <Features />
        <AnalyzerWorkspace sampleTriggerCount={sampleTriggerCount} />
        <FAQ />
      </main>

      <Footer isDark={isDark} onToggleTheme={() => setIsDark((prev) => !prev)} />
    </div>
  );
}
