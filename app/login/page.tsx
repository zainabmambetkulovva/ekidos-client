'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    localStorage.setItem('client-token', 'guest');
    localStorage.setItem('clientInfo', JSON.stringify({ id: 'guest', name: 'Жолоочу', email: 'guest@ekidos.kg' }));
    router.replace('/');
  }, [router]);
  return <div style={{minHeight:'100vh',background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',color:'#ef4444',fontSize:24,fontWeight:800}}>Ekidos</div>;
}