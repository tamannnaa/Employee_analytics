import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../api/axios';
import { FaDownload, FaTrash, FaSpinner, FaPlusCircle, FaChartBar, FaFileExcel, FaClock, FaCheck, FaExclamationTriangle, FaShare, FaCalendarAlt } from 'react-icons/fa';
import Navbar from '../../components/dashboard/Navbar';
import { Link } from 'react-router-dom';

interface ReportTemplate {
    id: string;
    name: string;
    description: string;
}

interface GeneratedReport {
    _id: string;
    template_id: string;
    template_name: string;
    status: string;
    created_at: string;
    file_name: string;
    file_path: string;
    generated_at?: string;
    message?: string;
    shared_with?: string[];
    shared_at?: string;
}

interface ScheduledReport {
    _id: string;
    template_id: string;
    template_name: string;
    frequency: string;
    recipients: string[];
    next_run: string;
    is_active: boolean;
    created_at: string;
}

// API Functions
const fetchTemplates = async (): Promise<ReportTemplate[]> => {
    const res = await api.get('/reports/templates');
    return res.data;
};

const fetchReportHistory = async (): Promise<GeneratedReport[]> => {
    const res = await api.get('/reports/history');
    return res.data;
};

const fetchScheduledReports = async (): Promise<ScheduledReport[]> => {
    const res = await api.get('/reports/schedules');
    return res.data;
};

const generateReport = async (templateId: string, filters?: any) => {
    const res = await api.post('/reports/generate', { 
        template_id: templateId,
        filters: filters 
    });
    return res.data;
};

const deleteReport = async (reportId: string) => {
    const res = await api.delete(`/reports/${reportId}`);
    return res.data;
};

const shareReport = async (reportId: string, recipients: string[]) => {
    const res = await api.put(`/reports/${reportId}/share`, { recipients });
    return res.data;
};

const scheduleReport = async (data: {
    template_id: string;
    frequency: string;
    recipients: string[];
    filters?: any;
}) => {
    const res = await api.post('/reports/schedule', data);
    return res.data;
};

const deleteSchedule = async (scheduleId: string) => {
    const res = await api.delete(`/reports/schedules/${scheduleId}`);
    return res.data;
};

const ReportingSystem: React.FC = () => {
    const queryClient = useQueryClient();
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState<string>('');
    const [shareRecipients, setShareRecipients] = useState<string>('');
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [scheduleFrequency, setScheduleFrequency] = useState<string>('weekly');
    const [scheduleRecipients, setScheduleRecipients] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'reports' | 'scheduled'>('reports');

    // Queries
    const { data: templates, isLoading: isLoadingTemplates, isError: isErrorTemplates } = useQuery<ReportTemplate[], Error>({
        queryKey: ['reportTemplates'],
        queryFn: fetchTemplates,
    });
    
    const { data: history, isLoading: isLoadingHistory, isError: isErrorHistory } = useQuery<GeneratedReport[], Error>({
        queryKey: ['reportHistory'],
        queryFn: fetchReportHistory,
        refetchInterval: 5000,
    });

    const { data: scheduledReports, isLoading: isLoadingScheduled, isError: isErrorScheduled } = useQuery<ScheduledReport[], Error>({
        queryKey: ['scheduledReports'],
        queryFn: fetchScheduledReports,
    });

    // Mutations
    const generateMutation = useMutation({
        mutationFn: ({ templateId, filters }: { templateId: string; filters?: any }) => 
            generateReport(templateId, filters),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reportHistory'] });
            toast.success("Report generation started! Check history for status.");
            setGeneratingId(null);
        },
        onError: (error: any) => {
            toast.error(`Report generation failed: ${error.response?.data?.detail || error.message}`);
            setGeneratingId(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reportHistory'] });
            toast.success("Report deleted successfully!");
        },
        onError: (error: any) => {
            toast.error(`Deletion failed: ${error.response?.data?.detail || error.message}`);
        },
    });

    const shareMutation = useMutation({
        mutationFn: ({ reportId, recipients }: { reportId: string; recipients: string[] }) =>
            shareReport(reportId, recipients),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reportHistory'] });
            toast.success("Report shared successfully!");
            setShareModalOpen(false);
            setShareRecipients('');
        },
        onError: (error: any) => {
            toast.error(`Sharing failed: ${error.response?.data?.detail || error.message}`);
        },
    });

    const scheduleMutation = useMutation({
        mutationFn: scheduleReport,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
            toast.success("Report scheduled successfully!");
            setScheduleModalOpen(false);
            setScheduleRecipients('');
        },
        onError: (error: any) => {
            toast.error(`Scheduling failed: ${error.response?.data?.detail || error.message}`);
        },
    });

    const deleteScheduleMutation = useMutation({
        mutationFn: deleteSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scheduledReports'] });
            toast.success("Scheduled report deleted successfully!");
        },
        onError: (error: any) => {
            toast.error(`Failed to delete schedule: ${error.response?.data?.detail || error.message}`);
        },
    });

    // Event handlers
    const handleGenerate = (templateId: string) => {
        setGeneratingId(templateId);
        generateMutation.mutate({ templateId });
    };

    const handleDelete = (reportId: string) => {
        if (window.confirm("Are you sure you want to delete this report?")) {
            deleteMutation.mutate(reportId);
        }
    };

    const handleShare = (reportId: string) => {
        setSelectedReportId(reportId);
        setShareModalOpen(true);
    };

    const handleSchedule = (templateId: string) => {
        setSelectedTemplateId(templateId);
        setScheduleModalOpen(true);
    };

    const handleShareSubmit = () => {
        const recipients = shareRecipients.split(',').map(email => email.trim()).filter(Boolean);
        if (recipients.length === 0) {
            toast.error("Please enter at least one recipient email");
            return;
        }
        shareMutation.mutate({ reportId: selectedReportId, recipients });
    };

    const handleScheduleSubmit = () => {
        const recipients = scheduleRecipients.split(',').map(email => email.trim()).filter(Boolean);
        if (recipients.length === 0) {
            toast.error("Please enter at least one recipient email");
            return;
        }
        scheduleMutation.mutate({
            template_id: selectedTemplateId,
            frequency: scheduleFrequency,
            recipients
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return <FaCheck className="text-green-500" />;
            case 'generating':
                return <FaSpinner className="animate-spin text-blue-500" />;
            case 'queued':
                return <FaClock className="text-yellow-500" />;
            case 'failed':
                return <FaExclamationTriangle className="text-red-500" />;
            default:
                return <FaClock className="text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'generating':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'queued':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'failed':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br w-[1500px] flex flex-col justify-center items-center from-slate-50 to-blue-50 font-sans text-gray-800">
            <Navbar />
            <div className="p-4  sm:p-6 lg:p-8 md:pl-72  pt-20 sm:pt-24 max-w-8xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
                    <div><br />
                        <h1 className="text-2xl h-16 sm:text-4xl lg:text-5xl pb-4 font-bold bg-gradient-to-r from-blue-800 to-blue-950 bg-clip-text text-transparent">
                            Reporting System
                        </h1>
                        <br />
                        <p className="text-gray-600 text-xl mt-2">Generate and manage your business reports</p>
                    </div>

                    <Link
                        to="/reports/custom-builder"
                        className="inline-flex h-10 w-60 items-center space-x-3 px-8 py-3 bg-gradient-to-r from-blue-800 to-blue-950 text-white font-semibold rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-blue-950 hover:to-blue-950"
                    >

                        &nbsp;&nbsp;<FaPlusCircle className="text-2xl" />
                        &nbsp;&nbsp;<span>Build Custom Reports</span>
                    </Link>
                    
                </div>
                <br />

                {/* Report Templates Section */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl mb-8 sm:mb-12 border border-white/20 overflow-hidden">
                    <div className="p-6 sm:p-8 border-b border-gray-200/50">
                        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 flex items-center gap-3">
                            <br />
                            <FaChartBar className="text-blue-900" />
                            Report Templates
                        </h2>
                        <br />
                        <p className="text-gray-600 text-lg mt-2">Choose from pre-built report templates</p><br />
                    </div>
                    
                    <div className="p-6 sm:p-8">
                        {isLoadingTemplates && (
                            <div className="text-center py-12">
                                <FaSpinner className="animate-spin text-4xl text-blue-800 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Loading templates...</p>
                            </div>
                        )}
                        
                        {isErrorTemplates && (
                            <div className="text-center py-12">
                                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                <p className="text-red-500 text-lg">Error loading templates. Please try again.</p>
                            </div>
                        )}
                        
                        {templates && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {templates.map((template) => (
                                    <div key={template.id} className="bg-white rounded-2xl p-6 shadow-md border h-60  border-gray-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] flex flex-col">
                                        <br /><div className="flex items-center gap-3 mb-4">
                                            <br /><div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                                                <FaFileExcel className="text-2xl text-blue-900" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-800 flex-1">
                                                {template.name}
                                            </h3>
                                        </div>
                                        
                                       <br /> <p className="text-gray-600 flex-grow mb-6 leading-relaxed">
                                            {template.description}
                                        </p>
                                        
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleGenerate(template.id)}
                                                disabled={generatingId === template.id || generateMutation.isPending}
                                                className="flex-1 inline-flex items-center h-10 justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-800 to-blue-950 text-white rounded-xl font-semibold shadow-md hover:from-blue-950 hover:to-blue-950 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                {generatingId === template.id ? (
                                                    <>
                                                        <FaSpinner className="animate-spin" />
                                                        <span>Generating...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaChartBar />
                                                        <span >&nbsp;&nbsp;Generate</span>
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleSchedule(template.id)}
                                                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300"
                                                title="Schedule Report"
                                            >
                                                <FaCalendarAlt />
                                            </button>
                                            <br />
                                        </div><br />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div><br /><br />

                {/* Tab Navigation */}
                <div className="mb-6">
                    
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <br /><br />
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`px-6 py-3  rounded-lg font-medium transition-all duration-200 ${
                                activeTab === 'reports'
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Generated Reports 
                        </button>&nbsp;&nbsp;
                        <button
                            onClick={() => setActiveTab('scheduled')}
                            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                                activeTab === 'scheduled'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            Scheduled Reports
                        </button> &nbsp;&nbsp;
                    </div>
                </div>
                <br />
                {/* Report History Section */}
                {activeTab === 'reports' && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                        <div className="p-6 sm:p-8 border-b border-gray-200/50">
                            <br /><h2 className="text-2xl sm:text-2xl font-bold text-blue-900 flex items-center gap-3">
                                <br /><FaClock className="text-blue-900" />
                                Report History
                            </h2><br />
                            <p className="text-gray-600 mt-2">Track and download your generated reports</p><br />
                        </div><br />
                        
                        <div className="p-6  sm:p-8">
                            {isLoadingHistory && (
                                <div className="text-center  py-12">
                                    <br /><br /><FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Loading report history...</p>
                                </div>
                            )}
                            
                            {isErrorHistory && (
                                <div className="text-center py-12">
                                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                    <p className="text-red-500 text-lg">Error loading history. Please try again.</p>
                                </div>
                            )}
                            
                            {history && history.length > 0 ? (
                                <div className=" ml-20 space-y-4">
                                    {history.map((report) => (
                                        <div key={report._id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                   <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                                                        <FaFileExcel className="text-2xl text-blue-600" />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-semibold text-gray-900 text-lg truncate">
                                                                {report.template_name || report.file_name || `Report ${report._id.slice(0, 8)}`}
                                                            </h3>
                                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(report.status)}`}>
                                                                {getStatusIcon(report.status)}
                                                                <span className="capitalize">{report.status}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                                                            <span>Created: {formatDate(report.created_at)}</span>
                                                            {report.generated_at && (
                                                                <>
                                                                    <span className="hidden sm:inline">•</span>
                                                                    <span>Completed: {formatDate(report.generated_at)}</span>
                                                                </>
                                                            )}
                                                            {report.shared_at && (
                                                                <>
                                                                    <span className="hidden sm:inline">•</span>
                                                                    <span className="text-green-600">Shared with {report.shared_with?.length || 0} recipients</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        
                                                        {report.message && report.status.toLowerCase() === 'failed' && (
                                                            <p className="text-red-500 text-sm mt-2 bg-red-50 px-3 py-2 rounded-lg">
                                                                {report.message}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-3">
                                                    {report.status.toLowerCase() === 'completed' && (
                                                        <>
                                                            <a 
                                                                href={`${api.defaults.baseURL}/reports/${report._id}/download`}
                                                                className="inline-flex items-center gap-2 px-4 py-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                                                                title="Download Report"
                                                            >
                                                                <FaDownload />
                                                                <span className="hidden sm:inline">Download</span>
                                                                <br />
                                                            </a>
                                                            <button
                                                                onClick={() => handleShare(report._id)}
                                                                className="inline-flex items-center gap-2 px-4 py-2 text-green-500 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all duration-300 font-medium"
                                                                title="Share Report"
                                                            >
                                                                <FaShare />
                                                                <span className="hidden sm:inline">Share</span>
                                                                <br />
                                                            </button>
                                                        </>
                                                    )}
                                                    
                                                    <button 
                                                        onClick={() => handleDelete(report._id)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium"
                                                        title="Delete Report"
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        {deleteMutation.isPending ? (
                                                            <FaSpinner className="animate-spin" />
                                                        ) : (
                                                            <FaTrash />
                                                        )}
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !isLoadingHistory && (
                                    <div className="text-center py-16">
                                        <div className="text-gray-400 text-8xl mb-6">📊</div>
                                        <h3 className="text-2xl font-semibold text-gray-600 mb-2">No reports generated yet</h3>
                                        <p className="text-gray-500 text-lg">Generate your first report using the templates above!</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Scheduled Reports Section */}
                {activeTab === 'scheduled' && (
                    <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                        <div className="p-6 sm:p-8 border-b border-gray-200/50">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-3">
                                <FaCalendarAlt className="text-indigo-500" />
                                Scheduled Reports
                            </h2>
                            <p className="text-gray-600 mt-2">Manage your recurring report schedules</p>
                        </div>
                        
                        <div className="p-6 sm:p-8">
                            {isLoadingScheduled && (
                                <div className="text-center py-12">
                                    <FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Loading scheduled reports...</p>
                                </div>
                            )}
                            
                            {isErrorScheduled && (
                                <div className="text-center py-12">
                                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                                    <p className="text-red-500 text-lg">Error loading schedules. Please try again.</p>
                                </div>
                            )}
                            
                            {scheduledReports && scheduledReports.length > 0 ? (
                                <div className="space-y-4">
                                    {scheduledReports.map((schedule) => (
                                        <div key={schedule._id} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-center space-x-4 flex-1 min-w-0">
                                                    <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                                                        <FaCalendarAlt className="text-2xl text-purple-600" />
                                                    </div>
                                                    
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-semibold text-gray-900 text-lg truncate">
                                                                {schedule.template_name}
                                                            </h3>
                                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                                                                schedule.is_active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'
                                                            }`}>
                                                                <span className="capitalize">{schedule.frequency}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                                                            <span>Next run: {formatDate(schedule.next_run)}</span>
                                                            <span className="hidden sm:inline">•</span>
                                                            <span>{schedule.recipients.length} recipients</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center space-x-3">
                                                    <button 
                                                        onClick={() => deleteScheduleMutation.mutate(schedule._id)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium"
                                                        title="Delete Schedule"
                                                        disabled={deleteScheduleMutation.isPending}
                                                    >
                                                        {deleteScheduleMutation.isPending ? (
                                                            <FaSpinner className="animate-spin" />
                                                        ) : (
                                                            <FaTrash />
                                                        )}
                                                        <span className="hidden sm:inline">Delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !isLoadingScheduled && (
                                    <div className="text-center py-16">
                                        <div className="text-gray-400 text-8xl mb-6">📅</div>
                                        <h3 className="text-2xl font-semibold text-gray-600 mb-2">No scheduled reports</h3>
                                        <p className="text-gray-500 text-lg">Schedule reports to generate them automatically!</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Share Modal */}
                {shareModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Share Report</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Recipients (comma-separated)
                                </label>
                                <textarea
                                    value={shareRecipients}
                                    onChange={(e) => setShareRecipients(e.target.value)}
                                    placeholder="email1@example.com, email2@example.com"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShareModalOpen(false);
                                        setShareRecipients('');
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleShareSubmit}
                                    disabled={shareMutation.isPending}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {shareMutation.isPending ? 'Sharing...' : 'Share'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Modal */}
                {scheduleModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Schedule Report</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Frequency
                                </label>
                                <select
                                    value={scheduleFrequency}
                                    onChange={(e) => setScheduleFrequency(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Recipients (comma-separated)
                                </label>
                                <textarea
                                    value={scheduleRecipients}
                                    onChange={(e) => setScheduleRecipients(e.target.value)}
                                    placeholder="email1@example.com, email2@example.com"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setScheduleModalOpen(false);
                                        setScheduleRecipients('');
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleScheduleSubmit}
                                    disabled={scheduleMutation.isPending}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportingSystem;