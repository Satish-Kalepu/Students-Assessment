
import { 
    AdminUser, 
    Student, 
    Skill, 
    Question, 
    Assessment, 
    Assignment, 
    AssignmentStudent, 
    AssignmentAnswer, 
    Stream, 
    ExamData,
    AssessmentSkill
} from '../types';

// In-memory database
let db = {
    admin_users: [
        { id: 1, username: 'admin', password: 'admin', createdOn: new Date().toISOString() }
    ] as AdminUser[],
    students: [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', mobile: '1234567890', year_of_pass: 2023, date_of_registration: '2023-01-15', stream: Stream.ComputerScience },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', mobile: '2345678901', year_of_pass: 2023, date_of_registration: '2023-02-20', stream: Stream.Mechanical },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', mobile: '3456789012', year_of_pass: 2024, date_of_registration: '2023-03-10', stream: Stream.ComputerScience },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', mobile: '4567890123', year_of_pass: 2024, date_of_registration: '2023-04-05', stream: Stream.Electrical },
    ] as Student[],
    skills: [
        { id: 1, name: 'Basic Arithmetic', description: 'Questions involving addition, subtraction, multiplication, and division.' },
        { id: 2, name: 'Logical Reasoning', description: 'Questions that test logical thinking and problem-solving abilities.' }
    ] as Skill[],
    skill_questions: [
        { id: 1, skill_id: 1, question: 'What is 15 + 27?', type: 'choice', option1: '32', option2: '42', option3: '45', option4: '52', correct_option: 2, test_cases: undefined },
        { id: 2, skill_id: 1, question: 'What is 12 * 8?', type: 'choice', option1: '96', option2: '108', option3: '84', option4: '112', correct_option: 1, test_cases: undefined },
        { id: 3, skill_id: 1, question: 'What is 100 / 4?', type: 'choice', option1: '20', option2: '30', option3: '25', option4: '35', correct_option: 3, test_cases: undefined },
        { id: 4, skill_id: 1, question: 'Calculate the sum of the first 10 positive integers.', type: 'answer', expected_answer: '55', test_cases: undefined },
        { id: 5, skill_id: 2, question: 'Which number should come next in the pattern? 1, 4, 9, 16, ?', type: 'choice', option1: '20', option2: '25', option3: '30', option4: '36', correct_option: 2, test_cases: undefined },
        { id: 6, skill_id: 2, question: 'If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?', type: 'choice', option1: 'Yes', option2: 'No', option3: 'Cannot be determined', option4: 'Maybe', correct_option: 1, test_cases: undefined },
        { id: 7, skill_id: 2, question: "A man is looking at a portrait. Someone asks him whose portrait he is looking at. He replies, \"Brothers and sisters I have none, but that man's father is my father's son.\" Who is in the portrait?", type: 'answer', expected_answer: 'His son', test_cases: undefined }
    ] as Question[],
    assessments: [] as Assessment[],
    assignments: [] as Assignment[],
    assignment_students: [] as AssignmentStudent[],
    assignment_answers: [] as AssignmentAnswer[],
    student_log: [] as any[],
};

const simulateDelay = <T,>(data: T): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500));

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();


// API Functions
export const api = {
    adminLogin: async (username: string, password: string): Promise<AdminUser | null> => {
        const user = db.admin_users.find(u => u.username === username && u.password === password);
        if (user) {
            user.lastLoginDate = new Date().toISOString();
            const { password, ...userWithoutPassword } = user;
            return simulateDelay(userWithoutPassword);
        }
        return simulateDelay(null);
    },

    getStudents: () => simulateDelay(db.students),
    addStudentsFromCSV: async (csvText: string): Promise<{ success: number, failed: number }> => {
        const lines = csvText.split('\n').slice(1); // Skip header
        let success = 0;
        lines.forEach(line => {
            const [name, email, mobile, year_of_pass, date_of_registration, stream] = line.split(',');
            if (name && email && year_of_pass && date_of_registration && stream) {
                if (!db.students.some(s => s.email === email.trim())) {
                    const newStudent: Student = {
                        id: db.students.length + 1,
                        name: name.trim(),
                        email: email.trim(),
                        mobile: mobile.trim(),
                        year_of_pass: parseInt(year_of_pass.trim()),
                        date_of_registration: date_of_registration.trim(),
                        stream: stream.trim() as Stream,
                    };
                    db.students.push(newStudent);
                    success++;
                }
            }
        });
        return simulateDelay({ success, failed: lines.length - success });
    },
    
    getSkills: () => simulateDelay(db.skills),
    createSkill: async (skill: Omit<Skill, 'id'>): Promise<Skill> => {
        const newSkill = { ...skill, id: db.skills.length + 1 };
        db.skills.push(newSkill);
        return simulateDelay(newSkill);
    },

    getQuestionsForSkill: async (skillId: number): Promise<Question[]> => {
        return simulateDelay(db.skill_questions.filter(q => q.skill_id === skillId));
    },
    createQuestion: async (question: Omit<Question, 'id'>): Promise<Question> => {
        const newQuestion = { ...question, id: db.skill_questions.length + 1 };
        db.skill_questions.push(newQuestion);
        return simulateDelay(newQuestion);
    },

    getAssessments: () => simulateDelay(db.assessments),
    createAssessment: async (assessment: Omit<Assessment, 'id'>): Promise<Assessment> => {
        const newAssessment = { ...assessment, id: db.assessments.length + 1 };
        db.assessments.push(newAssessment);
        return simulateDelay(newAssessment);
    },

    getAssignments: () => simulateDelay(db.assignments),
    createAssignment: async (data: { name_of_assignment: string; assessment_id: number; year_of_pass?: number; stream?: Stream }): Promise<Assignment> => {
        const newAssignment: Assignment = {
            id: db.assignments.length + 1,
            name_of_assignment: data.name_of_assignment,
            date_of_assignment: new Date().toISOString().split('T')[0],
            assessment_id: data.assessment_id,
            total_students: 0,
            attendees: 0,
        };
        db.assignments.push(newAssignment);
        
        let filteredStudents = db.students;
        if (data.year_of_pass) {
            filteredStudents = filteredStudents.filter(s => s.year_of_pass === data.year_of_pass);
        }
        if (data.stream) {
            filteredStudents = filteredStudents.filter(s => s.stream === data.stream);
        }

        newAssignment.total_students = filteredStudents.length;

        filteredStudents.forEach(student => {
            const newAssignmentStudent: AssignmentStudent = {
                id: db.assignment_students.length + 1,
                assignment_id: newAssignment.id,
                student_id: student.id,
                code: generateCode(),
                attended: false,
            };
            db.assignment_students.push(newAssignmentStudent);
        });

        return simulateDelay(newAssignment);
    },
    getAssignmentStudentDetails: (assignmentId: number) => {
        return simulateDelay(db.assignment_students.filter(as => as.assignment_id === assignmentId).map(as => {
            const student = db.students.find(s => s.id === as.student_id);
            return { ...as, studentName: student?.name, studentEmail: student?.email };
        }));
    },
    
    // Exam Flow
    studentLogin: async (assignment_id: number, email: string, code: string): Promise<AssignmentStudent | null> => {
        const student = db.students.find(s => s.email === email);
        if (!student) return simulateDelay(null);

        const assignmentStudent = db.assignment_students.find(as => 
            as.assignment_id === assignment_id && 
            as.student_id === student.id && 
            as.code === code
        );

        if (assignmentStudent && !assignmentStudent.attended) {
            db.student_log.push({
                id: db.student_log.length + 1,
                datetime: new Date().toISOString(),
                student_id: student.id,
                event: 'login',
                details: { assignment_id }
            });
            return simulateDelay(assignmentStudent);
        }
        return simulateDelay(null);
    },

    getExamData: async (assignmentStudentId: number): Promise<ExamData | null> => {
        const assignmentStudent = db.assignment_students.find(as => as.id === assignmentStudentId);
        if (!assignmentStudent) return simulateDelay(null);

        const assignment = db.assignments.find(a => a.id === assignmentStudent.assignment_id);
        if (!assignment) return simulateDelay(null);

        const assessment = db.assessments.find(a => a.id === assignment.assessment_id);
        if (!assessment) return simulateDelay(null);

        const student = db.students.find(s => s.id === assignmentStudent.student_id);
        if (!student) return simulateDelay(null);
        
        if (!assignmentStudent.start_time) {
            assignmentStudent.start_time = new Date().toISOString();
        }

        const questions: Question[] = [];
        assessment.skills.forEach((skillReq: AssessmentSkill) => {
            const skillQuestions = db.skill_questions.filter(q => q.skill_id === skillReq.skill_id);
            // Simple random shuffle and pick
            const shuffled = [...skillQuestions].sort(() => 0.5 - Math.random());
            questions.push(...shuffled.slice(0, skillReq.questions));
        });
        
        const answers = db.assignment_answers.filter(a => a.assignment_student_id === assignmentStudentId);
        
        return simulateDelay({ assignmentStudent, assignment, assessment, student, questions, answers });
    },
    
    saveAnswer: async (assignment_student_id: number, question_id: number, answer: string): Promise<AssignmentAnswer> => {
        let existingAnswer = db.assignment_answers.find(a => a.assignment_student_id === assignment_student_id && a.question_id === question_id);
        
        if (existingAnswer) {
            existingAnswer.answer = answer;
            existingAnswer.answer_time = new Date().toISOString();
            return simulateDelay(existingAnswer);
        } else {
            const newAnswer: AssignmentAnswer = {
                id: db.assignment_answers.length + 1,
                assignment_student_id,
                question_id,
                answer,
                answer_time: new Date().toISOString(),
            };
            db.assignment_answers.push(newAnswer);
            return simulateDelay(newAnswer);
        }
    },
    
    finalizeExam: async (assignmentStudentId: number): Promise<AssignmentStudent | null> => {
        const assignmentStudent = db.assignment_students.find(as => as.id === assignmentStudentId);
        if (!assignmentStudent) return null;

        assignmentStudent.attended = true;
        assignmentStudent.end_time = new Date().toISOString();
        
        const assignment = db.assignments.find(a => a.id === assignmentStudent.assignment_id);
        if (assignment) {
            assignment.attendees++;
        }

        return simulateDelay(assignmentStudent);
    }
};