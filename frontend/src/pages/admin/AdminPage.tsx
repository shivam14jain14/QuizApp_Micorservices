import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, UserCog, Users } from 'lucide-react';
import { getUsers, updateRole } from '../../api/authApi';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Field, SelectField } from '../../components/common/Field';
import type { Role } from '../../types';

export function AdminPage() {
  const queryClient = useQueryClient();
  const users = useQuery({ queryKey: ['admin-users'], queryFn: getUsers });
  const mutation = useMutation({
    mutationFn: ({ username, role }: { username: string; role: Role }) => updateRole(username, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-coral">Admin controls</p>
        <h2 className="text-3xl font-black text-ink">User Role Management</h2>
        <p className="mt-1 text-sm text-gray-500">Update user access for the quiz workspace.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-ocean" />
            <h3 className="text-lg font-black">Update Role</h3>
          </div>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              mutation.mutate({
                username: String(form.get('username')),
                role: String(form.get('role')) as Role
              });
            }}
          >
            <Field label="Username" name="username" required />
            <SelectField label="Role" name="role" options={[
              { label: 'Admin', value: 'ADMIN' },
              { label: 'Student', value: 'STUDENT' },
              { label: 'Teacher', value: 'TEACHER' }
            ]} />
            <div className="flex items-end">
              <Button type="submit" loading={mutation.isPending} icon={<Shield className="h-4 w-4" />}>
                Apply Role
              </Button>
            </div>
          </form>
          {mutation.data && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{mutation.data}</p>}
          {mutation.isError && <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-bold text-rose-700">Unable to update role.</p>}
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-black">Security Model</h3>
          <div className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
            <p>Admin-only route protection is enforced in the React router and backed by the backend security rules.</p>
            <p>Role changes affect which screens users can access after sign-in.</p>
            <p>Question and quiz actions remain available only through the secured application flow.</p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-gray-100 p-5">
          <Users className="h-5 w-5 text-ocean" />
          <h3 className="text-lg font-black">Users</h3>
        </div>
        {users.isLoading ? (
          <div className="p-5 text-sm font-semibold text-gray-500">Loading users...</div>
        ) : users.isError ? (
          <div className="p-5 text-sm font-bold text-rose-700">Unable to load users.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                <tr>
                  <th className="px-4 py-3">First name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Last name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Requested role</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(users.data ?? []).map((user) => (
                  <tr key={user.username} className="bg-white">
                    <td className="px-4 py-3 font-semibold text-ink">{user.firstname || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{user.username}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{user.lastname || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{user.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <Badge className="border-blue-200 bg-blue-50 text-blue-700">{user.requestedRole ?? '-'}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="border-gray-200 bg-gray-50 text-gray-700">{user.role}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
