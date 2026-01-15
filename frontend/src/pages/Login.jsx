/**
 * Login Page - Authentication forms (login & register)
 */
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                if (!formData.name.trim()) {
                    setError('Name is required');
                    setLoading(false);
                    return;
                }
                await register(formData.name, formData.email, formData.password);
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-5">
                    <div className="glass-card p-4 p-md-5 fade-in">
                        <div className="text-center mb-4">
                            <h2 className="mb-2" style={{ color: '#f1f5f9' }}>
                                {isLogin ? 'Welcome Back' : 'Join NeighborNews'}
                            </h2>
                            <p style={{ color: '#94a3b8' }}>
                                {isLogin
                                    ? 'Sign in to share and discover local news'
                                    : 'Create an account to start posting'}
                            </p>
                        </div>

                        {error && (
                            <div className="alert alert-danger d-flex align-items-center" role="alert">
                                <span>⚠️ {error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {!isLogin && (
                                <div className="mb-3">
                                    <label className="form-label" style={{ color: '#94a3b8' }}>Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="Your name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required={!isLogin}
                                    />
                                </div>
                            )}

                            <div className="mb-3">
                                <label className="form-label" style={{ color: '#94a3b8' }}>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="form-label" style={{ color: '#94a3b8' }}>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 mb-3"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                ) : null}
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </button>
                        </form>

                        <div className="text-center">
                            <button
                                type="button"
                                className="btn btn-link"
                                style={{ color: '#94a3b8' }}
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                            >
                                {isLogin
                                    ? "Don't have an account? Sign up"
                                    : 'Already have an account? Sign in'}
                            </button>
                        </div>

                        <div className="text-center mt-3">
                            <Link to="/" style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
