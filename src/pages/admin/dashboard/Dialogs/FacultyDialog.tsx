import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Faculty, ProgramDegree } from '../types';

interface FacultyDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    faculty?: Faculty;
    onSubmit: (data: {
        name: string;
        program: ProgramDegree;
        is_active?: boolean;
    }) => Promise<void>;
}

export const FacultyDialog: React.FC<FacultyDialogProps> = ({
    open,
    onOpenChange,
    faculty,
    onSubmit
}) => {
    const [name, setName] = useState(faculty?.name || '');
    const [program, setProgram] = useState<ProgramDegree>(faculty?.program || 'bachelor');
    const [isActive, setIsActive] = useState(faculty?.is_active ?? true);

    useEffect(() => {
        if (faculty) {
            setName(faculty.name);
            setProgram(faculty.program);
            setIsActive(faculty.is_active);
        } else {
            setName('');
            setProgram('bachelor');
            setIsActive(true);
        }
    }, [faculty]);

    const handleSubmit = async () => {
        await onSubmit({ name, program, is_active: isActive });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {faculty ? 'Edit Faculty' : 'Create New Faculty'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Program Degree</Label>
                        <Select
                            value={program}
                            onValueChange={(value) => setProgram(value as ProgramDegree)}
                        >
                            <SelectTrigger>
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
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter faculty name"
                        />
                    </div>

                    {faculty && (
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="faculty-active"
                                checked={isActive}
                                onCheckedChange={(checked) => setIsActive(checked as boolean)}
                            />
                            <Label htmlFor="faculty-active">Active</Label>
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
                            disabled={!name || !program}
                        >
                            {faculty ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default FacultyDialog;