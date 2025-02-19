import React, {useEffect, useState, useCallback} from 'react';
import {useToast} from "@/hooks/use-toast";
import {api, CreateExamDateDto, UpdateExamDateDto} from '@/lib/api-client';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import axios from 'axios';
import {Button} from '@/components/ui/button'

// Components
import Header from './dashboard/Header/Header';
import Filters from './dashboard/Filters/Filters';
import ApplicationTable from './dashboard/ApplicationTable/ApplicationTable';
import EditApplicationDialog from './dashboard/Dialogs/EditApplicationDialog';
import FacultyDialog from './dashboard/Dialogs/FacultyDialog';
import ExamDateDialog from './dashboard/Dialogs/ExamDateDialog';
import DocumentPreviewDialog from './dashboard/Dialogs/DocumentPreviewDialog';

// Types
import {
    Application,
    Faculty,
    ExamDate,
    PaymentStatus,
    ProgramDegree,
    DocumentInfo
} from './dashboard/types';
import FacultyManagement from "@/components/AdmissionForm/FacultyManagement.tsx";

// Constants
const CURRENT_USER = "lilnurik";
const CURRENT_DATETIME = "2025-01-24 05:55:36";
const API_BASE_URL = "https://regback.turin.uz";

export const Dashboard = () => {
    // State management
    const [applications, setApplications] = useState<Application[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [examDates, setExamDates] = useState<ExamDate[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all-statuses">("all-statuses");
    const [facultyFilter, setFacultyFilter] = useState<string>("all-faculties");
    const [programFilter, setProgramFilter] = useState<ProgramDegree | "all-programs">("all-programs");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Dialog states
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showFacultyDialog, setShowFacultyDialog] = useState(false);
    const [showExamDateDialog, setShowExamDateDialog] = useState(false);
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);

    // Selected items state
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    const [editingExamDate, setEditingExamDate] = useState<ExamDate | null>(null);
    const [selectedDocuments, setSelectedDocuments] = useState<DocumentInfo[]>([]);
    const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);

    const {toast} = useToast();

    // Fetch functions
    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            console.log(`Fetching applications by ${CURRENT_USER} at ${CURRENT_DATETIME}`);

            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm || undefined,
                faculty_id: facultyFilter !== "all-faculties" ? Number(facultyFilter) : undefined,
                program_degree: programFilter !== "all-programs" ? programFilter : undefined,
                payment_status: statusFilter !== "all-statuses" ? statusFilter : undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined
            };

            const response = await api.getApplications(params);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setApplications(response.data.items);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setTotalPages(Math.ceil(response.data.total / 10));
        } catch (error) {
            console.error("Error fetching applications:", error);
            toast({
                title: "Error",
                description: "Failed to fetch applications",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, facultyFilter, programFilter, statusFilter, startDate, endDate, toast]);

    const fetchFaculties = useCallback(async () => {
        try {
            const response = await api.getFaculties();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setFaculties(response.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch faculties",
                variant: "destructive",
            });
        }
    }, [toast]);

    const fetchExamDates = useCallback(async (facultyId?: number) => {
        try {
            const response = await api.getExamDates(facultyId);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setExamDates(response.data);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch exam dates",
                variant: "destructive",
            });
        }
    }, [toast]);

    // Handlers
    const handleUpdateApplication = async (applicationId: number, data: {
        faculty_id?: number;
        exam_date_id?: number;
    }) => {
        try {
            console.log(`Updating application by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
            await api.updateApplication(applicationId, data);
            await fetchApplications();
            setShowEditDialog(false);
            setEditingApplication(null);
            toast({
                title: "Success",
                description: "Application updated successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update application",
                variant: "destructive",
            });
        }
    };

    const handleExportToExcel = async () => {
        try {
            console.log(`Exporting to Excel by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
            const exportData = applications.map(app => ({
                'First Name': app.first_name,
                'Last Name': app.last_name,
                'Middle Name': app.middle_name || '',
                'Gender': app.gender,
                'Phone': app.phone,
                'School': app.school,
                'Faculty': app.faculty_name,
                'Program Degree': app.program_degree,
                'Exam Date': app.exam_date,
                'Payment Status': app.payment_status,
                'Created At': app.created_at,
                'Updated At': app.updated_at
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Applications');
            XLSX.writeFile(wb, `applications_${new Date().toISOString().split('T')[0]}.xlsx`);

            toast({
                title: "Success",
                description: "Applications exported successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to export applications",
                variant: "destructive",
            });
        }
    };

    const handleDocumentDownload = async (filePath: string, fileName: string) => {
        try {
            console.log(`Downloading document by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
            const url = `${API_BASE_URL}/uploads/${filePath}`;
            const response = await axios.get(url, {responseType: 'blob'});
            FileSaver.saveAs(new Blob([response.data]), fileName);

            toast({
                title: "Success",
                description: "Document downloaded successfully"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to download document",
                variant: "destructive",
            });
        }
    };

    const handleDocumentsView = async (application: Application) => {
        try {
            console.log(`Viewing documents by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
            const documentUrls = Object.entries(application.documents).map(([type, fileName]) => ({
                type,
                fileName,
                url: `${API_BASE_URL}/uploads/${fileName}`
            }));

            setSelectedDocuments(documentUrls);
            setCurrentDocumentIndex(0);
            setShowDocumentPreview(true);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load documents",
                variant: "destructive",
            });
        }
    };

    const handleDeleteApplication = async (id: number) => {
        try {
            console.log(`Deleting application by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
            await api.deleteApplication(id);
            await fetchApplications();
            toast({
                title: "Success",
                description: "Application deleted successfully",
            });
        } catch (error) {
            console.error('Delete application error:', error);
            toast({
                title: "Error",
                description: "Failed to delete application",
                variant: "destructive",
            });
        }
    };

    // Effects
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    useEffect(() => {
        fetchFaculties();
    }, [fetchFaculties]);

    useEffect(() => {
        if (editingApplication?.faculty_id) {
            fetchExamDates(editingApplication.faculty_id);
        }
    }, [editingApplication?.faculty_id, fetchExamDates]);

    return (
        <div className="p-8 max-w-8SATxl mx-auto">
            <Header
                onRefresh={fetchApplications}
                onExport={handleExportToExcel}
                loading={loading}
                applicationCount={applications.length}
                currentDateTime={CURRENT_DATETIME}
            />

            <Filters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                programFilter={programFilter}
                onProgramFilterChange={setProgramFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                facultyFilter={facultyFilter}
                onFacultyFilterChange={setFacultyFilter}
                faculties={faculties}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
            />

            <ApplicationTable
                applications={applications}
                loading={loading}
                onEdit={(app) => {
                    setEditingApplication(app);
                    setShowEditDialog(true);
                }}
                onViewDocuments={handleDocumentsView}
                onDelete={handleDeleteApplication}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="py-2 px-4">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Dialogs */}
            <EditApplicationDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                application={editingApplication}
                faculties={faculties}
                examDates={examDates}
                onUpdate={handleUpdateApplication}
                onExamDatesFetch={fetchExamDates}
                onDocumentDownload={handleDocumentDownload}
            />

            <FacultyDialog
                open={showFacultyDialog}
                onOpenChange={setShowFacultyDialog}
                faculty={editingFaculty}
                onSubmit={async (data) => {
                    if (editingFaculty) {
                        await api.updateFaculty(editingFaculty.id, data);
                    } else {
                        await api.createFaculty(data);
                    }
                    await fetchFaculties();
                }}
            />

            <ExamDateDialog
                open={showExamDateDialog}
                onOpenChange={setShowExamDateDialog}
                examDate={editingExamDate}
                faculties={faculties}
                onSubmit={async (data) => {
                    try {
                        if (editingExamDate) {
                            await api.updateExamDate(editingExamDate.id, data as UpdateExamDateDto);
                            toast({
                                title: "Success",
                                description: "Exam date updated successfully",
                            });
                        } else {
                            await api.createExamDate(data as CreateExamDateDto);
                            toast({
                                title: "Success",
                                description: "Exam date created successfully",
                            });
                        }
                        await fetchFaculties();
                        setShowExamDateDialog(false);
                        setEditingExamDate(null);
                    } catch (error) {
                        console.error('Failed to save exam date:', error);
                        toast({
                            title: "Error",
                            description: "Failed to save exam date",
                            variant: "destructive",
                        });
                    }
                }}
            />


            <DocumentPreviewDialog
                open={showDocumentPreview}
                onOpenChange={setShowDocumentPreview}
                documents={selectedDocuments}
                currentIndex={currentDocumentIndex}
                onIndexChange={setCurrentDocumentIndex}
                onDownload={handleDocumentDownload}
            />
        </div>
    );
};

export default Dashboard;