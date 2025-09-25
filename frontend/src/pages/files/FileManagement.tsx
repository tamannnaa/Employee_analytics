import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../api/axios';
import { FaDownload, FaTrash, FaUpload, FaSpinner, FaFile, FaFileAlt, FaImage, FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa';
import Navbar from '../../components/dashboard/Navbar';

interface FileMetadata {
    id: string;
    filename: string;
    size: number;
    uploaded_at: string;
    mime_type?: string;
}

const fetchFiles = async (): Promise<FileMetadata[]> => {
    const res = await api.get('/files/list');
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

const deleteFile = async (fileId: string) => {
    const res = await api.delete(`/files/${fileId}`);
    return res.data;
};

const FileManagement: React.FC = () => {
    const queryClient = useQueryClient();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const { data: files, isLoading, isError } = useQuery<FileMetadata[], Error>({
        queryKey: ['files'],
        queryFn: fetchFiles,
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
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
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = () => {
        if (selectedFile) {
            uploadMutation.mutate(selectedFile);
        } else {
            toast.error("Please select a file to upload.");
        }
    };

    const handleDelete = (fileId: string) => {
        if (window.confirm("Are you sure you want to delete this file?")) {
            deleteMutation.mutate(fileId);
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
            return <FaImage className="text-green-500" />;
        } else if (extension === 'pdf') {
            return <FaFilePdf className="text-red-500" />;
        } else if (['doc', 'docx'].includes(extension || '')) {
            return <FaFileWord className="text-blue-500" />;
        } else if (['xls', 'xlsx'].includes(extension || '')) {
            return <FaFileExcel className="text-green-600" />;
        } else {
            return <FaFileAlt className="text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen w-[1400px]  bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-gray-800">
            <Navbar /><br /><br />
            {/* Main content container: centered, with responsive padding and max-width */}
            <main className="mx-auto max-w-8xl px-4 py-8 pt-24 sm:px-6 sm:pt-28 md:pl-72 lg:px-8">
                <div className="mb-10 sm:mb-14">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-center bg-gradient-to-r from-blue-600 to-indigo-800 bg-clip-text text-transparent">
                        File Management 📁
                    </h1><br />
                    <p className="text-center text-gray-600 text-lg">Upload, organize, and manage your files with ease</p>
                </div><br />
                
                {/* File Upload Section */}
                <div className="bg-white/70 backdrop-blur-sm p-6 sm:p-8 rounded-3xl shadow-xl mb-10 sm:mb-14 border border-white/20">
                    <br /><h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">Upload New File</h2>
                    <br />
                    {/* Drag and Drop Zone */}
                    <div
                        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-300 ${
                            dragActive 
                                ? 'border-indigo-500 bg-indigo-50 scale-105' 
                                : 'border-gray-300 bg-gray-50 hover:border-indigo-400 hover:bg-indigo-50/50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    ><br />
                        <div className="p-8 space-y-4"><br />
                            <div className="text-4xl sm:text-5xl text-indigo-400 mx-auto">
                                {selectedFile ? <FaFile /> : <FaUpload />}
                            </div><br />
                            
                            {selectedFile ? (
                                <div className="space-y-1">
                                    <p className="text-lg font-medium text-gray-800">{selectedFile.name}</p>
                                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p><br />
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <p className="text-lg font-medium text-gray-700">Drag and drop your file here</p>
                                    <p className="text-sm text-gray-500">or click to browse</p>
                                    <br />
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
                        <br />
                    </div>
                    <br />
                    {/* Upload Button */}
                    {selectedFile && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={handleUpload}
                                disabled={uploadMutation.isPending}
                                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                <br />

                {/* File List Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                    <br /><div className="p-6 sm:p-8 border-b border-gray-200/50">
                        <br /><h2 className="text-xl sm:text-2xl font-bold text-gray-800">Your Files</h2>
                        <br /><p className="text-gray-600 mt-1">Manage and organize your uploaded files</p>
                    <br /></div>
                    
                    <div className="p-6 sm:p-8">
                        {isLoading && (
                            <div className="text-center py-12">
                                <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Loading files...</p>
                            </div>
                        )}
                        
                        {isError && (
                            <div className="text-center py-12">
                                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                <p className="text-red-500 text-lg">Error fetching files. Please try again.</p>
                            </div>
                        )}
                        
                        {files && files.length > 0 ? (
                            <div className="space-y-4">
                                {files.map((file) => (
                                    <div key={file.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:bg-slate-50">
                                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                                            <div className="text-3xl flex-shrink-0 text-slate-500">
                                                {getFileIcon(file.filename, file.mime_type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate text-base sm:text-lg">
                                                    {file.filename}
                                                </p>
                                                <div className="flex items-center space-x-3 text-xs sm:text-sm text-gray-500 mt-1">
                                                    <span>{formatFileSize(file.size)}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2 ml-2">
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
                            !isLoading && (
                                <div className="text-center py-16">
                                    <div className="text-gray-400 text-7xl sm:text-8xl mb-6">📂</div>
                                    <h3 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2">No files yet</h3>
                                    <p className="text-gray-500 text-base sm:text-lg">Upload your first file to get started!</p>
                                </div>
                            )
                        )}
                    </div>
                    <br />
                </div>
            </main>
        </div>
    );
};

export default FileManagement;