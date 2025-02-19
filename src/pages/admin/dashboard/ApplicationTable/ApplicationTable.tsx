import React from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Info, Edit, Eye, Trash2 } from "lucide-react";
import { Application, PaymentStatus } from '../types';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApplicationTableProps {
    applications: Application[];
    loading: boolean;
    onEdit: (application: Application) => void;
    onViewDocuments: (application: Application) => void;
    onDelete: (id: number) => void;
}

const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
        case "paid":
            return <Check className="h-5 w-5 text-green-500"/>;
        case "failed":
            return <X className="h-5 w-5 text-red-500"/>;
        default:
            return <Info className="h-5 w-5 text-yellow-500"/>;
    }
};

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
    applications,
    loading,
    onEdit,
    onViewDocuments,
    onDelete
}) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = React.useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setSelectedApplicationId(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (selectedApplicationId) {
            onDelete(selectedApplicationId);
        }
        setDeleteDialogOpen(false);
        setSelectedApplicationId(null);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <Table>
                    <TableCaption>
                        {applications.length === 0 ?
                            "No applications found" :
                            `Showing ${applications.length} applications`}
                    </TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>School</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Program</TableHead>
                            <TableHead>English Level</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>SAT Score</TableHead>
                            <TableHead>Payment Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead>Faculty</TableHead>
                            <TableHead>Exam Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {applications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell className="font-medium">
                                    {app.first_name} {app.middle_name} {app.last_name}
                                </TableCell>
                                <TableCell>{app.school}</TableCell>
                                <TableCell>{app.phone}</TableCell>
                                <TableCell>
                                    {app.program_degree === 'bachelor' ? "Bachelor" : "Master"}
                                </TableCell>
                                <TableCell>
                                    {app.english_cert_type || 'Not specified'}
                                </TableCell>
                                <TableCell>
                                    {app.cert_score || 'Not specified'}
                                </TableCell>
                                <TableCell>
                                    {app.sat_score || 'Not taken'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(app.payment_status)}
                                        <span className="capitalize">{app.payment_status}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {new Date(app.created_at).toLocaleString()}
                                </TableCell>
                                <TableCell>{app.faculty_name}</TableCell>
                                <TableCell>{app.exam_date}</TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(app)}
                                        >
                                            <Edit className="h-4 w-4 mr-1"/>
                                            Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onViewDocuments(app)}
                                        >
                                            <Eye className="h-4 w-4 mr-1"/>
                                            View
                                        </Button>
                                        {/*Delete button*/}
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteClick(app.id)}
                                        >
                                            <Trash2 className="h-4 w-4 mr-1"/>
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Диалог подтверждения удаления */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Application</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this application? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default ApplicationTable;