import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';

const AdminDashboardPage: React.FC = () => {
    // In a real app, you would fetch this data
    const stats = {
        students: 4,
        assessments: 1,
        assignments: 1,
        completedExams: 0
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.students}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Assessments Created</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.assessments}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Assignments Issued</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.assignments}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Completed Exams</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{stats.completedExams}</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboardPage;