import { redirect } from 'next/navigation';

/**
 * Fallback-Layout fuer nicht-lokalisierte /seller/* Routen.
 * Leitet immer auf die lokalisierte Version /de/seller/* um.
 */
export default function NonLocalizedSellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  redirect('/de/seller/dashboard');
}
