import { Redirect } from 'expo-router';
import { AdminUserList } from '@/components/admin/AdminUserList';
import { useSession } from '@/contexts/SessionContext';
export default function AdminDoctorsScreen() { const { user } = useSession(); return user?.nivel === 'admin' ? <AdminUserList role="medico" /> : <Redirect href="/(tabs)" />; }
