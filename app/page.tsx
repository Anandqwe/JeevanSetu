'use client';

import { startTransition, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ambulance, AlertTriangle, User } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      if (role === 'patient') router.push('/patient/emergency');
      else if (role === 'driver') router.push('/driver/dashboard');
      else if (role === 'hospital') router.push('/hospital/dashboard');
      return () => {
        isMounted = false;
      };
    }

    startTransition(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <Ambulance className="h-12 w-12 text-red-600 mb-4" />
          <p className="text-slate-500">Loading Jeevan Setu...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-red-100 p-3 rounded-full">
              <Ambulance className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Jeevan Setu</h1>
          <p className="text-slate-500">Emergency Response Marketplace</p>
        </div>

        <div className="grid gap-4">
          <Card className="border-red-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/patient/emergency')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Emergency Mode
              </CardTitle>
              <CardDescription>
                Report an accident or request immediate help. No login required for bystanders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full font-semibold">
                Report Accident / Emergency
              </Button>
            </CardContent>
          </Card>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-100 px-2 text-slate-500">Or</span>
            </div>
          </div>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Access
              </CardTitle>
              <CardDescription>
                Login for Patients, Drivers, and Hospital Admins.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">
                  Login / Register
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Jeevan Setu. Saving Lives.
        </p>
      </div>
    </main>
  );
}
