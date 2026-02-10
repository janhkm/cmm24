import { redirect } from 'next/navigation';

// Diese Route liegt ausserhalb des [locale]/(seller) Layouts.
// Redirect zur korrekten localisierten Route.
export default function KontakteRedirect() {
  redirect('/de/seller/kontakte');
}
