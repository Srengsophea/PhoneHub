import { useState } from 'react';
import { Modal, Input, Button } from './ui';
import { useAuth } from '@/stores/auth';
import { getErrorMessage } from '@/lib/api';

export function AuthModal() {
  const { authModal, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModal.mode || 'login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
      } else {
        await register(formData);
      }
      closeAuthModal();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={authModal.open}
      onClose={closeAuthModal}
      size="sm"
      title={mode === 'login' ? 'Welcome Back' : 'Create an Account'}
      description={
        authModal.reason ||
        (mode === 'login'
          ? 'Enter your credentials to access your PhoneHub account.'
          : 'Join PhoneHub to enjoy authentic warranties and express checkout.')
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        {mode === 'register' && (
          <Input
            label="Full Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
          />
        )}

        <Input
          label="Email Address"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="user@example.com"
        />

        {mode === 'register' && (
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1 234 567 890"
          />
        )}

        <Input
          label="Password"
          type="password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
        />

        {mode === 'register' && (
          <Input
            label="Confirm Password"
            type="password"
            required
            value={formData.password_confirmation}
            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
            placeholder="••••••••"
          />
        )}

        <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </Button>

        <div className="pt-2 text-center text-sm text-zinc-500">
          {mode === 'login' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-semibold text-zinc-900 hover:underline"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-semibold text-zinc-900 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}

