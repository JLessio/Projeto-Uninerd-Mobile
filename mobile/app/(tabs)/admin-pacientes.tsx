import { Redirect } from 'expo-router';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { useSession } from '@/contexts/SessionContext';
export default function AdminPatientsScreen() { const { user } = useSession(); return user?.nivel === 'admin' ? <AdminUserList role="paciente" /> : <Redirect href="/(tabs)" />; }
