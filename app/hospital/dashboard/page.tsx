'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function HospitalDashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/');
  };

  return (
    <div className="p-8 text-center space-y-4">
      <h1 className="text-2xl font-bold text-green-600">Hospital Dashboard</h1>
      <p>Live emergency table will go here.</p>
      <Button variant="outline" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
}
