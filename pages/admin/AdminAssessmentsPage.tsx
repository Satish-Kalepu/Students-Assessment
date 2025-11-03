
import React, { useState, useEffect, FormEvent } from 'react';
import { api } from '../../services/mockApi';
import { Assessment, Skill, AssessmentSkill } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';

const AdminAssessmentsPage: React.FC = () => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(60);
    const [selectedSkills, setSelectedSkills] = useState<AssessmentSkill[]>([]);

    const fetchAssessments = React.useCallback(async () => {
        setIsLoading(true);
        const [assessmentsData, skillsData] = await Promise.all([api.getAssessments(), api.getSkills()]);
        setAssessments(assessmentsData);
        setSkills(skillsData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]);

    const handleAddSkill = () => {
        setSelectedSkills([...selectedSkills, { skill_id: skills[0]?.id || 0, questions: 5, pick: 'random' }]);
    };

    const handleSkillChange = (index: number, field: keyof AssessmentSkill, value: any) => {
        const updatedSkills = [...selectedSkills];
        updatedSkills[index] = { ...updatedSkills[index], [field]: value };
        setSelectedSkills(updatedSkills);
    };

    const handleRemoveSkill = (index: number) => {
        setSelectedSkills(selectedSkills.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const totalQuestions = selectedSkills.reduce((sum, s) => sum + Number(s.questions), 0);
        const newAssessment = {
            name,
            description,
            duration,
            skills: selectedSkills,
            maxQuestions: totalQuestions,
        };
        await api.createAssessment(newAssessment);
        // Reset form and refetch
        setName('');
        setDescription('');
        setDuration(60);
        setSelectedSkills([]);
        setIsCreating(false);
        fetchAssessments();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Assessments</h1>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? 'Cancel' : 'Create New Assessment'}
                </Button>
            </div>

            {isCreating && (
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>New Assessment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full rounded-md border-slate-300 shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="mt-1 w-full rounded-md border-slate-300 shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Duration (minutes)</label>
                                <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} required min="1" className="mt-1 w-full rounded-md border-slate-300 shadow-sm" />
                            </div>
                            
                            <h3 className="text-lg font-medium pt-4">Skills & Questions</h3>
                            {selectedSkills.map((ss, index) => (
                                <div key={index} className="flex items-center space-x-4 p-2 bg-slate-50 rounded-md">
                                    <select value={ss.skill_id} onChange={e => handleSkillChange(index, 'skill_id', Number(e.target.value))} className="rounded-md border-slate-300 shadow-sm">
                                        {skills.map(skill => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
                                    </select>
                                    <input type="number" value={ss.questions} onChange={e => handleSkillChange(index, 'questions', Number(e.target.value))} min="1" className="w-24 rounded-md border-slate-300 shadow-sm" />
                                    <span>questions</span>
                                    <Button type="button" variant="danger" onClick={() => handleRemoveSkill(index)}>&times;</Button>
                                </div>
                            ))}
                            <Button type="button" variant="secondary" onClick={handleAddSkill}>Add Skill</Button>
                            
                            <div className="pt-4">
                                <Button type="submit">Save Assessment</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Existing Assessments</CardTitle></CardHeader>
                <CardContent>
                    {isLoading ? <Spinner /> : (
                         <div className="space-y-4">
                            {assessments.length > 0 ? assessments.map(assessment => (
                                <div key={assessment.id} className="p-4 border rounded-md">
                                    <h3 className="font-bold">{assessment.name}</h3>
                                    <p className="text-sm text-slate-600">{assessment.description}</p>
                                    <p className="text-sm">Duration: {assessment.duration} mins | Questions: {assessment.maxQuestions}</p>
                                </div>
                            )) : <p>No assessments created yet.</p>}
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminAssessmentsPage;
