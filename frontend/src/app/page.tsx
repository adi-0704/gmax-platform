import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect base URL to the login application
  redirect('/login');
}
