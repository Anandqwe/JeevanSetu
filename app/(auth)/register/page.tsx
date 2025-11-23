'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Ambulance, Lock, Phone, User, Stethoscope, Car } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'patient' | 'driver' | 'hospital'>('patient');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      setIsLoading(false);
      return;
    }

    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock registration logic
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
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Join Jeevan Setu to help save lives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div 
                onClick={() => setRole('patient')}
                className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-colors ${role === 'patient' ? 'bg-red-50 border-red-200 text-red-700' : 'hover:bg-slate-50'}`}
              >
                <User className="h-5 w-5" />
                <span className="text-xs font-medium">Patient</span>
              </div>
              <div 
                onClick={() => setRole('driver')}
                className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-colors ${role === 'driver' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'hover:bg-slate-50'}`}
              >
                <Car className="h-5 w-5" />
                <span className="text-xs font-medium">Driver</span>
              </div>
              <div 
                onClick={() => setRole('hospital')}
                className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center gap-1 transition-colors ${role === 'hospital' ? 'bg-green-50 border-green-200 text-green-700' : 'hover:bg-slate-50'}`}
              >
                <Stethoscope className="h-5 w-5" />
                <span className="text-xs font-medium">Hospital</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  className="pl-9"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-9"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-slate-500">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-red-600 hover:underline font-medium">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
