import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../api/axios';
import { 
    FaDownload, FaTrash, FaUpload, FaSpinner, FaFile, FaFileAlt, 
    FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaPlus, 
    FaShare, FaChevronDown, FaFolder, FaUserTie 
} from 'react-icons/fa';
import Navbar from '../../components/dashboard/Navbar';

interface FileMetadata {
    id: string;
    filename: string;
    size: number;
    uploaded_at: string;
    mime_type?: string;
}

interface Employee {
    employee_id: string;
    name: string;
    email: string;
    department: string;
    position: string;
}

interface EmployeeFile {
    _id: string;
    employee_id: string;
    files: Array<{
        file_id: string;
        filename: string;
        size: number;
        uploaded_at: string;
        mime_type?: string;
    }>;
}

const fetchFiles = async (): Promise<FileMetadata[]> => {
    const res = await api.get('/files/list');
    return res.data;
};

const fetchEmployees = async (): Promise<Employee[]> => {
    const res = await api.get('/employees/');
    return res.data;
};

const fetchEmployeeFiles = async (): Promise<EmployeeFile[]> => {
    const res = await api.get('/files/employee-files');
    return res.data;
};

const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

const uploadEmployeeFiles = async ({ employeeId, files }: { employeeId: string, files: File[] }) => {
    const formData = new FormData();
    formData.append("employee_id", employeeId);
    files.forEach(file => {
        formData.append("files", file);
    });
    const res = await api.post('/files/upload-employee-files', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

const deleteFile = async (fileId: string) => {
    const res = await api.delete(`/files/${fileId}`);
    return res.data;
};

const deleteEmployeeFile = async ({ employeeId, fileId }: { employeeId: string, fileId: string }) => {
    const res = await api.delete(`/files/employee-files/${employeeId}/${fileId}`);
    return res.data;
};

const FileManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'employee'>('general');
    
    // Employee file management states
    const [showEmployeeUpload, setShowEmployeeUpload] = useState(false);
    const [selectedRange, setSelectedRange] = useState<string>('');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('');
    const [selectedEmployeeFiles, setSelectedEmployeeFiles] = useState<File[]>([]);
    const [viewingEmployee, setViewingEmployee] = useState<string>('');

    const { data: files, isLoading: filesLoading, isError: filesError } = useQuery<FileMetadata[], Error>({
        queryKey: ['files'],
        queryFn: fetchFiles,
    });

    const { data: employees, isLoading: employeesLoading } = useQuery<Employee[], Error>({
        queryKey: ['employees'],
        queryFn: fetchEmployees,
    });

    const { data: employeeFiles, isLoading: employeeFilesLoading } = useQuery<EmployeeFile[], Error>({
        queryKey: ['employee-files'],
        queryFn: fetchEmployeeFiles,
    });

    const uploadMutation = useMutation({
        mutationFn: uploadFile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
            toast.success("File uploaded successfully!");
            setSelectedFile(null);
        },
        onError: (error) => {
            toast.error(`Upload failed: ${error.message}`);
        },
    });

    const uploadEmployeeFilesMutation = useMutation({
        mutationFn: uploadEmployeeFiles,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-files'] });
            toast.success("Employee files uploaded successfully!");
            setSelectedEmployeeFiles([]);
            setSelectedEmployee('');
            setShowEmployeeUpload(false);
        },
        onError: (error) => {
            toast.error(`Upload failed: ${error.message}`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteFile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['files'] });
            toast.success("File deleted successfully!");
        },
        onError: (error) => {
            toast.error(`Deletion failed: ${error.message}`);
        },
    });

    const deleteEmployeeFileMutation = useMutation({
        mutationFn: deleteEmployeeFile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employee-files'] });
            toast.success("Employee file deleted successfully!");
        },
        onError: (error) => {
            toast.error(`Deletion failed: ${error.message}`);
        },
    });

    // Generate range options
    const getRangeOptions = () => {
        if (!employees) return [];
        const totalEmployees = employees.length;
        const ranges = [];
        for (let i = 0; i < totalEmployees; i += 100) {
            const end = Math.min(i + 99, totalEmployees - 1);
            ranges.push(`${i}-${end}`);
        }
        return ranges;
    };

    // Get employees for selected range
    const getEmployeesForRange = () => {
        if (!employees || !selectedRange) return [];
        const [start, end] = selectedRange.split('-').map(Number);
        return employees.slice(start, end + 1);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleEmployeeFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedEmployeeFiles(Array.from(e.target.files));
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            if (activeTab === 'general') {
                setSelectedFile(e.dataTransfer.files[0]);
            } else {
                setSelectedEmployeeFiles(Array.from(e.dataTransfer.files));
            }
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            uploadMutation.mutate(selectedFile);
        } else {
            toast.error("Please select a file to upload.");
        }
    };

    const handleEmployeeFilesUpload = () => {
        if (selectedEmployee && selectedEmployeeFiles.length > 0) {
            uploadEmployeeFilesMutation.mutate({
                employeeId: selectedEmployee,
                files: selectedEmployeeFiles
            });
        } else {
            toast.error("Please select an employee and files to upload.");
        }
    };

    const handleDelete = (fileId: string) => {
        if (window.confirm("Are you sure you want to delete this file?")) {
            deleteMutation.mutate(fileId);
        }
    };

    const handleEmployeeFileDelete = (employeeId: string, fileId: string) => {
        if (window.confirm("Are you sure you want to delete this employee file?")) {
            deleteEmployeeFileMutation.mutate({ employeeId, fileId });
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (filename: string, mimeType?: string) => {
        const extension = filename.split('.').pop()?.toLowerCase();
        
        if (mimeType?.startsWith('image/')) {
            return <FaImage className="text-emerald-500" />;
        } else if (extension === 'pdf') {
            return <FaFilePdf className="text-red-500" />;
        } else if (['doc', 'docx'].includes(extension || '')) {
            return <FaFileWord className="text-blue-500" />;
        } else if (['xls', 'xlsx'].includes(extension || '')) {
            return <FaFileExcel className="text-green-600" />;
        } else {
            return <FaFileAlt className="text-slate-500" />;
        }
    };

    const getEmployeeById = (employeeId: string) => {
        return employees?.find(emp => emp.employee_id === employeeId);
    };

    const getEmployeeFileCount = (employeeId: string) => {
        return employeeFiles?.find(ef => ef.employee_id === employeeId)?.files?.length || 0;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <Navbar />
            
            <main className="mx-auto max-w-7xl px-4 py-8 pt-24 sm:px-6 sm:pt-28 md:pl-72 lg:px-8">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        📁 File Management System
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Centralized file management for general documents and employee-specific files
                    </p>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-8">
                    <div className="flex justify-center">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/30">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    activeTab === 'general'
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                            >
                                <FaFile className="inline mr-2" />
                                General Files
                            </button>
                            <button
                                onClick={() => setActiveTab('employee')}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                    activeTab === 'employee'
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                        : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                                }`}
                            >
                                <FaUserTie className="inline mr-2" />
                                Employee Files
                            </button>
                        </div>
                    </div>
                </div>

                {activeTab === 'general' ? (
                    <>
                        {/* General File Upload Section */}
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl mb-10 border border-white/30">
                            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center">
                                <FaUpload className="mr-3 text-blue-500" />
                                Upload General File
                            </h2>
                            
                            <div
                                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                                    dragActive 
                                        ? 'border-indigo-500 bg-indigo-50 scale-105' 
                                        : 'border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50'
                                }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="space-y-4">
                                    <div className="text-5xl text-indigo-400 mx-auto">
                                        {selectedFile ? <FaFile /> : <FaUpload />}
                                    </div>
                                    
                                    {selectedFile ? (
                                        <div className="space-y-2">
                                            <p className="text-lg font-medium text-slate-800">{selectedFile.name}</p>
                                            <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-lg font-medium text-slate-700">Drag and drop your file here</p>
                                            <p className="text-sm text-slate-500">or click to browse</p>
                                        </div>
                                    )}
                                    
                                    <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <FaFile className="mr-2" />
                                        Choose File
                                    </label>
                                </div>
                            </div>
                            
                            {selectedFile && (
                                <div className="mt-6 text-center">
                                    <button
                                        onClick={handleUpload}
                                        disabled={uploadMutation.isPending}
                                        className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    >
                                        {uploadMutation.isPending ? (
                                            <>
                                                <FaSpinner className="animate-spin text-xl" />
                                                <span className="text-lg">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FaUpload className="text-xl" />
                                                <span className="text-lg">Upload File</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* General File List Section */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
                            <div className="p-8 border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                                    <FaFolder className="mr-3 text-blue-500" />
                                    General Files
                                </h2>
                                <p className="text-slate-600 mt-2">Manage your uploaded documents</p>
                            </div>
                            
                            <div className="p-8">
                                {filesLoading && (
                                    <div className="text-center py-12">
                                        <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto mb-4" />
                                        <p className="text-slate-500 text-lg">Loading files...</p>
                                    </div>
                                )}
                                
                                {filesError && (
                                    <div className="text-center py-12">
                                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                        <p className="text-red-500 text-lg">Error fetching files. Please try again.</p>
                                    </div>
                                )}
                                
                                {files && files.length > 0 ? (
                                    <div className="space-y-4">
                                        {files.map((file) => (
                                            <div key={file.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white">
                                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                    <div className="text-3xl flex-shrink-0">
                                                        {getFileIcon(file.filename, file.mime_type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 truncate text-lg">
                                                            {file.filename}
                                                        </p>
                                                        <div className="flex items-center space-x-3 text-sm text-slate-500 mt-1">
                                                            <span>{formatFileSize(file.size)}</span>
                                                            <span className="text-slate-300">•</span>
                                                            <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <a 
                                                        href={`${api.defaults.baseURL}/files/${file.id}`}
                                                        className="p-3 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-all duration-300"
                                                        title="Download"
                                                    >
                                                        <FaDownload className="text-lg" />
                                                    </a>
                                                    <button 
                                                        onClick={() => handleDelete(file.id)}
                                                        className="p-3 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-all duration-300"
                                                        title="Delete"
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        {deleteMutation.isPending ? 
                                                            <FaSpinner className="animate-spin text-lg" /> : 
                                                            <FaTrash className="text-lg" />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    !filesLoading && (
                                        <div className="text-center py-16">
                                            <div className="text-slate-400 text-8xl mb-6">📂</div>
                                            <h3 className="text-2xl font-semibold text-slate-600 mb-2">No files yet</h3>
                                            <p className="text-slate-500 text-lg">Upload your first file to get started!</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Employee Files Section */}
                        <div className="space-y-8">
                            {/* Manage Employee Files Header */}
                            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-white/30">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                                            <FaUserTie className="mr-3 text-blue-500" />
                                            Manage Employee Files
                                        </h2>
                                        <p className="text-slate-600 mt-1">Upload and manage files for specific employees</p>
                                    </div>
                                    <button
                                        onClick={() => setShowEmployeeUpload(!showEmployeeUpload)}
                                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                                    >
                                        <FaPlus className="text-lg" />
                                        <span className="font-semibold">Add Files</span>
                                    </button>
                                </div>
                            </div>

                            {/* Employee File Upload Form */}
                            {showEmployeeUpload && (
                                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/30">
                                    <h3 className="text-xl font-bold text-slate-800 mb-6">Upload Employee Files</h3>
                                    
                                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                                        {/* Range Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Select Employee Range
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedRange}
                                                    onChange={(e) => {
                                                        setSelectedRange(e.target.value);
                                                        setSelectedEmployee('');
                                                    }}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                                    disabled={employeesLoading}
                                                >
                                                    <option value="">Select range...</option>
                                                    {getRangeOptions().map(range => (
                                                        <option key={range} value={range}>
                                                            Employees {range}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FaChevronDown className="absolute right-3 top-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Employee Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Select Employee
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedEmployee}
                                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                                    disabled={!selectedRange}
                                                >
                                                    <option value="">Select employee...</option>
                                                    {getEmployeesForRange().map(employee => (
                                                        <option key={employee.employee_id} value={employee.employee_id}>
                                                            {employee.employee_id} - {employee.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FaChevronDown className="absolute right-3 top-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* File Selection */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Select Files (Multiple files allowed)
                                        </label>
                                        <div
                                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                                                dragActive 
                                                    ? 'border-indigo-500 bg-indigo-50' 
                                                    : 'border-slate-300 bg-slate-50 hover:border-indigo-400'
                                            }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <div className="space-y-4">
                                                <FaUpload className="text-4xl text-indigo-400 mx-auto" />
                                                
                                                {selectedEmployeeFiles.length > 0 ? (
                                                    <div className="space-y-2">
                                                        <p className="text-lg font-medium text-slate-800">
                                                            {selectedEmployeeFiles.length} file(s) selected
                                                        </p>
                                                        <div className="text-sm text-slate-500 max-h-32 overflow-y-auto">
                                                            {selectedEmployeeFiles.map((file, index) => (
                                                                <div key={index} className="flex justify-between items-center py-1">
                                                                    <span>{file.name}</span>
                                                                    <span>{formatFileSize(file.size)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        <p className="text-lg font-medium text-slate-700">Drop files here or click to browse</p>
                                                        <p className="text-sm text-slate-500">Multiple files can be selected</p>
                                                    </div>
                                                )}
                                                
                                                <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleEmployeeFilesChange}
                                                        className="hidden"
                                                    />
                                                    <FaFile className="mr-2" />
                                                    Choose Files
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Upload Button */}
                                    <div className="flex justify-end space-x-3">
                                        <button
                                            onClick={() => setShowEmployeeUpload(false)}
                                            className="px-6 py-3 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition-all duration-300"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleEmployeeFilesUpload}
                                            disabled={!selectedEmployee || selectedEmployeeFiles.length === 0 || uploadEmployeeFilesMutation.isPending}
                                            className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {uploadEmployeeFilesMutation.isPending ? (
                                                <>
                                                    <FaSpinner className="animate-spin" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload />
                                                    <span>Upload Files</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Employee Files List */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/30 overflow-hidden">
                                <div className="p-8 border-b border-slate-200/50 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                                        <FaFolder className="mr-3 text-blue-500" />
                                        Employee Files
                                    </h2>
                                    <p className="text-slate-600 mt-2">Browse and manage employee-specific documents</p>
                                </div>
                                
                                <div className="p-8">
                                    {employeeFilesLoading ? (
                                        <div className="text-center py-12">
                                            <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto mb-4" />
                                            <p className="text-slate-500 text-lg">Loading employee files...</p>
                                        </div>
                                    ) : employeeFiles && employeeFiles.length > 0 ? (
                                        <div className="space-y-4">
                                            {employeeFiles.map((employeeFile) => {
                                                const employee = getEmployeeById(employeeFile.employee_id);
                                                const fileCount = employeeFile.files.length;
                                                const isExpanded = viewingEmployee === employeeFile.employee_id;
                                                
                                                return (
                                                    <div key={employeeFile._id} className="border border-slate-200 rounded-2xl bg-white/70 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                                                        {/* Employee Header */}
                                                        <div 
                                                            className="flex items-center justify-between p-6 cursor-pointer hover:bg-slate-50 transition-all duration-300"
                                                            onClick={() => setViewingEmployee(isExpanded ? '' : employeeFile.employee_id)}
                                                        >
                                                            <div className="flex items-center space-x-4">
                                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                                    {employee?.name?.charAt(0) || employeeFile.employee_id.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-semibold text-slate-800">
                                                                        {employee?.name || 'Unknown Employee'}
                                                                    </h3>
                                                                    <div className="flex items-center space-x-3 text-sm text-slate-500">
                                                                        <span>ID: {employeeFile.employee_id}</span>
                                                                        <span className="text-slate-300">•</span>
                                                                        <span>{employee?.department}</span>
                                                                        <span className="text-slate-300">•</span>
                                                                        <span>{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center space-x-3">
                                                                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                                    {fileCount} files
                                                                </div>
                                                                <FaChevronDown className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>

                                                        {/* Employee Files */}
                                                        {isExpanded && (
                                                            <div className="border-t border-slate-200 bg-slate-50/50">
                                                                <div className="p-6 space-y-3">
                                                                    {employeeFile.files.map((file) => (
                                                                        <div key={file.file_id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md">
                                                                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                                                <div className="text-2xl flex-shrink-0">
                                                                                    {getFileIcon(file.filename, file.mime_type)}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-medium text-slate-900 truncate">
                                                                                        {file.filename}
                                                                                    </p>
                                                                                    <div className="flex items-center space-x-3 text-sm text-slate-500 mt-1">
                                                                                        <span>{formatFileSize(file.size)}</span>
                                                                                        <span className="text-slate-300">•</span>
                                                                                        <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div className="flex items-center space-x-2">
                                                                                <a 
                                                                                    href={`${api.defaults.baseURL}/files/employee-files/${employeeFile.employee_id}/${file.file_id}`}
                                                                                    className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all duration-300"
                                                                                    title="Download"
                                                                                >
                                                                                    <FaDownload />
                                                                                </a>
                                                                                <button 
                                                                                    className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all duration-300"
                                                                                    title="Share"
                                                                                    onClick={() => {
                                                                                        navigator.clipboard.writeText(`${api.defaults.baseURL}/files/employee-files/${employeeFile.employee_id}/${file.file_id}`);
                                                                                        toast.success('File link copied to clipboard!');
                                                                                    }}
                                                                                >
                                                                                    <FaShare />
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => handleEmployeeFileDelete(employeeFile.employee_id, file.file_id)}
                                                                                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-300"
                                                                                    title="Delete"
                                                                                    disabled={deleteEmployeeFileMutation.isPending}
                                                                                >
                                                                                    {deleteEmployeeFileMutation.isPending ? 
                                                                                        <FaSpinner className="animate-spin" /> : 
                                                                                        <FaTrash />
                                                                                    }
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="text-slate-400 text-8xl mb-6">👥</div>
                                            <h3 className="text-2xl font-semibold text-slate-600 mb-2">No employee files yet</h3>
                                            <p className="text-slate-500 text-lg">Upload files for employees to get started!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default FileManagement;





// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import toast from 'react-hot-toast';
// import { api } from '../../api/axios';
// import { FaDownload, FaTrash, FaUpload, FaSpinner, FaFile, FaFileAlt, FaImage, FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa';
// import Navbar from '../../components/dashboard/Navbar';

// interface FileMetadata {
//     id: string;
//     filename: string;
//     size: number;
//     uploaded_at: string;
//     mime_type?: string;
// }

// const fetchFiles = async (): Promise<FileMetadata[]> => {
//     const res = await api.get('/files/list');
//     return res.data;
// };

// const uploadFile = async (file: File) => {
//     const formData = new FormData();
//     formData.append("file", file);
//     const res = await api.post('/files/upload', formData, {
//         headers: {
//             'Content-Type': 'multipart/form-data',
//         },
//     });
//     return res.data;
// };

// const deleteFile = async (fileId: string) => {
//     const res = await api.delete(`/files/${fileId}`);
//     return res.data;
// };

// const FileManagement: React.FC = () => {
//     const queryClient = useQueryClient();
//     const [selectedFile, setSelectedFile] = useState<File | null>(null);
//     const [dragActive, setDragActive] = useState(false);

//     const { data: files, isLoading, isError } = useQuery<FileMetadata[], Error>({
//         queryKey: ['files'],
//         queryFn: fetchFiles,
//     });

//     const uploadMutation = useMutation({
//         mutationFn: uploadFile,
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['files'] });
//             toast.success("File uploaded successfully!");
//             setSelectedFile(null);
//         },
//         onError: (error) => {
//             toast.error(`Upload failed: ${error.message}`);
//         },
//     });

//     const deleteMutation = useMutation({
//         mutationFn: deleteFile,
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: ['files'] });
//             toast.success("File deleted successfully!");
//         },
//         onError: (error) => {
//             toast.error(`Deletion failed: ${error.message}`);
//         },
//     });

//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             setSelectedFile(e.target.files[0]);
//         }
//     };

//     const handleDrag = (e: React.DragEvent) => {
//         e.preventDefault();
//         e.stopPropagation();
//         if (e.type === "dragenter" || e.type === "dragover") {
//             setDragActive(true);
//         } else if (e.type === "dragleave") {
//             setDragActive(false);
//         }
//     };

//     const handleDrop = (e: React.DragEvent) => {
//         e.preventDefault();
//         e.stopPropagation();
//         setDragActive(false);
        
//         if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//             setSelectedFile(e.dataTransfer.files[0]);
//         }
//     };

//     const handleUpload = () => {
//         if (selectedFile) {
//             uploadMutation.mutate(selectedFile);
//         } else {
//             toast.error("Please select a file to upload.");
//         }
//     };

//     const handleDelete = (fileId: string) => {
//         if (window.confirm("Are you sure you want to delete this file?")) {
//             deleteMutation.mutate(fileId);
//         }
//     };

//     const formatFileSize = (bytes: number): string => {
//         if (bytes === 0) return '0 Bytes';
//         const k = 1024;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//     };

//     const getFileIcon = (filename: string, mimeType?: string) => {
//         const extension = filename.split('.').pop()?.toLowerCase();
        
//         if (mimeType?.startsWith('image/')) {
//             return <FaImage className="text-green-500" />;
//         } else if (extension === 'pdf') {
//             return <FaFilePdf className="text-red-500" />;
//         } else if (['doc', 'docx'].includes(extension || '')) {
//             return <FaFileWord className="text-blue-500" />;
//         } else if (['xls', 'xlsx'].includes(extension || '')) {
//             return <FaFileExcel className="text-green-600" />;
//         } else {
//             return <FaFileAlt className="text-gray-500" />;
//         }
//     };

//     return (
//         <div className="min-h-screen w-[1400px]  bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-gray-800">
//             <Navbar /><br /><br />
//             {/* Main content container: centered, with responsive padding and max-width */}
//             <main className="mx-auto max-w-8xl px-4 py-8 pt-24 sm:px-6 sm:pt-28 md:pl-72 lg:px-8">
//                 <div className="mb-10 sm:mb-14">
//                     <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-center bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">
//                         File Management 📁
//                     </h1><br />
//                     <p className="text-center text-gray-600 text-lg">Upload, organize, and manage your files with ease</p>
//                 </div><br />
                
//                 {/* File Upload Section */}
//                 <div className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl mb-10 sm:mb-14 border border-white/20">
//                     <br /><h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">Upload New File</h2>
//                     <br />
//                     {/* Drag and Drop Zone */}
//                     <div
//                         className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
//                             dragActive 
//                                 ? 'border-indigo-500 bg-indigo-50 scale-105' 
//                                 : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
//                         }`}
//                         onDragEnter={handleDrag}
//                         onDragLeave={handleDrag}
//                         onDragOver={handleDrag}
//                         onDrop={handleDrop}
//                     ><br />
//                         <div className="p-8 space-y-4"><br />
//                             <div className="text-4xl sm:text-5xl text-indigo-400 mx-auto">
//                                 {selectedFile ? <FaFile /> : <FaUpload />}
//                             </div><br />
                            
//                             {selectedFile ? (
//                                 <div className="space-y-1">
//                                     <p className="text-lg font-medium text-gray-800">{selectedFile.name}</p>
//                                     <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p><br />
//                                 </div>
//                             ) : (
//                                 <div className="space-y-1">
//                                     <p className="text-lg font-medium text-gray-700">Drag and drop your file here</p>
//                                     <p className="text-sm text-gray-500">or click to browse</p>
//                                     <br />
//                                 </div>
//                             )}
                            
//                             <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full cursor-pointer hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
//                                 <input
//                                     type="file"
//                                     onChange={handleFileChange}
//                                     className="hidden"
//                                 />
//                                 <FaFile className="mr-2" />
//                                 Choose File
//                             </label>
                            
//                         </div>
//                         <br />
//                     </div>
//                     <br />
//                     {/* Upload Button */}
//                     {selectedFile && (
//                         <div className="mt-6 text-center">
//                             <button
//                                 onClick={handleUpload}
//                                 disabled={uploadMutation.isPending}
//                                 className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//                             >
//                                 {uploadMutation.isPending ? (
//                                     <>
//                                         <FaSpinner className="animate-spin text-xl" />
//                                         <span className="text-lg">Uploading...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <FaUpload className="text-xl" />
//                                         <span className="text-lg">Upload File</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     )}
//                 </div>
//                 <br />

//                 {/* File List Section */}
//                 <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
//                     <br /><div className="p-6 sm:p-8 border-b border-gray-200/50">
//                         <br /><h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Files</h2>
//                         <br /><p className="text-gray-600 mt-1">Manage and organize your uploaded files</p>
//                     <br /></div>
                    
//                     <div className="p-6 sm:p-8">
//                         {isLoading && (
//                             <div className="text-center py-12">
//                                 <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto mb-4" />
//                                 <p className="text-gray-500 text-lg">Loading files...</p>
//                             </div>
//                         )}
                        
//                         {isError && (
//                             <div className="text-center py-12">
//                                 <div className="text-red-500 text-6xl mb-4">⚠️</div>
//                                 <p className="text-red-500 text-lg">Error fetching files. Please try again.</p>
//                             </div>
//                         )}
                        
//                         {files && files.length > 0 ? (
//                             <div className="space-y-4">
//                                 {files.map((file) => (
//                                     <div key={file.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-slate-50">
//                                         <div className="flex items-center space-x-4 flex-1 min-w-0">
//                                             <div className="text-3xl flex-shrink-0 text-slate-500">
//                                                 {getFileIcon(file.filename, file.mime_type)}
//                                             </div>
//                                             <div className="flex-1 min-w-0">
//                                                 <p className="font-semibold text-gray-900 truncate text-base sm:text-lg">
//                                                     {file.filename}
//                                                 </p>
//                                                 <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-500 mt-1">
//                                                     <span>{formatFileSize(file.size)}</span>
//                                                     <span className="text-gray-300">•</span>
//                                                     <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
//                                                 </div>
//                                             </div>
//                                         </div>
                                        
//                                         <div className="flex items-center space-x-2 ml-2">
//                                             <a 
//                                                 href={`${api.defaults.baseURL}/files/${file.id}`}
//                                                 className="p-3 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full transition-all duration-300"
//                                                 title="Download"
//                                             >
//                                                 <FaDownload className="text-lg" />
//                                             </a>
//                                             <button 
//                                                 onClick={() => handleDelete(file.id)}
//                                                 className="p-3 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-all duration-300"
//                                                 title="Delete"
//                                                 disabled={deleteMutation.isPending}
//                                             >
//                                                 {deleteMutation.isPending ? 
//                                                     <FaSpinner className="animate-spin text-lg" /> : 
//                                                     <FaTrash className="text-lg" />
//                                                 }
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             !isLoading && (
//                                 <div className="text-center py-16">
//                                     <div className="text-gray-400 text-7xl sm:text-8xl mb-6">📂</div>
//                                     <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">No files yet</h3>
//                                     <p className="text-gray-500 text-base sm:text-lg">Upload your first file to get started!</p>
//                                 </div>
//                             )
//                         )}
//                     </div>
//                     <br />
//                 </div>
//             </main>
//         </div>
//     );
// };

// export default FileManagement;