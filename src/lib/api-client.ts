import axios from 'axios';
import { createExamDateFormData } from "@/lib/form-helpers.ts";

export const API_BASE_URL = import.meta.env.PROD
    ? "https://regback.turin.uz/"
    : "https://regback.turin.uz/";

// Constants
export const CURRENT_DATETIME = "2025-01-23 16:32:45";
export const CURRENT_USER = "lilnurik";

export const DocumentTypes = {
    PASSPORT: 'passport',
    PHOTO: 'photo',
    ENGLISH_CERT: 'english_cert'
} as const;

// Types
export type Gender = "male" | "female";
export type PaymentStatus = "pending" | "processing" | "paid" | "failed";
export type PaymentType = "click" | "payme";
export type ProgramDegree = "bachelor" | "master";
export type EnglishCertType = "IELTS" | "TOEFL" | "CAMBRIDGE";
export type DocumentType = typeof DocumentTypes[keyof typeof DocumentTypes];

// Generic API Response interface
export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

// Interfaces
export interface BaseExamDate {
    id: number;
    date: string;
    available_spots: number;
}

export interface ExamDate extends BaseExamDate {
    is_active: boolean;
}

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

export interface FacultyWithExamDates extends BaseFaculty {
    exam_dates: BaseExamDate[];
}

export interface CreateFacultyDto {
    name: string;
    program: string; // The server currently accepts "program" only when creating a faculty
}

export interface UpdateFacultyDto {
    // The server requires only 'name' and 'is_active' for the update,
    // so we'll omit 'program' from the actual request.
    name: string;
    program?: string;
    is_active: boolean;
}

export interface ExamDateWithFaculties extends ExamDate {
    faculties: {
        id: number;
        name: string;
    }[];
}

export interface CreateExamDateDto {
    date: string;
    available_spots: number;
    faculty_ids: number[];
    faculty_ids_str: string;
}

export interface UpdateExamDateDto {
    date?: string;
    available_spots?: number;
    is_active?: boolean;
    faculty_ids: number[];
    faculty_ids_str: string;
}

export interface CreateApplicationDto {
    first_name: string;
    last_name: string;
    middle_name?: string;
    gender: Gender;
    phone: string;
    school: string;
    faculty_id: number;
    exam_date_id?: number;
    has_english_cert: boolean;
    english_cert_type?: EnglishCertType;
    cert_score?: number;
    program_degree: ProgramDegree;
    terms_accepted: boolean;
}

export interface UpdateApplicationDto {
    faculty_id?: number;
    exam_date_id?: number;
    payment_status?: PaymentStatus;
}

// Axios instance
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('admin_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API functions
export const api = {
    // Auth
    login: (credentials: { username: string; password: string }) => {
        console.log(`Login attempt by ${credentials.username} at ${CURRENT_DATETIME}`);
        return apiClient.post<ApiResponse<{ token: string }>>(
            "/token",
            new URLSearchParams(credentials).toString(),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            }
        );
    },

    // Applications
    createApplication: (formData: FormData) => {
        console.log(`Creating application by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        console.log("Application data:", Object.fromEntries(formData.entries()));
        return apiClient.post<ApiResponse<{ id: number }>>("/api/applications", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    getApplications: (params?: {
        page?: number;
        limit?: number;
        search?: string;
        faculty_id?: number;
        payment_status?: PaymentStatus;
        start_date?: string;
        end_date?: string;
    }) => {
        console.log(`Fetching applications with params by ${CURRENT_USER} at ${CURRENT_DATETIME}:`, params);
        return apiClient.get<ApiResponse<{
            items: any[];
            total: number;
            page: number;
            pages: number;
        }>>("/api/applications", { params });
    },

    getApplication: (id: number) => {
        console.log(`Fetching application ${id} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.get<ApiResponse<any>>(`/api/applications/${id}`);
    },

    updateApplication: (id: number, data: UpdateApplicationDto) => {
        console.log(`Updating application ${id} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.put<ApiResponse<any>>(`/api/applications/${id}`, data);
    },

    deleteApplication: (id: number) => {
        console.log(`Deleting application ${id} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.delete<ApiResponse<void>>(`/api/applications/${id}`);
    },

    // Faculties
    getFaculties: () => {
        console.log(`Fetching all faculties by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.get<ApiResponse<Faculty[]>>("/api/faculties");
    },

    getAvailableFaculties: () => {
        console.log(`Fetching available faculties by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.get<ApiResponse<Faculty[]>>("/api/faculties/available");
    },

    createFaculty: (data: CreateFacultyDto) => {
        console.log(`Creating faculty by ${CURRENT_USER} at ${CURRENT_DATETIME}:`, data);
        return apiClient.post<ApiResponse<{ id: number }>>("/api/faculties", data);
    },

    // IMPORTANT FIX:
    // The server expects "name" and "is_active" in the query, so we build them as query params.
    // We do not send "program" because the endpoint as described does not accept it for updates.
    updateFaculty: (id: number, data: UpdateFacultyDto) => {
        console.log(`Updating faculty ${id} by ${CURRENT_USER} at ${CURRENT_DATETIME}:`, data);
        const { name, is_active } = data;
        // Prepare query params for the required fields
        const params = new URLSearchParams();
        params.append("name", name);
        params.append("is_active", String(is_active));

        // The request body can be empty if the server doesn't read JSON for these fields
        return apiClient.put<ApiResponse<void>>(`/api/faculties/${id}`, {}, { params });
    },

    deleteFaculty: (id: number) => {
        console.log(`Deleting faculty ${id} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.delete<ApiResponse<void>>(`/api/faculties/${id}`);
    },

    // Exam Dates
    getExamDates: (facultyId?: number) => {
        console.log(`Fetching exam dates for faculty ${facultyId} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.get<ApiResponse<ExamDate[]>>("/api/exam-dates", {
            params: { faculty_id: facultyId }
        });
    },

    getAvailableExamDates: () => {
        console.log(`Fetching available exam dates by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.get<ApiResponse<ExamDate[]>>("/api/exam-dates/available");
    },

    createExamDate: (data: CreateExamDateDto) => {
        console.log(`Creating exam date by ${CURRENT_USER} at ${CURRENT_DATETIME}:`, data);
        const formData = createExamDateFormData(data);

        return apiClient.post<ApiResponse<{ id: number }>>("/api/exam-dates", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    updateExamDate: (id: number, data: UpdateExamDateDto) => {
        console.log(`Updating exam date ${id} by ${CURRENT_USER} at ${CURRENT_DATETIME}:`, data);
        const formData = createExamDateFormData(data);

        return apiClient.put<ApiResponse<void>>(`/api/exam-dates/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    deleteExamDate: (id: number) => {
        console.log(`Deleting exam date ${id} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.delete<ApiResponse<void>>(`/api/exam-dates/${id}`);
    },

    // Faculty-ExamDate Relations
    linkFacultyToExamDate: (facultyId: number, examDateId: number) => {
        console.log(`Linking faculty ${facultyId} to exam date ${examDateId} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.post<ApiResponse<void>>(`/api/faculties/${facultyId}/exam-dates/${examDateId}`);
    },

    unlinkFacultyFromExamDate: (facultyId: number, examDateId: number) => {
        console.log(`Unlinking faculty ${facultyId} from exam date ${examDateId} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.delete<ApiResponse<void>>(`/api/faculties/${facultyId}/exam-dates/${examDateId}`);
    },

    // Documents
    getDocuments: (applicationId: number) => {
        console.log(`Fetching documents for application ${applicationId} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.get<ApiResponse<any>>(`/api/applications/${applicationId}/documents`);
    },

    uploadDocument: (applicationId: number, document: File, documentType: DocumentType) => {
        console.log(`Uploading ${documentType} document for application ${applicationId} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        const formData = new FormData();
        formData.append('document', document);
        formData.append('document_type', documentType);
        return apiClient.post<ApiResponse<{
            file_path: string;
            url: string;
        }>>(`/api/applications/${applicationId}/documents`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    // Payments
    initializePayment: (data: {
        application_id: number;
        payment_type: PaymentType;
        amount: number;
    }) => {
        console.log(`Initializing payment by ${CURRENT_USER} at ${CURRENT_DATETIME}:`, data);
        return apiClient.post<ApiResponse<any>>("/api/payments/initialize", data);
    },

    verifyPayment: (paymentId: number) => {
        console.log(`Verifying payment ${paymentId} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.post<ApiResponse<any>>(`/api/payments/verify/${paymentId}`);
    },

    getPaymentStatus: (applicationId: number) => {
        console.log(`Getting payment status for application ${applicationId} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.get<ApiResponse<any>>(`/api/payments/${applicationId}`);
    },

    // Application lookup
    lookupApplication: (phone: string) => {
        console.log(`Looking up application for phone ${phone} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
        return apiClient.get<ApiResponse<any>>(`/api/applications/lookup/${phone}`);
    },
};

export const {
    getFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    deleteExamDate,
    createExamDate,
    updateExamDate,
} = api;