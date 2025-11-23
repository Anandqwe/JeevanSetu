'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DriverDashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    router.push('/');
  };

  return (
    <div className="p-8 text-center space-y-4">
      <h1 className="text-2xl font-bold text-blue-600">Driver Dashboard</h1>
      <p>Job requests will appear here.</p>
      <Button variant="outline" onClick={handleLogout}>
        Logout (Go Offline)
      </Button>
    </div>
  );
}
