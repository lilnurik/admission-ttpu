import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { DocumentInfo } from '../types';

interface DocumentPreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    documents: DocumentInfo[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
    // Обновляем сигнатуру функции, чтобы она соответствовала использованию
    onDownload: (filePath: string, fileName: string) => Promise<void>;
}

export const DocumentPreviewDialog: React.FC<DocumentPreviewDialogProps> = ({
    open,
    onOpenChange,
    documents,
    currentIndex,
    onIndexChange,
    onDownload
}) => {
    const currentDocument = documents[currentIndex];
    const CURRENT_USER = "lilnurik";
    const CURRENT_DATETIME = "2025-01-24 05:59:44";

    const handleDownload = async () => {
        if (currentDocument) {
            console.log(`Document download initiated by ${CURRENT_USER} at ${CURRENT_DATETIME}`);
            // Теперь передаем оба параметра
            await onDownload(currentDocument.fileName, currentDocument.fileName);
        }
    };

    if (!currentDocument) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <span>Documents Preview</span>
                            <div className="flex space-x-2">
                                {documents.map((doc, index) => (
                                    <Button
                                        key={doc.type}
                                        variant={index === currentIndex ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => onIndexChange(index)}
                                    >
                                        {doc.type}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                        >
                            <Download className="h-4 w-4 mr-1"/>
                            Download
                        </Button>
                    </DialogTitle>
                </DialogHeader>
                <div className="mt-4 relative overflow-hidden rounded-lg" style={{height: '60vh'}}>
                    {currentDocument.url.toLowerCase().endsWith('.pdf') ? (
                        <iframe
                            src={currentDocument.url}
                            className="w-full h-full"
                            title="Document Preview"
                        />
                    ) : (
                        <img
                            src={currentDocument.url}
                            alt="Document Preview"
                            className="max-w-full max-h-full object-contain mx-auto"
                        />
                    )}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                    <p>Previewed by: {CURRENT_USER}</p>
                    <p>Preview time: {CURRENT_DATETIME}</p>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DocumentPreviewDialog;