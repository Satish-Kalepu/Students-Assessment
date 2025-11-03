import React, { useState, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AdminUser, AssignmentStudent } from './types';
import { api } from './services/mockApi';

// Dummy pages for now
import { Layout } from './components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from './components/Card';
import { Button } from './components/Button';
import { Spinner } from './components/Spinner';

// Real Pages
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminAssessmentsPage from './pages/admin/AdminAssessmentsPage';
import AdminAssignmentsPage from './pages/admin/AdminAssignmentsPage';
import AdminSkillsPage from './pages/admin/AdminSkillsPage';

import ExamLoginPage from './pages/exam/ExamLoginPage';
import ExamPage from './pages/exam/ExamPage';


interface AuthContextType {
    admin: AdminUser | null;
    student: AssignmentStudent | null;
    loginAdmin: (user: AdminUser) => void;
    logoutAdmin: () => void;
    loginStudent: (studentData: AssignmentStudent) => void;
    logoutStudent: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [student, setStudent] = useState<AssignmentStudent | null>(null);
    const [loading, setLoading] = useState(true);

    const loginAdmin = useCallback((user: AdminUser) => {
        setAdmin(user);
        sessionStorage.setItem('admin', JSON.stringify(user));
    }, []);

    const logoutAdmin = useCallback(() => {
        setAdmin(null);
        sessionStorage.removeItem('admin');
    }, []);
    
    const loginStudent = useCallback((studentData: AssignmentStudent) => {
        setStudent(studentData);
        sessionStorage.setItem('student', JSON.stringify(studentData));
    }, []);

    const logoutStudent = useCallback(() => {
        setStudent(null);
        sessionStorage.removeItem('student');
    }, []);

    // Persist/load from sessionStorage or handle preview mode
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
        if (params.get('preview') === 'admin') {
            const adminUser: AdminUser = {
                id: 1,
                username: 'admin',
                createdOn: new Date().toISOString(),
            };
            loginAdmin(adminUser);
            
            const currentPath = window.location.hash.split('?')[0];
            if (['', '#/', '#/exam/login'].includes(currentPath)) {
                window.location.hash = '/admin/dashboard';
            }

            setLoading(false);
            return; // Skip session storage check
        }

        const storedAdmin = sessionStorage.getItem('admin');
        const storedStudent = sessionStorage.getItem('student');
        if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
        if (storedStudent) setStudent(JSON.parse(storedStudent));
        setLoading(false);
    }, [loginAdmin]);

    const value = useMemo(() => ({
        admin,
        student,
        loginAdmin,
        logoutAdmin,
        loginStudent,
        logoutStudent,
        loading
    }), [admin, student, loading, loginAdmin, logoutAdmin, loginStudent, logoutStudent]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
    }
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


const AdminProtectedRoute = () => {
    const { admin } = useAuth();
    const location = useLocation();

    if (!admin) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

const StudentProtectedRoute = () => {
    const { student } = useAuth();
    const location = useLocation();

    if (!student) {
        return <Navigate to="/exam/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};


const App = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />

                    {/* Exam Routes */}
                    <Route path="/exam/login" element={<ExamLoginPage />} />
                    <Route element={<StudentProtectedRoute />}>
                       <Route path="/exam/assignment/:assignmentStudentId" element={<ExamPage />} />
                    </Route>
                    

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    {/* FIX: Refactored admin routes to use a more standard nesting pattern for protected and layout routes. */}
                    <Route path="/admin" element={<AdminProtectedRoute />}>
                        <Route element={<AdminLayout />}>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboardPage />} />
                            <Route path="skills" element={<AdminSkillsPage />} />
                            <Route path="students" element={<AdminStudentsPage />} />
                            <Route path="assessments" element={<AdminAssessmentsPage />} />
                            <Route path="assignments" element={<AdminAssignmentsPage />} />
                            {/* <Route path="users" element={<div>Admin Users</div>} /> */}
                        </Route>
                    </Route>
                    
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </HashRouter>
        </AuthProvider>
    );
};

export default App;