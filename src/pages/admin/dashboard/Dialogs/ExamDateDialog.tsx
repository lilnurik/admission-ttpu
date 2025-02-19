import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Faculty, ExamDate, CreateExamDateDto, UpdateExamDateDto } from '../types';

interface ExamDateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    examDate?: ExamDate;
    faculties: Faculty[];
    onSubmit: (data: CreateExamDateDto | UpdateExamDateDto) => Promise<void>;
}

export const ExamDateDialog: React.FC<ExamDateDialogProps> = ({
    open,
    onOpenChange,
    examDate,
    faculties,
    onSubmit
}) => {
    const [date, setDate] = useState(examDate?.date || '');
    const [availableSpots, setAvailableSpots] = useState(examDate?.available_spots || 100);
    const [selectedFacultyIds, setSelectedFacultyIds] = useState<number[]>([]);
    const [isActive, setIsActive] = useState(examDate?.is_active ?? true);

    const CURRENT_USER = "lilnurik";
    const CURRENT_DATETIME = "2025-01-24 06:24:42";

    useEffect(() => {
        if (examDate) {
            setDate(examDate.date);
            setAvailableSpots(examDate.available_spots);
            setIsActive(examDate.is_active);
        } else {
            setDate('');
            setAvailableSpots(100);
            setSelectedFacultyIds([]);
            setIsActive(true);
        }
    }, [examDate]);

    const handleSubmit = async () => {
        console.log(`Exam date ${examDate ? 'updated' : 'created'} by ${CURRENT_USER} at ${CURRENT_DATETIME}`);

        const baseData = {
            faculty_ids: selectedFacultyIds,
            faculty_ids_str: selectedFacultyIds.join(',')
        };

        if (examDate) {
            await onSubmit({
                ...baseData,
                date,
                available_spots: availableSpots,
                is_active: isActive
            });
        } else {
            await onSubmit({
                ...baseData,
                date,
                available_spots: availableSpots
            });
        }

        onOpenChange(false);
    };

    const handleFacultySelect = (facultyId: number) => {
        setSelectedFacultyIds(prev =>
            prev.includes(facultyId)
                ? prev.filter(id => id !== facultyId)
                : [...prev, facultyId]
        );
    };

    // Группировка факультетов по программам
    const programGroups = faculties.reduce((groups, faculty) => {
        const program = faculty.program;
        if (!groups[program]) {
            groups[program] = [];
        }
        groups[program].push(faculty);
        return groups;
    }, {} as Record<string, Faculty[]>);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>
                        {examDate ? 'Edit Exam Date' : 'Create New Exam Date'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Date and Time</Label>
                        <Input
                            type="datetime-local"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Available Spots</Label>
                        <Input
                            type="number"
                            min="1"
                            value={availableSpots}
                            onChange={(e) => setAvailableSpots(Number(e.target.value))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Faculties</Label>
                        <div className="max-h-[200px] overflow-y-auto border rounded-md p-4">
                            {Object.entries(programGroups).map(([program, facultiesList]) => (
                                <div key={program} className="mb-4">
                                    <h4 className="font-semibold mb-2 capitalize">{program}'s Program</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {facultiesList.map(faculty => (
                                            <div key={faculty.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`faculty-${faculty.id}`}
                                                    checked={selectedFacultyIds.includes(faculty.id)}
                                                    onCheckedChange={() => handleFacultySelect(faculty.id)}
                                                />
                                                <Label htmlFor={`faculty-${faculty.id}`}>
                                                    {faculty.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {examDate && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="exam-active"
                                checked={isActive}
                                onCheckedChange={(checked) => setIsActive(checked as boolean)}
                            />
                            <Label htmlFor="exam-active">Active</Label>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!date || availableSpots < 1 || selectedFacultyIds.length === 0}
                        >
                            {examDate ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ExamDateDialog;