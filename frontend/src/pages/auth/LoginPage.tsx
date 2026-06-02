import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { LogIn } from 'lucide-react';
import { login } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Field } from '../../components/common/Field';
import { AuthFrame } from './AuthFrame';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token }) => {
      signIn(token);
      navigate('/');
    }
  });

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in with your quiz platform account.">
      <Card className="p-5">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            mutation.mutate({
              username: String(form.get('username')),
              password: String(form.get('password'))
            });
          }}
        >
          <Field label="Username" name="username" autoComplete="username" required />
          <Field label="Password" name="password" type="password" autoComplete="current-password" required />
          {mutation.isError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              Login failed. Check your credentials or try again after the services are running.
            </div>
          )}
          <Button className="w-full" type="submit" loading={mutation.isPending} icon={<LogIn className="h-4 w-4" />}>
            Sign in
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-gray-600">
        New here? <Link className="font-bold text-ocean" to="/register">Create an account</Link>
      </p>
    </AuthFrame>
  );
}
