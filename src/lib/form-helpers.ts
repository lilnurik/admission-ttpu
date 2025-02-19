// utils/form-helpers.ts
import {CreateExamDateDto, UpdateExamDateDto} from "@/lib/api-client.ts";

export const createExamDateFormData = (data: CreateExamDateDto | UpdateExamDateDto): FormData => {
    const formData = new FormData();

    if ('date' in data && data.date) {
        formData.append('date', data.date);
    }

    if ('available_spots' in data && data.available_spots) {
        formData.append('available_spots', data.available_spots.toString());
    }

    formData.append('faculty_ids_str', data.faculty_ids_str);
    formData.append('faculty_ids', JSON.stringify(data.faculty_ids));

    if ('is_active' in data && data.is_active !== undefined) {
        formData.append('is_active', data.is_active.toString());
    }

    return formData;
};