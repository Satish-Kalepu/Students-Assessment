
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { Button } from '../../components/Button';

const AdminLayout: React.FC = () => {
    const { admin, logoutAdmin } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutAdmin();
        navigate('/admin/login');
    };
    
    const navLinkClasses = ({ isActive }: { isActive: boolean }) => 
        `flex items-center px-4 py-2 mt-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
        }`;

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                           <a href="#/admin/dashboard" className="text-2xl font-bold text-slate-800">Admin Panel</a>
                        </div>
                        <div className="flex items-center space-x-4">
                           <span className="text-sm text-slate-600">Welcome, {admin?.username}</span>
                           <Button onClick={handleLogout} variant="secondary" size="sm">Logout</Button>
                        </div>
                    </div>
                </div>
            </header>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex">
                <aside className="w-64 flex-shrink-0 mr-8">
                    <nav className="flex flex-col p-4 bg-white rounded-lg shadow-md">
                        <NavLink to="/admin/dashboard" className={navLinkClasses}>Dashboard</NavLink>
                        <NavLink to="/admin/students" className={navLinkClasses}>Students</NavLink>
                        <NavLink to="/admin/assessments" className={navLinkClasses}>Assessments</NavLink>
                        <NavLink to="/admin/assignments" className={navLinkClasses}>Assignments</NavLink>
                        {/* <NavLink to="/admin/users" className={navLinkClasses}>Users</NavLink> */}
                    </nav>
                </aside>
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
