
export enum Stream {
    ComputerScience = 'ComputerScience',
    Mechanical = 'Mechanical',
    Electrical = 'Electrical',
}

export enum QuestionType {
    Choice = 'choice',
    Answer = 'answer',
    Code = 'code',
}

export interface TestCase {
    input: string;
    type: 'number' | 'text' | 'list' | 'object';
    output: string;
}

export interface AdminUser {
    id: number;
    username: string;
    password?: string; // Should not be sent to client
    createdOn: string;
    lastLoginDate?: string;
}

export interface Student {
    id: number;
    name: string;
    email: string;
    mobile: string;
    year_of_pass: number;
    date_of_registration: string;
    stream: Stream;
}

export interface Skill {
    id: number;
    name: string;
    description: string;
}

export interface Question {
    id: number;
    skill_id: number;
    question: string;
    type: QuestionType;
    option1?: string;
    option2?: string;
    option3?: string;
    option4?: string;
    correct_option?: number;
    expected_answer?: string;
    expected_code?: string;
    test_cases?: TestCase[];
}

export interface AssessmentSkill {
    skill_id: number;
    questions: number;
    pick: 'random';
}

export interface Assessment {
    id: number;
    name: string;
    description: string;
    skills: AssessmentSkill[];
    duration: number; // in minutes
    maxQuestions: number;
}

export interface Assignment {
    id: number;
    name_of_assignment: string;
    date_of_assignment: string;
    assessment_id: number;
    total_students: number;
    attendees: number;
}

export interface AssignmentStudent {
    id: number;
    assignment_id: number;
    student_id: number;
    code: string;
    attended: boolean;
    start_time?: string;
    end_time?: string;
    marks?: number;
    pass?: boolean;
}

export interface AssignmentAnswer {
    id: number;
    assignment_student_id: number;
    question_id: number;
    answer?: string;
    correct?: boolean;
    answer_time: string;
}

export interface StudentLog {
    id: number;
    datetime: string;
    student_id: number;
    event: string;
    details?: any;
}

// For exam page
export interface ExamData {
    assignmentStudent: AssignmentStudent;
    assignment: Assignment;
    assessment: Assessment;
    student: Student;
    questions: Question[];
    answers: AssignmentAnswer[];
}