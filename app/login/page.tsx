'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ekidos-taxi-production-587e.up.railway.app';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/client/register' : '/api/auth/client/login';
      const body = mode === 'register'
        ? { email, password, name, phone }
        : { email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка');
        setLoading(false);
        return;
      }

      localStorage.setItem('client-token', data.token);
      localStorage.setItem('clientInfo', JSON.stringify(data.client));
      router.replace('/');
    } catch {
      setError('Сервер менен байланыш жок');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#141E30', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
        EKIDOS <span style={{ color: '#ef4444' }}>TAXI</span>
      </h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 32 }}>
        {mode === 'login' ? 'Аккаунтуңузга кириңиз' : 'Жаңы аккаунт түзүү'}
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340 }}>
        {mode === 'register' && (
          <>
            <input
              type="text"
              placeholder="Аты-жөнү"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="tel"
              placeholder="Телефон (+996...)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
              style={inputStyle}
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />

        {error && (
          <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#333' : '#ef4444',
            border: 'none', borderRadius: 12,
            color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: 16,
          }}
        >
          {loading ? '...' : mode === 'login' ? 'Кирүү' : 'Катталуу'}
        </button>

        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#7BBDE8', fontSize: 14, cursor: 'pointer' }}
          >
            {mode === 'login' ? 'Аккаунт жокпу? Катталуу' : 'Аккаунт барбы? Кирүү'}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '13px 16px',
  background: '#1a2740',
  border: '1px solid #35577D',
  borderRadius: 12,
  color: '#fff',
  fontSize: 15,
  marginBottom: 12,
  outline: 'none',
};
