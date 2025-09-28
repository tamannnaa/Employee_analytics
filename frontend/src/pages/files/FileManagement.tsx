import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../api/axios';
import { 
    FaDownload, FaTrash, FaUpload, FaSpinner, FaFile, FaFileAlt, 
    FaImage, FaFilePdf, FaFileWord, FaFileExcel, FaPlus, 
    FaShare, FaChevronDown, FaFolder, FaUserTie, FaBuilding 
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
            return <FaImage className="text-emerald-600" />;
        } else if (extension === 'pdf') {
            return <FaFilePdf className="text-red-600" />;
        } else if (['doc', 'docx'].includes(extension || '')) {
            return <FaFileWord className="text-blue-600" />;
        } else if (['xls', 'xlsx'].includes(extension || '')) {
            return <FaFileExcel className="text-green-700" />;
        } else {
            return <FaFileAlt className="text-gray-600" />;
        }
    };

    const getEmployeeById = (employeeId: string) => {
        return employees?.find(emp => emp.employee_id === employeeId);
    };

    const getEmployeeFileCount = (employeeId: string) => {
        return employeeFiles?.find(ef => ef.employee_id === employeeId)?.files?.length || 0;
    };

    return (
        <div className="min-h-screen w-[1500px] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <Navbar /><br />
            <main className="pt-24">
                <div className="max-w-full mx-auto px-8 py-12">
                    {/* Header Section */}
                    <div className="mb-16 text-center">
                        <br />
                        <h1 className="text-5xl lg:text-6xl h-20 font-bold mb-6 bg-gradient-to-r from-blue-800 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                            File Management System
                        </h1>
                        <br />
                        <p className="text-xl text-gray-700  mx-auto leading-relaxed">
                            Comprehensive file management solution for general documents and employee-specific files
                        </p>
                        <br />
                    </div>
                    <br />
                    {/* Navigation Tabs */}
                    <div className="mb-16">
                        <br />
                        <div className="flex justify-center">
                            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-2 shadow-2xl border border-white/40">
                                <button
                                    onClick={() => setActiveTab('general')}
                                    className={`px-10 py-4 rounded-lg font-bold text-xl h-12 transition-all duration-300 w-48 ${
                                        activeTab === 'general'
                                            ? 'bg-gradient-to-r  from-blue-800 to-blue-900 text-white shadow-xl'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaFile className="inline mr-3" />
                                    General Files
                                </button>
                                
                                <button
                                    onClick={() => setActiveTab('employee')}
                                    className={`px-10 py-4 rounded-lg font-bold text-xl h-12 transition-all duration-300 w-48 ${
                                        activeTab === 'employee'
                                            ? 'bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-xl'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                >
                                    <FaUserTie className="inline mr-3" />
                                    Employee Files
                                </button>
                            </div>
                            <br />
                        </div>
                        <br />
                    </div>

                    {activeTab === 'general' ? (
                        <div className="space-y-12">
                            <br />
                            {/* General File Upload Section */}
                            <div className="bg-white/90 backdrop-blur-sm p-12 rounded-4xl shadow-2xl border border-white/50">
                            <br />
                                <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center"><br />
                                    <FaUpload className="mr-4 text-blue-800" />
                                    &nbsp;Upload General Files
                                </h2>
                                <br />
                                
                                <div
                                    className={`border-3 border-dashed rounded-3xl p-16 text-center transition-all duration-300 ${
                                        dragActive 
                                            ? 'border-blue-800 bg-blue-50 scale-105' 
                                            : 'border-gray-300 bg-gray-50 hover:border-blue-600 hover:bg-blue-50/50'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <div className="space-y-6">
                                        <br />
                                        
                                        {selectedFile ? (
                                            <div className="space-y-3">
                                                <br />
                                                <p className="text-2xl font-bold text-gray-800">{selectedFile.name}</p>
                                                <p className="text-lg text-gray-600">{formatFileSize(selectedFile.size)}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <br />
                                                <p className="text-2xl font-bold text-gray-700">Drag and drop your files here</p>
                                                <p className="text-lg text-gray-500">or click the button below to browse</p>
                                            </div>
                                        )}
                                        
                                        <label className="inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-lg w-36 h-12  cursor-pointer hover:from-blue-900 hover:to-indigo-900 transition-all duration-300 transform hover:scale-105 shadow-xl text-lg font-bold">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                            <FaFile className="mr-3" />
                                            Choose File
                                        </label>
                                        <br /><br />
                                    </div>
                                    <br />
                                </div><br />
                                
                                {selectedFile && (
                                    <div className="mt-10 text-center">
                                        <br />
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploadMutation.isPending}
                                            className="inline-flex items-center justify-center space-x-4 px-12 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xl rounded-lg w-40 h-12 shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {uploadMutation.isPending ? (
                                                <>
                                                    <FaSpinner className="animate-spin text-2xl" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload className="text-2xl" />
                                                    <span>Upload File</span>
                                                </>
                                            )}
                                        </button>
                                        <br /><br />
                                    </div>
                                )}
                            </div><br />

                            {/* General File List Section */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-4xl shadow-2xl border border-white/50 overflow-hidden">
                                <br /><div className="p-12 border-b border-gray-200/70 bg-gradient-to-r from-blue-50 to-indigo-50">
                                    <br /><h2 className="text-3xl font-bold text-gray-800 flex items-center">
                                        <FaFolder className="mr-4 text-blue-800" />
                                        &nbsp;General Files Repository
                                    </h2>
                                    <br /><p className="text-xl text-gray-600 mt-3 ">Manage and organize your uploaded documents</p>
                                </div>
                                <br />
                                
                                <div className="p-12">
                                    <br />
                                    {filesLoading && (
                                        <div className="text-center py-20">
                                            <br />
                                            <FaSpinner className="animate-spin text-6xl text-blue-800 mx-auto mb-6" />
                                            <p className="text-xl text-gray-600">Loading files...</p>
                                            <br />
                                        </div>
                                    )}
                                    
                                    {filesError && (
                                        <div className="text-center py-20">
                                            <br />
                                            <div className="text-red-600 text-8xl mb-6">⚠️</div>
                                            <p className="text-xl text-red-600">Error fetching files. Please try again.</p>
                                            <br />
                                        </div>
                                    )}
                                    
                                    {files && files.length > 0 ? (
                                        <div className="grid gap-6">
                                            
                                            {files.map((file) => (
                                                <div key={file.id} className="flex items-center h-24 justify-between gap-6 rounded-lg border-2 border-gray-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-gray-50">
                                                    <div className="flex items-center space-x-6 flex-1 min-w-0">
                                                        <div className="text-4xl flex-shrink-0">
                                                            {getFileIcon(file.filename, file.mime_type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-gray-900 truncate text-xl">
                                                                {file.filename}
                                                            </p>
                                                            <div className="flex items-center space-x-4 text-lg text-gray-500 mt-2">
                                                                <span>{formatFileSize(file.size)}</span>
                                                                <span className="text-gray-300">•</span>
                                                                <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-4">
                                                        <a 
                                                            href={`${api.defaults.baseURL}/files/${file.id}`}
                                                            className="p-4 text-blue-800 hover:text-blue-900 hover:bg-blue-100 rounded-lg w-12 transition-all duration-300 text-xl"
                                                            title="Download"
                                                        >
                                                            <FaDownload />
                                                        </a>
                                                        <button 
                                                            onClick={() => handleDelete(file.id)}
                                                            className="p-4 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg w-12 transition-all duration-300 text-xl"
                                                            title="Delete"
                                                            disabled={deleteMutation.isPending}
                                                        >
                                                            {deleteMutation.isPending ? 
                                                                <FaSpinner className="animate-spin" /> : 
                                                                <FaTrash />
                                                            }
                                                        </button>
                                                    </div>
                                                    <br />
                                                </div>
                                            ))}
                                            <br />
                                        </div>
                                    ) : (
                                        !filesLoading && (
                                            <div className="text-center py-24">
                                                <div className="text-gray-400 text-9xl mb-8">📂</div>
                                                <h3 className="text-3xl font-bold text-gray-600 mb-4">No files uploaded yet</h3>
                                                <p className="text-xl text-gray-500">Upload your first file to get started!</p>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12"><br />
                            {/* Employee Files Header */}
                            <div className="bg-white/90 backdrop-blur-sm p-10 rounded-4xl shadow-2xl border border-white/50"><br />
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                                            <FaUserTie className="mr-4 text-blue-800" />
                                            &nbsp;Employee File Management
                                        </h2><br />
                                        <p className="text-xl text-gray-600 mt-3">Upload and manage files for specific employees</p>
                                    </div>
                                    <button
                                        onClick={() => setShowEmployeeUpload(!showEmployeeUpload)}
                                        className="flex items-center justify-center space-x-3 px-8 py-4 w-60 h-12 bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-lg shadow-xl hover:from-blue-900 hover:to-indigo-900 transition-all duration-300 transform hover:scale-105 text-lg font-bold"
                                    >
                                        <FaPlus className="text-xl" />
                                        <span>Add Employee Files</span>
                                    </button>
                                </div><br />
                            </div><br />

                            {/* Employee File Upload Form */}
                            {showEmployeeUpload && (
                                <div className="bg-white/90 backdrop-blur-sm p-12 rounded-4xl shadow-2xl border border-white/50"><br />
                                    <h3 className="text-2xl font-bold text-gray-800 mb-10">Upload Employee Files</h3>
                                    
                                    <div className="grid lg:grid-cols-2 gap-10 mb-10">
                                        <div><br />
                                            <label className="block text-lg font-bold text-gray-700 mb-4">
                                                Select Employee Range
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedRange}
                                                    onChange={(e) => {
                                                        setSelectedRange(e.target.value);
                                                        setSelectedEmployee('');
                                                    }}
                                                    className="w-full px-6 py-4 border-2 h-12 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-800 focus:border-transparent appearance-none bg-white text-lg font-medium"
                                                    disabled={employeesLoading}
                                                >
                                                    <option value="">&nbsp;Select range...</option>
                                                    {getRangeOptions().map(range => (
                                                        <option key={range} value={range}>
                                                            Employees {range}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FaChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none text-xl" />
                                            </div>
                                        </div>

                                        <div><br />
                                            <label className="block text-lg font-bold text-gray-700 mb-4">
                                                &nbsp;Select Employee
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedEmployee}
                                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                                    className="w-full px-6 py-4 border-2 h-12 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-800 focus:border-transparent appearance-none bg-white text-lg font-medium"
                                                    disabled={!selectedRange}
                                                >
                                                    <option value="">&nbsp;Select employee...</option>
                                                    {getEmployeesForRange().map(employee => (
                                                        <option key={employee.employee_id} value={employee.employee_id}>
                                                            {employee.employee_id} - {employee.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <FaChevronDown className="absolute right-4 top-5 text-gray-400 pointer-events-none text-xl" />
                                            </div>
                                        </div>
                                    </div><br />

                                    <div className="mb-10">
                                        <label className="block text-lg font-bold text-gray-700 mb-4">
                                            Select Files (Multiple files allowed)
                                        </label><br />
                                        <div
                                            className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                                                dragActive 
                                                    ? 'border-blue-800 bg-blue-50' 
                                                    : 'border-gray-300 bg-gray-50 hover:border-blue-600'
                                            }`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            <div className="space-y-6"><br />
                                                
                                                {selectedEmployeeFiles.length > 0 ? (
                                                    <div className="space-y-4">
                                                        <p className="text-2xl font-bold text-gray-800">
                                                            {selectedEmployeeFiles.length} file(s) selected
                                                        </p>
                                                        <div className="text-lg text-gray-600 max-h-40 overflow-y-auto bg-white rounded-xl p-4 border">
                                                            {selectedEmployeeFiles.map((file, index) => (
                                                                <div key={index} className="flex justify-between items-center py-2">
                                                                    <span className="font-medium">{file.name}</span>
                                                                    <span className="text-gray-500">{formatFileSize(file.size)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <br />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        <p className="text-2xl font-bold text-gray-700">Drop files here or click to browse</p>
                                                        <p className="text-lg text-gray-500">Multiple files can be selected at once</p>
                                                        <br />
                                                    </div>
                                                )}
                                                
                                                <label className="inline-flex items-center justify-center w-40 px-10 py-4 bg-gradient-to-r from-blue-800 to-blue-900 text-white rounded-lg cursor-pointer hover:from-blue-900 hover:to-indigo-900 transition-all duration-300 transform hover:scale-105 shadow-xl text-lg font-bold">
                                                    <input
                                                        type="file"
                                                        multiple
                                                        onChange={handleEmployeeFilesChange}
                                                        className="hidden"
                                                    />
                                                    <FaFile className="mr-3" />
                                                    Choose Files
                                                </label>
                                            </div>
                                            <br />
                                        </div><br />
                                    </div>

                                    <div className="flex justify-end space-x-6">
                                        <button
                                            onClick={() => setShowEmployeeUpload(false)}
                                            className="inline-flex items-center justify-center px-8 py-4 border-2 w-40 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 text-lg font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleEmployeeFilesUpload}
                                            disabled={!selectedEmployee || selectedEmployeeFiles.length === 0 || uploadEmployeeFilesMutation.isPending}
                                            className="inline-flex items-center justify-center space-x-4 px-8 py-4 w-40 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-lg rounded-lg shadow-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {uploadEmployeeFilesMutation.isPending ? (
                                                <>
                                                    <FaSpinner className="animate-spin text-xl" />
                                                    <span>Uploading...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload className="text-xl" />
                                                    <span>Upload Files</span>
                                                </>
                                            )}
                                        </button><br />
                                    </div>
                                </div>
                            )}

                            {/* Employee Files List */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-4xl shadow-2xl border border-white/50 overflow-hidden">
                                <div className="p-12 border-b border-gray-200/70 bg-gradient-to-r from-blue-50 to-indigo-50"><br />
                                    <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                                        <FaFolder className="mr-4 text-blue-800" />
                                        &nbsp;Employee Files Repository
                                    </h2>
                                    <p className="text-xl text-gray-600 mt-3">Browse and manage employee-specific documents</p><br />
                                </div><br />
                                
                                <div className="p-12">
                                    {employeeFilesLoading ? (
                                        <div className="text-center py-20">
                                            <FaSpinner className="animate-spin text-6xl text-blue-800 mx-auto mb-6" />
                                            <p className="text-xl text-gray-600">Loading employee files...</p>
                                        </div>
                                    ) : employeeFiles && employeeFiles.length > 0 ? (
                                        <div className="grid gap-8">
                                            {employeeFiles.map((employeeFile) => {
                                                const employee = getEmployeeById(employeeFile.employee_id);
                                                const fileCount = getEmployeeFileCount(employeeFile.employee_id)
                                                const isExpanded = viewingEmployee === employeeFile.employee_id;
                                                
                                                return (
                                                    <div key={employeeFile._id} className="border-2 border-gray-200 rounded-3xl bg-white overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                                                        {/* Employee Card Header */}
                                                        <div 
                                                            className="flex items-center justify-between p-10 cursor-pointer hover:bg-blue-50 transition-all duration-300 bg-gradient-to-r from-white to-blue-25"
                                                            onClick={() => setViewingEmployee(isExpanded ? '' : employeeFile.employee_id)}
                                                        >
                                                            <div className="flex items-center space-x-6">
                                                                <div className="w-20 h-20 bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                                    {employee?.name?.charAt(0) || employeeFile.employee_id.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                                                        &nbsp;{employee?.name || 'Unknown Employee'}
                                                                    </h3>
                                                                    <div className="flex items-center space-x-6 text-lg text-gray-600">
                                                                        <div className="flex items-center space-x-2">
                                                                             &nbsp;<span className="font-semibold">ID:</span>
                                                                            <span> &nbsp;{employeeFile.employee_id}</span>
                                                                        </div>
                                                                        <span className="text-gray-300">•</span>
                                                                        <div className="flex items-center space-x-2">
                                                                             &nbsp;<FaBuilding className="text-blue-800" />
                                                                            <span> &nbsp;{employee?.department}</span>
                                                                        </div>
                                                                        <span className="text-gray-300">•</span>
                                                                        <div className="flex items-center space-x-2">
                                                                             &nbsp;<FaFolder className="text-blue-800" />
                                                                            <span> &nbsp;{fileCount} file{fileCount !== 1 ? 's' : ''}</span>
                                                                        </div>
                                                                    </div>
                                                                    {employee?.position && (
                                                                        <p className="text-lg text-gray-500 mt-1"> &nbsp;{employee.position}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center space-x-6">
                                                                <div className="px-6 py-3 bg-blue-100 h-12 w-24 text-blue-800 rounded-lg inline-flex items-center justify-center text-lg font-bold shadow-md">
                                                                    {fileCount} files
                                                                </div>
                                                                <FaChevronDown className={`text-2xl text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>

                                                        {/* Employee Files */}
                                                        {isExpanded && (
                                                            <div className="border-t-2 border-gray-200 bg-gray-50"><br />
                                                                <div className="p-10 space-y-6">
                                                                    <h4 className="text-xl font-bold text-gray-800 mb-6"> &nbsp;Files for {employee?.name}</h4>
                                                                    {employeeFile.files.map((file) => (
                                                                        <div key={file.file_id} className="flex items-center justify-between gap-6 rounded-2xl border-2 border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-gray-50">
                                                                            <div className="flex items-center space-x-6 flex-1 min-w-0">
                                                                                <div className="text-3xl flex-shrink-0">
                                                                                    {getFileIcon(file.filename, file.mime_type)}
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="font-bold text-gray-900 truncate text-lg">
                                                                                         &nbsp;{file.filename}
                                                                                    </p>
                                                                                    <div className="flex items-center space-x-4 text-lg text-gray-500 mt-2">
                                                                                        <span> &nbsp;{formatFileSize(file.size)}</span>
                                                                                        <span className="text-gray-800"> &nbsp;• &nbsp;</span>
                                                                                        <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div className="flex items-center space-x-3">
                                                                                <a 
                                                                                    href={`${api.defaults.baseURL}/files/employee-files/${employeeFile.employee_id}/${file.file_id}`}
                                                                                    className="p-3 text-blue-800 w-16 h-12 inline-flex items-center justify-center hover:text-blue-900 hover:bg-blue-100 rounded-lg transition-all duration-300 text-xl"
                                                                                    title="Download"
                                                                                >
                                                                                    <FaDownload />
                                                                                </a>
                                                                                <button 
                                                                                    className="p-3 text-emerald-600 w-16 h-12 inline-flex items-center justify-center hover:text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all duration-300 text-xl"
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
                                                                                    className="p-3 text-red-600 w-16 h-12 inline-flex items-center justify-center hover:text-red-700 hover:bg-red-100 rounded-lg transition-all duration-300 text-xl"
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
                                        <div className="text-center py-24">
                                            <div className="text-gray-400 text-9xl mb-8">👥</div>
                                            <h3 className="text-3xl font-bold text-gray-600 mb-4">No employee files yet</h3>
                                            <p className="text-xl text-gray-500">Upload files for employees to get started!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default FileManagement;