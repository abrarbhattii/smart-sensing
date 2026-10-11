import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError)
            setError(signInError.message);
        setBusy(false);
    };

    return (
      <div className="admin-center">
        <form className="admin-card admin-card--narrow" onSubmit={onSubmit}>
          <h1 className="h4 mb-1">SCD Admin</h1>
          <p className="text-muted mb-4">Sign in to manage site content.</p>
          <div className="mb-3">
            <label className="form-label" htmlFor="admin-email">Email</label>
            <input id="admin-email" type="email" className="form-control" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)}/>
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" className="form-control" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>
          {error ? <div className="alert alert-danger py-2">{error}</div> : null}
          <button type="submit" className="btn btn-primary w-100" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-center mt-3 mb-0"><Link to="/Home" className="small">← Back to site</Link></p>
        </form>
      </div>
    );
}
