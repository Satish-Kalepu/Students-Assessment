import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardTitle } from '../components/Card';

const PortalCard: React.FC<{ to: string; title: string; description: string; buttonText: string }> = ({ to, title, description, buttonText }) => (
    <Link to={to} className="group no-underline text-current block">
        <Card className="w-full md:w-80 h-full flex flex-col items-center justify-between text-center group-hover:shadow-xl transition-shadow duration-300 transform group-hover:-translate-y-1 p-8">
            <div>
                <CardTitle className="mb-4">{title}</CardTitle>
                <CardContent className="p-0">
                    <p className="text-slate-600 mb-6">
                        {description}
                    </p>
                </CardContent>
            </div>
            <div className="px-6 py-3 text-base inline-flex items-center justify-center border border-transparent font-medium rounded-md shadow-sm text-white bg-blue-600 group-hover:bg-blue-700 transition-colors">
                {buttonText}
            </div>
        </Card>
    </Link>
);


const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-800">
                    Candidate Assessment Platform
                </h1>
                <p className="text-slate-600 mt-2 text-lg">
                    Please select your portal to continue.
                </p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <PortalCard 
                    to="/admin/login"
                    title="Admin Portal"
                    description="Manage students, create assessments, and view results."
                    buttonText="Go to Admin Login"
                />
                 <PortalCard 
                    to="/exam/login"
                    title="Student Portal"
                    description="Take your assigned assessment using your email and access code."
                    buttonText="Go to Student Login"
                />
            </div>
        </div>
    );
};

export default HomePage;
