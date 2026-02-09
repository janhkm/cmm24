import { Header, Subheader, Footer } from '@/components/layout';
import { CompareBar } from '@/components/shared/compare-bar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Subheader />
      <Header />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      
      {/* Compare Bar */}
      <CompareBar />
    </div>
  );
}
