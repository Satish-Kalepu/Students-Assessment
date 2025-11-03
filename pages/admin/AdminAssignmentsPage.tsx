
import React, { useState, useEffect, FormEvent } from 'react';
import { api } from '../../services/mockApi';
import { Assignment, Assessment, Stream } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';

const AdminAssignmentsPage: React.FC = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | undefined>();
    const [filterYear, setFilterYear] = useState<number | undefined>();
    const [filterStream, setFilterStream] = useState<Stream | ''>('');

    const [viewingAssignmentId, setViewingAssignmentId] = useState<number | null>(null);
    const [studentDetails, setStudentDetails] = useState<any[]>([]);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        const [assignmentsData, assessmentsData] = await Promise.all([api.getAssignments(), api.getAssessments()]);
        setAssignments(assignmentsData);
        setAssessments(assessmentsData);
        if (assessmentsData.length > 0) {
            setSelectedAssessmentId(assessmentsData[0].id);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedAssessmentId) return;

        await api.createAssignment({
            name_of_assignment: name,
            assessment_id: selectedAssessmentId,
            year_of_pass: filterYear,
            stream: filterStream || undefined,
        });
        
        setName('');
        setFilterYear(undefined);
        setFilterStream('');
        setIsCreating(false);
        fetchData();
    };

    const handleViewDetails = async (assignmentId: number) => {
        if (viewingAssignmentId === assignmentId) {
            setViewingAssignmentId(null);
        } else {
            setViewingAssignmentId(assignmentId);
            const details = await api.getAssignmentStudentDetails(assignmentId);
            setStudentDetails(details);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Assignments</h1>
                <Button onClick={() => setIsCreating(!isCreating)} disabled={assessments.length === 0}>
                    {isCreating ? 'Cancel' : 'Create New Assignment'}
                </Button>
            </div>
            {assessments.length === 0 && <p className="text-orange-600 mb-4">You must create an assessment before creating an assignment.</p>}

            {isCreating && (
                <Card className="mb-8">
                    <CardHeader><CardTitle>New Assignment</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Assignment Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full rounded-md border-slate-300 shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Assessment</label>
                                <select value={selectedAssessmentId} onChange={e => setSelectedAssessmentId(Number(e.target.value))} className="mt-1 w-full rounded-md border-slate-300 shadow-sm">
                                    {assessments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <h3 className="text-lg font-medium pt-4">Filter Students (Optional)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium">Year of Pass</label>
                                    <input type="number" placeholder="e.g. 2024" value={filterYear || ''} onChange={e => setFilterYear(e.target.value ? Number(e.target.value) : undefined)} className="mt-1 w-full rounded-md border-slate-300 shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Stream</label>
                                    <select value={filterStream} onChange={e => setFilterStream(e.target.value as Stream | '')} className="mt-1 w-full rounded-md border-slate-300 shadow-sm">
                                        <option value="">All Streams</option>
                                        {Object.values(Stream).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4">
                                <Button type="submit">Create Assignment</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Existing Assignments</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? <Spinner /> : (
                         <div className="space-y-4">
                            {assignments.length > 0 ? assignments.map(a => (
                                <div key={a.id} className="p-4 border rounded-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold">{a.name_of_assignment}</h3>
                                            <p className="text-sm text-slate-600">Based on: {assessments.find(as => as.id === a.assessment_id)?.name}</p>
                                            <p className="text-sm">Assigned to: {a.total_students} students | Attended: {a.attendees}</p>
                                        </div>
                                        <Button variant="secondary" size="sm" onClick={() => handleViewDetails(a.id)}>
                                            {viewingAssignmentId === a.id ? 'Hide Details' : 'View Details'}
                                        </Button>
                                    </div>
                                    {viewingAssignmentId === a.id && (
                                        <div className="mt-4 pt-4 border-t">
                                            <h4 className="font-semibold mb-2">Assigned Students & Codes</h4>
                                            <div className="max-h-60 overflow-y-auto">
                                                <table className="min-w-full text-sm">
                                                    <thead><tr><th className="text-left p-1">Name</th><th className="text-left p-1">Email</th><th className="text-left p-1">Code</th></tr></thead>
                                                    <tbody>
                                                        {studentDetails.map(sd => (
                                                        <tr key={sd.id} className="border-b"><td className="p-1">{sd.studentName}</td><td className="p-1">{sd.studentEmail}</td><td className="p-1 font-mono bg-slate-100">{sd.code}</td></tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )) : <p>No assignments created yet.</p>}
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminAssignmentsPage;
