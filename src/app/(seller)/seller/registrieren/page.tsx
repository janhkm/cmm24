import { redirect } from 'next/navigation';

// Diese Route liegt ausserhalb des [locale]/(seller) Layouts.
// Redirect zur korrekten localisierten Route.
export default function RegistrierenRedirect() {
  redirect('/de/seller/registrieren');
}
