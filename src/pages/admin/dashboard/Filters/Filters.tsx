import React, { useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Faculty, PaymentStatus, ProgramDegree } from '../types';
import FacultyManagement from "@/components/AdmissionForm/FacultyManagement.tsx";
import debounce from 'lodash/debounce';

const CURRENT_USER = "lilnurik";
const CURRENT_DATETIME = "2025-01-24 11:49:34";

interface FiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    programFilter: ProgramDegree | "all-programs";
    onProgramFilterChange: (value: ProgramDegree | "all-programs") => void;
    statusFilter: PaymentStatus | "all-statuses";
    onStatusFilterChange: (value: PaymentStatus | "all-statuses") => void;
    facultyFilter: string;
    onFacultyFilterChange: (value: string) => void;
    faculties: Faculty[];
    startDate: string;
    onStartDateChange: (value: string) => void;
    endDate: string;
    onEndDateChange: (value: string) => void;
}

export const Filters: React.FC<FiltersProps> = ({
    searchTerm,
    onSearchChange,
    programFilter,
    onProgramFilterChange,
    statusFilter,
    onStatusFilterChange,
    facultyFilter,
    onFacultyFilterChange,
    faculties,
    startDate,
    onStartDateChange,
    endDate,
    onEndDateChange,
}) => {
    // Создаем дебаунсированную функцию для поиска
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            console.log(`Search term changed by ${CURRENT_USER} at ${CURRENT_DATETIME}: ${value}`);
            onSearchChange(value);
        }, 300),
        [onSearchChange]
    );

    return (
        <div className="grid gap-4 mb-6">
            <div className="flex flex-wrap gap-4">
                {/* Поисковое поле */}
                <div className="flex-1 min-w-[200px]">
                    <Input
                        placeholder="Search by name, phone or school..."
                        value={searchTerm}
                        onChange={(e) => {
                            const value = e.target.value;
                            debouncedSearch(value);
                        }}
                        className="w-full"
                        icon={<Search className="h-4 w-4"/>}
                    />
                </div>

                {/* Фильтр по программе */}
                <Select
                    value={programFilter}
                    onValueChange={(value) => {
                        console.log(`Program filter changed by ${CURRENT_USER} at ${CURRENT_DATETIME}: ${value}`);
                        onProgramFilterChange(value as ProgramDegree | "all-programs");
                    }}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by program"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-programs">All Programs</SelectItem>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                    </SelectContent>
                </Select>

                {/* Фильтр по статусу оплаты */}
                <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                        console.log(`Status filter changed by ${CURRENT_USER} at ${CURRENT_DATETIME}: ${value}`);
                        onStatusFilterChange(value as PaymentStatus | "all-statuses");
                    }}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by status"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-statuses">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                </Select>

                {/* Фильтр по факультету */}
                <Select
                    value={facultyFilter}
                    onValueChange={(value) => {
                        console.log(`Faculty filter changed by ${CURRENT_USER} at ${CURRENT_DATETIME}: ${value}`);
                        onFacultyFilterChange(value);
                    }}
                >
                    <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by faculty"/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-faculties">All Faculties</SelectItem>
                        {faculties.map(faculty => (
                            <SelectItem key={faculty.id} value={String(faculty.id)}>
                                {faculty.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-wrap gap-4">
                {/* Фильтр по начальной дате */}
                <Input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => {
                        console.log(`Start date changed by ${CURRENT_USER} at ${CURRENT_DATETIME}: ${e.target.value}`);
                        onStartDateChange(e.target.value);
                    }}
                    className="w-[200px]"
                    placeholder="Start Date"
                />

                {/* Фильтр по конечной дате */}
                <Input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => {
                        console.log(`End date changed by ${CURRENT_USER} at ${CURRENT_DATETIME}: ${e.target.value}`);
                        onEndDateChange(e.target.value);
                    }}
                    className="w-[200px]"
                    placeholder="End Date"
                />

                {/* Компонент управления факультетами */}
                <FacultyManagement/>
            </div>

            {/* Кнопка сброса фильтров */}
            <div className="flex justify-end">
                <Button
                    variant="outline"
                    onClick={() => {
                        console.log(`Filters reset by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
                        onSearchChange('');
                        onProgramFilterChange('all-programs');
                        onStatusFilterChange('all-statuses');
                        onFacultyFilterChange('all-faculties');
                        onStartDateChange('');
                        onEndDateChange('');
                    }}
                >
                    Reset Filters
                </Button>
            </div>
        </div>
    );
};

export default Filters;