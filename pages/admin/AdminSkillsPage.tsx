import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { api } from '../../services/mockApi';
import { Skill, Question, QuestionType, TestCase } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';

interface QuestionFormProps {
    skillId: number;
    questionToEdit?: Question | null;
    onSave: () => void;
    onCancel: () => void;
}

const QuestionFormComponent: React.FC<QuestionFormProps> = ({ skillId, questionToEdit, onSave, onCancel }) => {
    const [question, setQuestion] = useState('');
    const [type, setType] = useState<QuestionType>(QuestionType.Choice);
    const [option1, setOption1] = useState('');
    const [option2, setOption2] = useState('');
    const [option3, setOption3] = useState('');
    const [option4, setOption4] = useState('');
    const [correctOption, setCorrectOption] = useState(1);
    const [expectedAnswer, setExpectedAnswer] = useState('');
    const [expectedCode, setExpectedCode] = useState('');
    const [testCases, setTestCases] = useState<TestCase[]>([{ input: '', type: 'text', output: '' }]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (questionToEdit) {
            setQuestion(questionToEdit.question);
            setType(questionToEdit.type);
            setOption1(questionToEdit.option1 || '');
            setOption2(questionToEdit.option2 || '');
            setOption3(questionToEdit.option3 || '');
            setOption4(questionToEdit.option4 || '');
            setCorrectOption(questionToEdit.correct_option || 1);
            setExpectedAnswer(questionToEdit.expected_answer || '');
            setExpectedCode(questionToEdit.expected_code || '');
            setTestCases(questionToEdit.test_cases && questionToEdit.test_cases.length > 0 ? questionToEdit.test_cases : [{ input: '', type: 'text', output: '' }]);
        } else {
            setQuestion('');
            setType(QuestionType.Choice);
            setOption1(''); setOption2(''); setOption3(''); setOption4('');
            setCorrectOption(1);
            setExpectedAnswer('');
            setExpectedCode('');
            setTestCases([{ input: '', type: 'text', output: '' }]);
        }
    }, [questionToEdit]);

    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: '', type: 'text', output: '' }]);
    };
    const handleRemoveTestCase = (index: number) => {
        setTestCases(testCases.filter((_, i) => i !== index));
    };
    const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
        const updated = [...testCases];
        updated[index] = { ...updated[index], [field]: value };
        setTestCases(updated);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const questionData: Omit<Question, 'id'> = {
            skill_id: skillId,
            question,
            type,
            option1: type === 'choice' ? option1 : undefined,
            option2: type === 'choice' ? option2 : undefined,
            option3: type === 'choice' ? option3 : undefined,
            option4: type === 'choice' ? option4 : undefined,
            correct_option: type === 'choice' ? correctOption : undefined,
            expected_answer: type === 'answer' ? expectedAnswer : undefined,
            expected_code: type === 'code' ? expectedCode : undefined,
            test_cases: type === 'code' ? testCases.filter(tc => tc.input || tc.output) : undefined,
        };

        if (questionToEdit) {
            await api.updateQuestion({ ...questionData, id: questionToEdit.id });
        } else {
            await api.createQuestion(questionData);
        }
        setIsSaving(false);
        onSave();
    };

    return (
        <Card className="mt-6">
            <CardHeader><CardTitle>{questionToEdit ? 'Edit Question' : 'Add New Question'}</CardTitle></CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Question Text</label>
                        <textarea value={question} onChange={e => setQuestion(e.target.value)} required rows={3} className="mt-1 w-full rounded-md border-slate-300 shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Question Type</label>
                        <select value={type} onChange={e => setType(e.target.value as QuestionType)} className="mt-1 w-full rounded-md border-slate-300 shadow-sm">
                            {Object.values(QuestionType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {type === 'choice' && (
                        <div className="p-4 bg-slate-50 rounded-md space-y-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i}>
                                    <label className="block text-sm font-medium">Option {i}</label>
                                    <input type="text" value={[option1, option2, option3, option4][i - 1]} onChange={e => [setOption1, setOption2, setOption3, setOption4][i-1](e.target.value)} required className="mt-1 w-full rounded-md border-slate-300 shadow-sm" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium">Correct Option</label>
                                <select value={correctOption} onChange={e => setCorrectOption(Number(e.target.value))} className="mt-1 w-full rounded-md border-slate-300 shadow-sm">
                                    <option value={1}>Option 1</option>
                                    <option value={2}>Option 2</option>
                                    <option value={3}>Option 3</option>
                                    <option value={4}>Option 4</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {type === 'answer' && (
                        <div className="p-4 bg-slate-50 rounded-md">
                            <label className="block text-sm font-medium">Expected Answer</label>
                            <textarea value={expectedAnswer} onChange={e => setExpectedAnswer(e.target.value)} required rows={5} className="mt-1 w-full rounded-md border-slate-300 shadow-sm" />
                        </div>
                    )}
                    {type === 'code' && (
                        <div className="p-4 bg-slate-50 rounded-md space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Expected Code (Solution/Reference)</label>
                                <textarea value={expectedCode} onChange={e => setExpectedCode(e.target.value)} rows={8} className="font-mono mt-1 w-full rounded-md border-slate-300 shadow-sm" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium mb-2">Test Cases</h4>
                                {testCases.map((tc, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center mb-2 p-2 border rounded-md">
                                        <input type="text" placeholder="Input" value={tc.input} onChange={e => handleTestCaseChange(index, 'input', e.target.value)} className="rounded-md border-slate-300 shadow-sm" />
                                        <select value={tc.type} onChange={e => handleTestCaseChange(index, 'type', e.target.value)} className="rounded-md border-slate-300 shadow-sm">
                                            <option value="text">text</option>
                                            <option value="number">number</option>
                                            <option value="list">list</option>
                                            <option value="object">object</option>
                                        </select>
                                        <input type="text" placeholder="Output" value={tc.output} onChange={e => handleTestCaseChange(index, 'output', e.target.value)} className="rounded-md border-slate-300 shadow-sm" />
                                        <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveTestCase(index)}>Remove</Button>
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" size="sm" onClick={handleAddTestCase}>Add Test Case</Button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>Save Question</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
};


const AdminSkillsPage: React.FC = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [isLoadingSkills, setIsLoadingSkills] = useState(true);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    
    // Create Skill state
    const [isCreatingSkill, setIsCreatingSkill] = useState(false);
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillDesc, setNewSkillDesc] = useState('');

    // Edit Skill state
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
    const [skillFormName, setSkillFormName] = useState('');
    const [skillFormDesc, setSkillFormDesc] = useState('');
    
    // Question Form state
    const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    const fetchSkills = useCallback(async () => {
        setIsLoadingSkills(true);
        const data = await api.getSkills();
        setSkills(data);
        setIsLoadingSkills(false);
    }, []);

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    const handleSelectSkill = useCallback(async (skill: Skill) => {
        setEditingSkill(null); // Cancel any inline skill editing
        setSelectedSkill(skill);
        setIsCreatingQuestion(false);
        setEditingQuestion(null);
        setIsLoadingQuestions(true);
        const questionsData = await api.getQuestionsForSkill(skill.id);
        setQuestions(questionsData);
        setIsLoadingQuestions(false);
    }, []);

    // --- Skill CRUD Handlers ---
    const handleCreateSkill = async (e: FormEvent) => {
        e.preventDefault();
        await api.createSkill({ name: newSkillName, description: newSkillDesc });
        setNewSkillName('');
        setNewSkillDesc('');
        setIsCreatingSkill(false);
        fetchSkills();
    };

    const handleEditSkill = (skill: Skill) => {
        setEditingSkill(skill);
        setSkillFormName(skill.name);
        setSkillFormDesc(skill.description);
        setIsCreatingSkill(false);
    };

    const handleCancelEditSkill = () => {
        setEditingSkill(null);
    };

    const handleUpdateSkill = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingSkill) return;
        await api.updateSkill({ ...editingSkill, name: skillFormName, description: skillFormDesc });
        setEditingSkill(null);
        await fetchSkills();
        setSelectedSkill(prev => prev && prev.id === editingSkill.id ? { ...prev, name: skillFormName, description: skillFormDesc } : prev);
    };
    
    const handleDeleteSkill = async (skillId: number) => {
        if (window.confirm('Are you sure you want to delete this skill and all its questions? This action cannot be undone.')) {
            await api.deleteSkill(skillId);
            await fetchSkills();
            if (selectedSkill?.id === skillId) {
                setSelectedSkill(null);
                setQuestions([]);
            }
        }
    };
    
    // --- Question CRUD Handlers ---
    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setIsCreatingQuestion(false);
    };
    
    const handleDeleteQuestion = async (questionId: number) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            await api.deleteQuestion(questionId);
            if (selectedSkill) {
                handleSelectSkill(selectedSkill); // Refresh questions
            }
        }
    };

    const handleQuestionSaved = () => {
        setIsCreatingQuestion(false);
        setEditingQuestion(null);
        if (selectedSkill) {
            handleSelectSkill(selectedSkill); // Refresh questions list
        }
    };
    
    const handleCancelQuestionForm = () => {
        setIsCreatingQuestion(false);
        setEditingQuestion(null);
    };

    const showQuestionForm = isCreatingQuestion || !!editingQuestion;
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Manage Skills & Questions</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Skills List Column */}
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle>Skills</CardTitle>
                            <Button size="sm" onClick={() => setIsCreatingSkill(!isCreatingSkill)}>{isCreatingSkill ? 'Cancel' : 'New Skill'}</Button>
                        </CardHeader>
                        <CardContent>
                            {isCreatingSkill && (
                                <form onSubmit={handleCreateSkill} className="p-2 mb-4 bg-slate-50 rounded-md space-y-2">
                                    <input type="text" placeholder="Skill Name" value={newSkillName} onChange={e => setNewSkillName(e.target.value)} required className="w-full rounded-md border-slate-300 shadow-sm" />
                                    <textarea placeholder="Description" value={newSkillDesc} onChange={e => setNewSkillDesc(e.target.value)} rows={2} className="w-full rounded-md border-slate-300 shadow-sm" />
                                    <Button type="submit" size="sm" className="w-full">Save Skill</Button>
                                </form>
                            )}
                            {isLoadingSkills ? <Spinner/> : (
                                <ul className="space-y-2">
                                    {skills.map(skill => (
                                        <li key={skill.id} className="space-y-2">
                                            {editingSkill?.id === skill.id ? (
                                                <form onSubmit={handleUpdateSkill} className="p-2 bg-slate-100 rounded-md space-y-2">
                                                    <input type="text" value={skillFormName} onChange={e => setSkillFormName(e.target.value)} required className="w-full text-sm rounded-md border-slate-300 shadow-sm" />
                                                    <textarea value={skillFormDesc} onChange={e => setSkillFormDesc(e.target.value)} rows={2} className="w-full text-sm rounded-md border-slate-300 shadow-sm" />
                                                    <div className="flex justify-end space-x-2">
                                                        <Button type="button" size="sm" variant="secondary" onClick={handleCancelEditSkill}>Cancel</Button>
                                                        <Button type="submit" size="sm">Save</Button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className={`flex justify-between items-center p-2 rounded-md transition-colors ${selectedSkill?.id === skill.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                                                    <button onClick={() => handleSelectSkill(skill)} className="flex-1 text-left truncate pr-2">
                                                        {skill.name}
                                                    </button>
                                                    <div className="flex space-x-1 flex-shrink-0">
                                                        <Button size="sm" variant="secondary" onClick={() => handleEditSkill(skill)}>Edit</Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleDeleteSkill(skill.id)}>Del</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Questions Column */}
                <div className="md:col-span-2">
                    {selectedSkill ? (
                        <Card>
                            <CardHeader className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Questions for "{selectedSkill.name}"</CardTitle>
                                    <p className="text-sm text-slate-500 mt-1">{selectedSkill.description}</p>
                                </div>
                                <Button onClick={() => { setIsCreatingQuestion(true); setEditingQuestion(null); }} disabled={showQuestionForm}>
                                    Add Question
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {showQuestionForm && (
                                    <QuestionFormComponent 
                                        skillId={selectedSkill.id} 
                                        questionToEdit={editingQuestion}
                                        onSave={handleQuestionSaved}
                                        onCancel={handleCancelQuestionForm}
                                    />
                                )}
                                {isLoadingQuestions ? <Spinner /> : (
                                    <div className="space-y-4 mt-6">
                                        {questions.length > 0 ? questions.map((q, index) => (
                                            <div key={q.id} className="p-3 border rounded-md bg-white">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">{index + 1}. {q.question}</p>
                                                        <p className="text-xs text-slate-500 uppercase font-medium mt-1">Type: {q.type}</p>
                                                    </div>
                                                    <div className="flex space-x-2 flex-shrink-0 ml-4">
                                                        <Button size="sm" variant="secondary" onClick={() => handleEditQuestion(q)}>Edit</Button>
                                                        <Button size="sm" variant="danger" onClick={() => handleDeleteQuestion(q.id)}>Delete</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            !showQuestionForm && <p className="text-center py-4 text-slate-500">No questions found for this skill.</p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-md">
                            <p className="text-slate-500">Select a skill to view its questions.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSkillsPage;