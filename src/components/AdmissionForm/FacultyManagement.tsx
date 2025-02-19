import React, {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from "@/components/ui/dialog";
import {
    getFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    deleteExamDate,
    createExamDate,
    updateExamDate,
    CreateExamDateDto,
    UpdateExamDateDto, api
} from '@/lib/api-client';
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useToast} from '@/hooks/use-toast';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ProgramDegree} from '@/lib/api-client';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import {useNavigate} from "react-router-dom";
import axios from 'axios';

const CURRENT_DATETIME = "2025-01-23 15:30:35";
const CURRENT_USER = "lilnurik";
const ITEMS_PER_PAGE = 5;

interface ExamDate {
    id: number;
    date: string;
    available_spots: number;
    is_active: boolean;
}

interface Faculty {
    id: number;
    name: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    exam_dates: ExamDate[];
}

interface ProgramGroup {
    program: string;
    faculities_list: Faculty[];
}

const FacultyManagement = () => {


    // Основные состояния
    const [programGroups, setProgramGroups] = useState<ProgramGroup[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    const [newFacultyName, setNewFacultyName] = useState('');
    const [selectedProgram, setSelectedProgram] = useState<ProgramDegree>('bachelor');
    const [currentPage, setCurrentPage] = useState(1);

    // Состояния для управления экзаменами
    const [showExamDateDialog, setShowExamDateDialog] = useState(false);
    const [editingExamDate, setEditingExamDate] = useState<ExamDate | null>(null);
    const [newExamDate, setNewExamDate] = useState("");
    const [newExamSpots, setNewExamSpots] = useState(100);
    const [selectedFacultyIds, setSelectedFacultyIds] = useState<number[]>([]);


    const navigate = useNavigate(); // Изменено для react-router-dom
    const {toast} = useToast();

    useEffect(() => {
        if (showModal) {
            fetchFaculties();
        }
    }, [showModal]);

    useEffect(() => {
        if (editingFaculty) {
            // Очищаем префикс программы при установке значения в форму
            setNewFacultyName(stripProgramPrefix(editingFaculty.name));
            const program = programGroups.find(group =>
                group.faculities_list.some(f => f.id === editingFaculty.id)
            )?.program;
            setSelectedProgram(program === "Bachelor's degree" ? 'bachelor' : 'master');
        }
    }, [editingFaculty, programGroups]);

    // useEffect(() => {
    //     const token = localStorage.getItem('token');
    //     if (!token) {
    //         toast({
    //             title: 'Authentication Required',
    //             description: 'Please log in to manage exam dates.',
    //             variant: 'destructive',
    //         });
    //         navigate('/login'); // Используем navigate вместо router.push
    //     }
    // }, [navigate, toast]);


    const fetchFaculties = async () => {
        try {
            console.log(`Fetching faculties by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
            const response = await getFaculties();
            setProgramGroups(response.data as unknown as ProgramGroup[]);
        } catch (error) {
            console.error('Error fetching faculties:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch faculties.',
                variant: 'destructive',
            });
        }
    };

    const handleCreateExamDate = async () => {
        try {
            // Добавим валидацию
            if (!newExamDate || newExamSpots < 1 || selectedFacultyIds.length === 0) {
                toast({
                    title: 'Error',
                    description: 'Please fill in all required fields and select at least one faculty',
                    variant: 'destructive',
                });
                return;
            }

            console.log(`Creating exam date by ${CURRENT_USER} at ${CURRENT_DATETIME}`);

            const examDateData = {
                date: newExamDate,
                available_spots: newExamSpots,
                faculty_ids: selectedFacultyIds,
                faculty_ids_str: selectedFacultyIds.join(',')
            };

            await api.createExamDate(examDateData);

            // Очищаем форму
            setShowExamDateDialog(false);
            setNewExamDate("");
            setNewExamSpots(100);
            setSelectedFacultyIds([]);

            // Обновляем список
            await fetchFaculties();

            toast({
                title: 'Success',
                description: 'Exam date created successfully',
            });
        } catch (error) {
            console.error('Create exam date error:', error);
            toast({
                title: 'Error',
                description: 'Failed to create exam date. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateExamDate = async (id: number, data: Omit<UpdateExamDateDto, 'faculty_ids' | 'faculty_ids_str'>) => {
        try {
            console.log(`Updating exam date by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
            const updateData: UpdateExamDateDto = {
                ...data,
                faculty_ids: selectedFacultyIds,
                faculty_ids_str: selectedFacultyIds.join(',') // Добавляем required поле
            };

            await updateExamDate(id, updateData);

            setShowExamDateDialog(false);
            setEditingExamDate(null);
            setNewExamDate("");
            setNewExamSpots(100);
            setSelectedFacultyIds([]);
            fetchFaculties();

            toast({
                title: 'Success',
                description: 'Exam date updated successfully',
            });
        } catch (error) {
            console.error('Update exam date error:', error);
            toast({
                title: 'Error',
                description: 'Failed to update exam date',
                variant: 'destructive',
            });
        }
    };

    const formatFacultyName = (name: string, program: ProgramDegree): string => {
        const prefix = program === 'bachelor' ? "Bachelor's degree" : "Master's degree";
        // Проверяем, не начинается ли уже название с префикса
        if (name.startsWith("Bachelor's degree - ") || name.startsWith("Master's degree - ")) {
            return name;
        }
        return `${prefix} - ${name}`;
    };

    // Функция для преобразования внутреннего значения программы в формат для API
    const getProgramForApi = (program: ProgramDegree): string => {
        return program === 'bachelor' ? "Bachelor's degree" : "Master's degree";
    };

    const getProgramFromApi = (program: string): ProgramDegree => {
        return program === "Bachelor's degree" ? 'bachelor' : 'master';
    };

    const handleCreateFaculty = async () => {
        try {
            console.log(`Creating faculty by ${CURRENT_USER} at ${CURRENT_DATETIME}`);

            if (!newFacultyName || !selectedProgram) {
                toast({
                    title: 'Error',
                    description: 'Please fill in all required fields',
                    variant: 'destructive',
                });
                return;
            }

            // Форматируем название с префиксом программы
            const formattedName = formatFacultyName(newFacultyName.trim(), selectedProgram);

            await createFaculty({
                name: formattedName,
                program: getProgramForApi(selectedProgram)
            });

            setNewFacultyName('');
            setSelectedProgram('bachelor');
            setEditingFaculty(null);
            await fetchFaculties();

            toast({
                title: 'Success',
                description: 'Faculty created successfully',
            });
        } catch (error) {
            console.error('Create faculty error:', error);
            toast({
                title: 'Error',
                description: 'Failed to create faculty',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateFaculty = async (id: number, data: {
        name: string;
        program: ProgramDegree;
        is_active: boolean;
    }) => {
        try {
            console.log(`Updating faculty by ${CURRENT_USER} at ${CURRENT_DATETIME}`);

            if (!data.name || !data.program) {
                toast({
                    title: 'Error',
                    description: 'Please fill in all required fields',
                    variant: 'destructive',
                });
                return;
            }

            // Форматируем название с префиксом программы
            const formattedName = formatFacultyName(data.name.trim(), data.program);

            await updateFaculty(id, {
                name: formattedName,
                program: getProgramForApi(data.program),
                is_active: data.is_active
            });

            setEditingFaculty(null);
            setNewFacultyName('');
            setSelectedProgram('bachelor');
            await fetchFaculties();

            toast({
                title: 'Success',
                description: 'Faculty updated successfully',
            });
        } catch (error) {
            console.error('Update faculty error:', error);
            toast({
                title: 'Error',
                description: 'Failed to update faculty',
                variant: 'destructive',
            });
        }
    };

    const stripProgramPrefix = (name: string): string => {
        return name
            .replace(/^Bachelor's degree - /, '')
            .replace(/^Master's degree - /, '');
    };

    const handleDeleteFaculty = async (id: number) => {
        try {
            console.log(`Deleting faculty by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
            await deleteFaculty(id);
            fetchFaculties();
            toast({
                title: 'Success',
                description: 'Faculty deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete faculty',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteExamDate = async (id: number) => {
        try {
            console.log(`Deleting exam date by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
            await deleteExamDate(id);
            fetchFaculties();
            toast({
                title: 'Success',
                description: 'Exam date deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete exam date',
                variant: 'destructive',
            });
        }
    };

    const handleFacultySelect = (facultyId: number) => {
        setSelectedFacultyIds(prev =>
            prev.includes(facultyId)
                ? prev.filter(id => id !== facultyId)
                : [...prev, facultyId]
        );
    };

    const getProgramDegree = (programName: string): ProgramDegree => {
        return programName === "Bachelor's degree" ? 'bachelor' : 'master';
    };

    const getProgramDisplay = (program: ProgramDegree): string => {
        return program === 'bachelor' ? "Bachelor's degree" : "Master's degree";
    };

    const paginateFaculties = (faculties: Faculty[], page: number) => {
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        return faculties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    };

    const getTotalPages = (faculties: Faculty[]) => {
        return Math.ceil(faculties.length / ITEMS_PER_PAGE);
    };

    return (
        <div>
            <Button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2"
            >
                Manage Faculties
            </Button>

            {/* Основной диалог управления факультетами */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Faculty Management</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {programGroups.map((group, index) => (
                            group.program && (
                                <div key={index} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">{group.program}</h3>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setShowExamDateDialog(true);
                                                setEditingExamDate(null);
                                                setNewExamDate("");
                                                setNewExamSpots(100);
                                                setSelectedFacultyIds([]);
                                            }}
                                        >
                                            Add Exam Date
                                        </Button>
                                    </div>
                                    <div className="bg-white rounded-lg shadow overflow-hidden">
                                        <table className="min-w-full">
                                            <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Name</th>
                                                {/*<th className="px-4 py-2 text-center">Active</th>*/}
                                                <th className="px-4 py-2">Exam Dates</th>
                                                <th className="px-4 py-2">Actions</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {group.faculities_list.length > 0 ? (
                                                paginateFaculties(group.faculities_list, currentPage).map(faculty => (
                                                    <tr key={faculty.id} className="border-t">
                                                        <td className="px-4 py-2">{faculty.name}</td>
                                                        {/*<td className="px-4 py-2 text-center">*/}
                                                        {/*    <Checkbox*/}
                                                        {/*        checked={faculty.is_active}*/}
                                                        {/*        onCheckedChange={() => handleUpdateFaculty(faculty.id, {*/}
                                                        {/*            name: faculty.name,*/}
                                                        {/*            program: getProgramDegree(group.program),*/}
                                                        {/*            is_active: !faculty.is_active*/}
                                                        {/*        })}*/}
                                                        {/*    />*/}
                                                        {/*</td>*/}
                                                        <td className="px-4 py-2">
                                                            {faculty.exam_dates && faculty.exam_dates.length > 0 ? (
                                                                <div className="space-y-2">
                                                                    {faculty.exam_dates.map(date => (
                                                                        <div key={date.id}
                                                                             className="flex items-center justify-between">
                                                                            <span>{new Date(date.date).toLocaleDateString()} - {date.available_spots} spots</span>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteExamDate(date.id)}
                                                                            >
                                                                                Delete
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-gray-500">No exam dates</div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2">
                                                            <div className="flex space-x-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setEditingFaculty(faculty);
                                                                        setSelectedProgram(getProgramDegree(group.program));
                                                                    }}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleDeleteFaculty(faculty.id)}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-4 text-gray-500">
                                                        No faculties available for this program
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>

                                        {group.faculities_list.length > ITEMS_PER_PAGE && (
                                            <div
                                                className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm text-gray-700">
                                                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                                                        {Math.min(currentPage * ITEMS_PER_PAGE, group.faculities_list.length)} of{' '}
                                                        {group.faculities_list.length} faculties
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                                        disabled={currentPage === 1}
                                                    >
                                                        <ChevronLeft className="h-4 w-4"/>
                                                        Previous
                                                    </Button>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({length: getTotalPages(group.faculities_list)}).map((_, i) => (
                                                            <Button
                                                                key={i}
                                                                variant={currentPage === i + 1 ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => setCurrentPage(i + 1)}
                                                            >
                                                                {i + 1}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setCurrentPage(page =>
                                                            Math.min(getTotalPages(group.faculities_list), page + 1)
                                                        )}
                                                        disabled={currentPage === getTotalPages(group.faculities_list)}
                                                    >
                                                        Next
                                                        <ChevronRight className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        ))}

                        {/* Форма добавления/редактирования факультета */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-lg font-semibold">
                                {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
                            </h3>
                            <div className="space-y-2">
                                <Label>Program</Label>
                                <Select
                                    value={selectedProgram}
                                    onValueChange={(value: ProgramDegree) => setSelectedProgram(value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select program"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                        <SelectItem value="master">Master's Degree</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Faculty Name</Label>
                                <Input
                                    value={editingFaculty
                                        ? stripProgramPrefix(editingFaculty.name)
                                        : newFacultyName
                                    }
                                    onChange={(e) => {
                                        if (editingFaculty) {
                                            setEditingFaculty({
                                                ...editingFaculty,
                                                name: e.target.value
                                            });
                                        } else {
                                            setNewFacultyName(e.target.value);
                                        }
                                    }}
                                    placeholder="Enter faculty name"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setEditingFaculty(null);
                                        setNewFacultyName('');
                                        setSelectedProgram('bachelor');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        if (editingFaculty) {
                                            handleUpdateFaculty(editingFaculty.id, {
                                                name: editingFaculty.name,
                                                program: selectedProgram,
                                                is_active: editingFaculty.is_active
                                            });
                                        } else {
                                            handleCreateFaculty();
                                        }
                                    }}
                                    disabled={!selectedProgram || (editingFaculty ? !editingFaculty.name : !newFacultyName)}
                                >
                                    {editingFaculty ? 'Update Faculty' : 'Create Faculty'}
                                </Button>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingFaculty(null);
                                    setNewFacultyName('');
                                    setSelectedProgram('bachelor');
                                }}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Диалог для управления датами экзаменов */}
            <Dialog open={showExamDateDialog} onOpenChange={setShowExamDateDialog}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingExamDate ? 'Edit Exam Date' : 'Create New Exam Date'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input
                                type="datetime-local"
                                value={newExamDate}
                                onChange={(e) => setNewExamDate(e.target.value)}
                                min={new Date().toISOString().slice(0, 16)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Available Spots</Label>
                            <Input
                                type="number"
                                min="1"
                                value={newExamSpots}
                                onChange={(e) => setNewExamSpots(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Faculties</Label>
                            <div className="max-h-[200px] overflow-y-auto border rounded-md p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {programGroups.map(group => (
                                        <div key={group.program} className="space-y-2">
                                            <h4 className="font-semibold">{group.program}</h4>
                                            {group.faculities_list.map(faculty => (
                                                <div key={faculty.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`faculty-${faculty.id}`}
                                                        checked={selectedFacultyIds.includes(faculty.id)}
                                                        onCheckedChange={() => handleFacultySelect(faculty.id)}
                                                    />
                                                    <Label
                                                        htmlFor={`faculty-${faculty.id}`}
                                                        className="text-sm"
                                                    >
                                                        {faculty.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowExamDateDialog(false);
                                setNewExamDate("");
                                setNewExamSpots(100);
                                setSelectedFacultyIds([]);
                                setEditingExamDate(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (editingExamDate) {
                                    handleUpdateExamDate(editingExamDate.id, {
                                        date: newExamDate,
                                        available_spots: newExamSpots,
                                        is_active: true
                                    });
                                } else {
                                    handleCreateExamDate();
                                }
                            }}
                            // Изменим условие активации кнопки
                            disabled={!newExamDate || newExamSpots < 1 || selectedFacultyIds.length === 0}
                        >
                            {editingExamDate ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default FacultyManagement;