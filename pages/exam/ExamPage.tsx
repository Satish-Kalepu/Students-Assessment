
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/mockApi';
import { useAuth } from '../../App';
import { ExamData, Question, QuestionType, AssignmentAnswer } from '../../types';
import { useTimer } from '../../hooks/useTimer';
import { Button } from '../../components/Button';
import { Spinner } from '../../components/Spinner';

// This component is defined outside ExamPage to prevent re-creation on re-renders
const QuestionDisplay: React.FC<{ question: Question; userAnswer?: string; onAnswer: (answer: string) => void }> = ({ question, userAnswer, onAnswer }) => {
    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-lg font-semibold text-slate-800 mb-6">{question.question}</p>
            {question.type === QuestionType.Choice && (
                <div className="space-y-3">
                    {[question.option1, question.option2, question.option3, question.option4].map((option, index) => (
                        option && (
                            <label key={index} className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${userAnswer === option ? 'bg-blue-100 border-blue-400' : 'hover:bg-slate-50'}`}>
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option}
                                    checked={userAnswer === option}
                                    onChange={(e) => onAnswer(e.target.value)}
                                    className="h-4 w-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                />
                                <span className="ml-3 text-slate-700">{option}</span>
                            </label>
                        )
                    ))}
                </div>
            )}
            {question.type === QuestionType.Answer && (
                <input
                    type="text"
                    value={userAnswer || ''}
                    onChange={(e) => onAnswer(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
            )}
            {question.type === QuestionType.Code && (
                 <textarea
                    value={userAnswer || ''}
                    onChange={(e) => onAnswer(e.target.value)}
                    rows={10}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono"
                    placeholder="Write your code here..."
                 />
            )}
        </div>
    );
};


const ExamPage: React.FC = () => {
    const { assignmentStudentId } = useParams();
    const navigate = useNavigate();
    const { logoutStudent } = useAuth();
    const [examData, setExamData] = useState<ExamData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<number, string>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const handleTimeout = useCallback(() => {
        if(examData) {
            api.finalizeExam(examData.assignmentStudent.id).then(() => {
                alert('Time is up! Your exam has been submitted.');
                logoutStudent();
                navigate('/exam/login');
            });
        }
    }, [examData, logoutStudent, navigate]);

    const durationInSeconds = examData ? examData.assessment.duration * 60 : 0;
    const { minutes, seconds } = useTimer(durationInSeconds, handleTimeout);
    
    useEffect(() => {
        const fetchExamData = async () => {
            if (assignmentStudentId) {
                const data = await api.getExamData(Number(assignmentStudentId));
                if (data) {
                    setExamData(data);
                    // Pre-fill answers from server
                    const initialAnswers = new Map<number, string>();
                    data.answers.forEach((ans: AssignmentAnswer) => {
                        if(ans.answer) initialAnswers.set(ans.question_id, ans.answer);
                    });
                    setAnswers(initialAnswers);
                } else {
                    navigate('/exam/login');
                }
                setIsLoading(false);
            }
        };
        fetchExamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assignmentStudentId, navigate]);
    
    const handleAnswer = (answer: string) => {
        if (!examData) return;
        const questionId = examData.questions[currentQuestionIndex].id;
        const newAnswers = new Map(answers);
        newAnswers.set(questionId, answer);
        setAnswers(newAnswers);
        api.saveAnswer(examData.assignmentStudent.id, questionId, answer);
    };

    const handleFinalize = async () => {
        if (examData && window.confirm('Are you sure you want to finish the exam?')) {
            await api.finalizeExam(examData.assignmentStudent.id);
            alert('Exam submitted successfully!');
            logoutStudent();
            navigate('/exam/login');
        }
    };

    if (isLoading || !examData) {
        return <div className="flex items-center justify-center h-screen"><Spinner /></div>;
    }

    const currentQuestion = examData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / examData.questions.length) * 100;

    return (
        <div className="min-h-screen bg-slate-200">
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{examData.assignment.name_of_assignment}</h1>
                        <p className="text-sm text-slate-500">Welcome, {examData.student.name}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-semibold">Time Remaining</p>
                        <p className="text-2xl font-mono font-bold text-blue-600">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</p>
                    </div>
                </div>
                <div className="w-full bg-slate-200 h-1.5">
                    <div className="bg-blue-600 h-1.5" style={{ width: `${progress}%` }}></div>
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <p className="text-center mb-4 text-slate-600">Question {currentQuestionIndex + 1} of {examData.questions.length}</p>
                <QuestionDisplay
                    question={currentQuestion}
                    userAnswer={answers.get(currentQuestion.id)}
                    onAnswer={handleAnswer}
                />
                <div className="flex justify-between mt-8">
                    <Button 
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)} 
                        disabled={currentQuestionIndex === 0}
                        variant="secondary"
                    >
                        Previous
                    </Button>
                    {currentQuestionIndex < examData.questions.length - 1 ? (
                        <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                            Next
                        </Button>
                    ) : (
                        <Button onClick={handleFinalize} variant="primary">
                            Finalize Exam
                        </Button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ExamPage;
