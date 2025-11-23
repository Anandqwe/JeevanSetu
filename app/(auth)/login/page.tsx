'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Ambulance, Lock, Phone } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Replace with actual API call
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { phone, password } = formData;
    let role = '';

    // Hardcoded credentials for demo
    if (phone === '1234567890' && password === 'patient123') {
      role = 'patient';
    } else if (phone === '9876543210' && password === 'driver123') {
      role = 'driver';
    } else if (phone === '1122334455' && password === 'hospital123') {
      role = 'hospital';
    } else {
      alert('Invalid credentials! Please check the demo hints below.');
      setIsLoading(false);
      return;
    }

    const mockToken = 'mock-jwt-token-' + Date.now();
    localStorage.setItem('token', mockToken);
    localStorage.setItem('role', role);

    // Redirect based on role
    if (role === 'patient') router.push('/patient/emergency');
    else if (role === 'driver') router.push('/driver/dashboard');
    else if (role === 'hospital') router.push('/hospital/dashboard');
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-slate-200 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <Ambulance className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your phone number to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="phone" 
                  placeholder="9876543210" 
                  className="pl-9"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-9"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-slate-500">
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-red-600 hover:underline font-medium">
              Register
            </Link>
          </p>
          <div className="text-xs text-left bg-slate-100 p-3 rounded w-full space-y-1">
            <p className="font-semibold text-center mb-2">Demo Credentials:</p>
            <p><span className="font-medium">Patient:</span> 1234567890 / patient123</p>
            <p><span className="font-medium">Driver:</span> 9876543210 / driver123</p>
            <p><span className="font-medium">Hospital:</span> 1122334455 / hospital123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
