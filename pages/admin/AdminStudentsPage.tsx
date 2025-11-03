
import React, { useState, useEffect, ChangeEvent } from 'react';
import { api } from '../../services/mockApi';
import { Student } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';

const AdminStudentsPage: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    const fetchStudents = React.useCallback(async () => {
        setIsLoading(true);
        const data = await api.getStudents();
        setStudents(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setUploadStatus('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setUploadStatus('');
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const result = await api.addStudentsFromCSV(text);
            setUploadStatus(`${result.success} students added successfully. ${result.failed} rows failed.`);
            setUploading(false);
            setFile(null);
            fetchStudents(); // Refresh student list
        };
        reader.readAsText(file);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Manage Students</h1>
            
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Upload Students via CSV</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-600 mb-4">Upload a CSV file with columns: name, email, mobile, year_of_pass, date_of_registration, stream</p>
                    <div className="flex items-center space-x-4">
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <Button onClick={handleUpload} disabled={!file || uploading} isLoading={uploading}>
                            Upload
                        </Button>
                    </div>
                    {uploadStatus && <p className="mt-4 text-sm text-green-700">{uploadStatus}</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Student List</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? <Spinner /> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stream</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Year of Pass</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {students.map(student => (
                                        <tr key={student.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.stream}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{student.year_of_pass}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminStudentsPage;
