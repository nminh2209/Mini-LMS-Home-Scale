export interface Class {
    id: string;
    user_id: string;
    name: string;
    schedule: string | null;
    level: string | null;
    created_at: string;
}

export interface Student {
    id: string;
    class_id: string;
    name: string;
    email?: string | null;
    avatar_url?: string | null;
    date_of_birth?: string | null;
    parent_name?: string | null;
    phone?: string | null;
    notes?: string | null;
    joined_at: string;
}

export interface Assignment {
    id: string;
    class_id: string;
    title: string;
    description: string | null;
    due_date: string | null;
    created_at: string;
}

export interface Submission {
    id: string;
    assignment_id: string;
    student_id: string;
    content: string | null;
    submitted_at: string;
    grade?: number | null;
    feedback?: string | null;
}

export interface Grade {
    id: string;
    class_id: string;
    student_id: string;
    title: string;
    score: number;
    max_score: number;
    weight: number;
    created_at: string;
}

export interface VocabularyList {
    id: string;
    class_id: string;
    week: string;
    words: {
        word: string;
        definition: string;
        example: string;
    }[];
    created_at: string;
}

export interface AttendanceRecord {
    id: string;
    student_id: string;
    class_id: string;
    date: string;
    status: 'present' | 'absent' | 'late';
    created_at: string;
}

export interface Profile {
    id: string;
    role: 'admin' | 'teacher' | 'student';
    full_name: string | null;
    avatar_url: string | null;
    email: string | null;
    created_at: string;
}

export interface Quiz {
    id: string;
    class_id: string;
    title: string;
    description: string | null;
    time_limit_minutes: number | null;
    is_published: boolean;
    created_at: string;
}

export interface QuizQuestion {
    id: string;
    quiz_id: string;
    question_text: string;
    question_type: 'multiple_choice' | 'text' | 'true_false';
    options: string[] | null;
    correct_answer: string | null;
    points: number;
    order_index: number;
}

export interface QuizAttempt {
    id: string;
    quiz_id: string;
    student_id: string;
    score: number | null;
    started_at: string;
    completed_at: string | null;
    answers: Record<string, any> | null;
}

export interface Tuition {
    id: string;
    class_id: string;
    student_id: string;
    amount: number;
    period: string;
    status: 'pending' | 'paid' | 'overdue';
    due_date: string | null;
    paid_at: string | null;
    note: string | null;
    created_at: string;
    classes?: Class;
    students?: Student;
}
