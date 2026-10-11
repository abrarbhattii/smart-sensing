import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { checkIsAdmin } from './adminApi';
import { AdminLayout } from './AdminLayout';
import { Dashboard } from './Dashboard';
import { LoginPage } from './LoginPage';
import { RecordForm } from './RecordForm';
import { TablePage } from './TablePage';
import './admin.css';

function useSession() {
    const [session, setSession] = useState(undefined);
    useEffect(() => {
        if (!supabase)
            return undefined;
        supabase.auth.getSession().then(({ data }) => setSession(data.session));
        const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
        return () => data.subscription.unsubscribe();
    }, []);
    return session;
}

function useAdminCheck(session) {
    const [state, setState] = useState({ userId: null, status: 'checking' });
    const userId = session?.user?.id ?? null;
    useEffect(() => {
        if (!userId)
            return undefined;
        let cancelled = false;
        checkIsAdmin()
            .then((ok) => !cancelled && setState({ userId, status: ok ? 'admin' : 'denied' }))
            .catch(() => !cancelled && setState({ userId, status: 'denied' }));
        return () => {
            cancelled = true;
        };
    }, [userId]);
    return state.userId === userId ? state.status : 'checking';
}

function CenteredMessage({ children }) {
    return <div className="admin-center"><div className="admin-card admin-card--narrow">{children}</div></div>;
}

export function AdminApp() {
    const session = useSession();
    const adminStatus = useAdminCheck(session);

    useEffect(() => {
        document.title = 'SCD Admin';
    }, []);

    if (!supabase) {
        return (
          <CenteredMessage>
            <h1 className="h4">Admin unavailable</h1>
            <p className="mb-0">Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in <code>.env.local</code>.</p>
          </CenteredMessage>
        );
    }
    if (session === undefined || (session && adminStatus === 'checking')) {
        return <CenteredMessage><div className="loading mx-auto"/></CenteredMessage>;
    }
    if (!session) {
        return <LoginPage />;
    }
    if (adminStatus === 'denied') {
        return (
          <CenteredMessage>
            <h1 className="h4">No admin access</h1>
            <p>{session.user.email} is signed in but is not listed as an admin.</p>
            <button type="button" className="btn btn-outline-secondary" onClick={() => supabase.auth.signOut()}>Sign out</button>
          </CenteredMessage>
        );
    }

    return (
      <AdminLayout email={session.user.email}>
        <Routes>
          <Route index element={<Dashboard />}/>
          <Route path=":table" element={<TablePage />}/>
          <Route path=":table/new" element={<RecordForm />}/>
          <Route path=":table/edit/:id" element={<RecordForm />}/>
        </Routes>
      </AdminLayout>
    );
}
