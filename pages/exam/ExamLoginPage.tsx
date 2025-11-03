
import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/mockApi';
import { useAuth } from '../../App';
import { Layout } from '../../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Assignment } from '../../types';

const ExamLoginPage: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState('');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { loginStudent } = useAuth();

    useEffect(() => {
        const fetchAssignments = async () => {
            const data = await api.getAssignments();
            setAssignments(data);
            if (data.length > 0) {
                setSelectedAssignment(String(data[0].id));
            }
        };
        fetchAssignments();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const studentData = await api.studentLogin(Number(selectedAssignment), email, code);
        setIsLoading(false);

        if (studentData) {
            loginStudent(studentData);
            navigate(`/exam/assignment/${studentData.id}`);
        } else {
            setError('Invalid details, or you have already completed this assignment.');
        }
    };

    return (
        <Layout>
            <div className="flex justify-center items-center py-12">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Student Exam Login</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="assignment" className="block text-sm font-medium text-slate-700">Select Assignment</label>
                                <select 
                                    id="assignment" 
                                    value={selectedAssignment}
                                    onChange={(e) => setSelectedAssignment(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                >
                                    {assignments.map(a => <option key={a.id} value={a.id}>{a.name_of_assignment}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="code" className="block text-sm font-medium text-slate-700">Access Code</label>
                                <input
                                    type="text"
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    required
                                />
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <div>
                                <Button type="submit" className="w-full" isLoading={isLoading} disabled={!selectedAssignment}>
                                    Start Exam
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default ExamLoginPage;
