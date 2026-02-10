import { redirect } from 'next/navigation';

// Diese Route liegt ausserhalb des [locale]/(seller) Layouts.
// Redirect zur korrekten localisierten Route.
export default async function KontaktDetailRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/de/seller/kontakte/${id}`);
}
