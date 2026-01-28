import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CheckIn from './pages/CheckIn';
import History from './pages/History';
import Reports from './pages/Reports';
import Layout from './components/Layout';

function AppContent() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                // If user data is corrupted, clear it
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const handleLogout = () => {
        // Clear all auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        // Explicitly navigate to login
        navigate('/login', { replace: true });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <Routes>
            <Route 
                path="/login" 
                element={
                    user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
                } 
            />
            <Route 
                path="/" 
                element={
                    user ? <Layout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard user={user} />} />
                
                {/* Employee-only routes */}
                {user && user.role === 'employee' && (
                    <>
                        <Route path="checkin" element={<CheckIn user={user} />} />
                        <Route path="history" element={<History user={user} />} />
                    </>
                )}
                
                {/* Manager-only routes */}
                {user && user.role === 'manager' && (
                    <Route path="reports" element={<Reports user={user} />} />
                )}
                
                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
        </Routes>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}

export default App;
