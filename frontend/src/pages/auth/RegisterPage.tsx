import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { register } from '../../api/authApi';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Field, SelectField } from '../../components/common/Field';
import { AuthFrame } from './AuthFrame';
import type { Role } from '../../types';

const roleOptions = [
  { label: 'Student', value: 'STUDENT' },
  { label: 'Teacher', value: 'TEACHER' },
  { label: 'Admin', value: 'ADMIN' }
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('STUDENT');
  const [batch, setBatch] = useState('');
  const mutation = useMutation({
    mutationFn: register,
    onSuccess: () => navigate('/login')
  });
  const isBatchDisabled = role === 'TEACHER' || role === 'ADMIN';

  return (
    <AuthFrame title="Create account" subtitle="Register with profile details and quiz access.">
      <Card className="p-5">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const selectedRole = String(form.get('role')) as Role;
            mutation.mutate({
              username: String(form.get('username')),
              firstname: String(form.get('firstname')),
              lastname: String(form.get('lastname')),
              email: String(form.get('email')),
              phone: String(form.get('phone')),
              password: String(form.get('password')),
              batch: selectedRole === 'STUDENT' ? batch.trim() : 'NA',
              role: selectedRole
            });
          }}
        >
          <Field label="Username" name="username" required />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" name="firstname" required />
            <Field label="Last name" name="lastname" required />
          </div>
          <Field label="Email" name="email" type="email" required />
          <Field label="Phone number" name="phone" type="tel" required />
          <Field label="Password" name="password" type="password" required />
          <SelectField
            label="Role"
            name="role"
            options={roleOptions}
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            required
          />
          <Field
            label="Batch"
            name="batch"
            placeholder={isBatchDisabled ? 'NA' : 'A1, B2, 2026-CS'}
            value={isBatchDisabled ? 'NA' : batch}
            onChange={(event) => setBatch(event.target.value)}
            disabled={isBatchDisabled}
            required={!isBatchDisabled}
          />
          {mutation.isError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              Registration failed. Username or email may already exist.
            </div>
          )}
          <Button className="w-full" type="submit" loading={mutation.isPending} icon={<UserPlus className="h-4 w-4" />}>
            Create account
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already registered? <Link className="font-bold text-ocean" to="/login">Sign in</Link>
      </p>
    </AuthFrame>
  );
}
