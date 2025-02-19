export type ProgramDegree = 'bachelor' | 'master';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed';

export interface BaseFaculty {
    id: number;
    name: string;
    program: ProgramDegree;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Faculty extends BaseFaculty {
    exam_dates: ExamDate[];
}

export interface Faculty {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface BaseExamDate {
    id: number;
    date: string;
    available_spots: number;
}

export interface ExamDate extends BaseExamDate {
    is_active: boolean;
}

export interface Application {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    gender: 'male' | 'female';
    phone: string;
    school: string;
    faculty_id: number;
    exam_date_id: number;
    has_english_cert: number;
    english_cert_type: string | null;
    cert_score: number | null;
    program_degree: ProgramDegree;
    payment_status: PaymentStatus;
    created_at: string;
    updated_at: string;
    faculty_name: string;
    english_level?: string; // Новое поле для уровня английского
    sat_score?: number;
    exam_date: string;
    documents: {
        passport: string;
        photo: string;
        english_cert?: string;
    };
}

export interface DocumentInfo {
    type: string;
    url: string;
    fileName: string;
}

export interface CreateExamDateDto {
    date: string;
    available_spots: number;
    faculty_ids_str: string;
    faculty_ids: number[]; // Добавляем это поле
}

export interface UpdateExamDateDto {
    date?: string;
    available_spots?: number;
    is_active?: boolean;
    faculty_ids_str: string;
    faculty_ids: number[]; // Добавляем это поле
}

// Дополнительно добавим интерфейс для ответа API
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}