import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface HeaderProps {
    onRefresh: () => void;
    onExport: () => void;
    loading: boolean;
    applicationCount: number;
    currentDateTime: string;
}

export const Header: React.FC<HeaderProps> = ({
    onRefresh,
    onExport,
    loading,
    applicationCount,
    currentDateTime
}) => {
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-primary">Applications Dashboard</h1>
                <p className="text-sm text-gray-500">Last updated: {currentDateTime}</p>
            </div>
            <div className="space-x-4">
                <Button
                    variant="outline"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    Refresh Data
                </Button>
                <Button
                    onClick={onExport}
                    className="flex items-center gap-2"
                    disabled={loading || applicationCount === 0}
                >
                    <Download className="h-4 w-4"/> Export to Excel
                </Button>
            </div>
        </div>
    );
};

export default Header;