import { redirect } from 'next/navigation';

// Pipeline is now the default view for inquiries
export default function AnfragenPage() {
  redirect('/seller/anfragen/pipeline');
}
