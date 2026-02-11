import { Header, Subheader, Footer } from '@/components/layout';
import { createClient } from '@/lib/supabase/server';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // User-Daten serverseitig laden fuer den Header
  let userData: { id: string; email: string; fullName: string | null; avatarUrl: string | null } | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
      userData = {
        id: user.id,
        email: user.email || '',
        fullName: profile?.full_name || null,
        avatarUrl: profile?.avatar_url || null,
      };
    }
  } catch {
    // Nicht eingeloggt - kein Problem
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden">
      <Subheader />
      <Header user={userData} />
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <div className="flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-4xl">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
