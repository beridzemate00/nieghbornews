/**
 * Main App Component with Router and Layout
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import NewsDetail from './pages/NewsDetail';
import AddNews from './pages/AddNews';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';

// Protected Route wrapper
function ProtectedRoute({ children, adminOnly = false }) {
    const { user, loading, isAdmin } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" />;
    }

    return children;
}

function AppContent() {
    return (
        <div className="min-h-screen">
            <Header />
            <main className="pt-20">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/news/:id" element={<NewsDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/add"
                        element={
                            <ProtectedRoute>
                                <AddNews />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute adminOnly>
                                <AdminPanel />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
