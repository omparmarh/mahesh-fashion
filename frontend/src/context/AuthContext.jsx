import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState({ id: 'EXCEL_ADMIN', name: 'Mahesh Admin', role: 'admin' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Automatically set admin to skip login
        const defaultAdmin = { id: 'EXCEL_ADMIN', name: 'Mahesh Admin', role: 'admin' };
        setAdmin(defaultAdmin);
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Preserved for structure but no longer strictly needed for entry
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('admin', JSON.stringify(data.admin));
            setAdmin(data.admin);
            return data;
        } catch (error) {
            return { token: 'guest-token', admin: { id: 'EXCEL_ADMIN', name: 'Mahesh Admin' } };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        // setAdmin(null); // Keep admin set to avoid being kicked out
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, isAuthenticated: true, loading: false }}>
            {children}
        </AuthContext.Provider>
    );
};
