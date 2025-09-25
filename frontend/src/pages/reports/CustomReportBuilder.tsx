import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios'; // Added for type safety
import { api } from '../../api/axios';
import { 
    FaChartPie, FaFilter, FaSave, FaDownload, FaSpinner, FaPlus, FaTrash, 
    FaUser, FaDollarSign, FaBuilding, FaCalendar, FaStar, FaCheck, FaExclamationTriangle
} from 'react-icons/fa';
import Navbar from '../../components/dashboard/Navbar';

interface FilterCondition {
    field: string;
    operator: string;
    value: string;
}

interface CustomReportConfig {
    name: string;
    description: string;
    selectedFields: string[];
    filters: FilterCondition[];
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    includeCharts: boolean;
    format: 'xlsx' | 'csv';
}

interface SavedReport {
    id: string;
    name: string;
    description: string;
    config: CustomReportConfig;
    created_at: string;
}

interface ReportStatus {
    report_id: string;
    status: 'Queued' | 'Generating' | 'Completed' | 'Failed';
    message?: string;
    file_name?: string;
}

const availableFields = [
    { key: 'employee_id', label: 'Employee ID', icon: FaUser, category: 'Basic' },
    { key: 'name', label: 'Full Name', icon: FaUser, category: 'Basic' },
    { key: 'email', label: 'Email', icon: FaUser, category: 'Basic' },
    { key: 'phone', label: 'Phone', icon: FaUser, category: 'Basic' },
    { key: 'department', label: 'Department', icon: FaBuilding, category: 'Work' },
    { key: 'position', label: 'Position', icon: FaBuilding, category: 'Work' },
    { key: 'salary', label: 'Salary', icon: FaDollarSign, category: 'Compensation' },
    { key: 'join_date', label: 'Join Date', icon: FaCalendar, category: 'Work' },
    { key: 'performance_score', label: 'Performance Score', icon: FaStar, category: 'Performance' },
    { key: 'is_active', label: 'Status', icon: FaUser, category: 'Basic' },
    { key: 'address', label: 'Address', icon: FaUser, category: 'Personal' },
    { key: 'skills', label: 'Skills', icon: FaStar, category: 'Performance' },
];

const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'between', label: 'Between' },
    { value: 'in', label: 'In List' }
];

const fieldCategories = ['All', 'Basic', 'Work', 'Compensation', 'Performance', 'Personal'];

const CustomReportBuilder: React.FC = () => {
    const queryClient = useQueryClient();
    const [config, setConfig] = useState<CustomReportConfig>({
        name: '',
        description: '',
        selectedFields: [],
        filters: [],
        sortBy: 'name',
        sortOrder: 'asc',
        includeCharts: true,
        format: 'xlsx'
    });
    const [activeCategory, setActiveCategory] = useState('All');
    const [previewData, setPreviewData] = useState<Record<string, any>[] | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [currentReportStatus, setCurrentReportStatus] = useState<ReportStatus | null>(null);

    // Fetch saved templates
    const { data: savedReports, isLoading: isLoadingReports } = useQuery<SavedReport[], Error>({
        queryKey: ['customReportTemplates'],
        queryFn: async () => {
            const res = await api.get('/reports/custom/saved');
            return res.data;
        },
    });

    // Generate report mutation
    const generateMutation = useMutation({
        mutationFn: async (reportConfig: CustomReportConfig) => {
            const res = await api.post('/reports/custom/generate', reportConfig);
            return res.data;
        },
        onSuccess: (data) => {
            toast.success("Custom report generation queued successfully!");
            pollReportStatus(data.report_id);
        },
        // FIX: Replaced 'any' with 'unknown' for type safety
        onError: (error: unknown) => {
            let message = "Report generation failed";
            if (error instanceof AxiosError && error.response?.data?.detail) {
                message = `${message}: ${error.response.data.detail}`;
            } else if (error instanceof Error) {
                message = `${message}: ${error.message}`;
            }
            toast.error(message);
        },
    });

    // Save report template mutation
    const saveMutation = useMutation({
        mutationFn: async (reportData: { name: string; description: string; config: CustomReportConfig }) => {
            const res = await api.post('/reports/custom/save', reportData);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Report template saved successfully!");
            queryClient.invalidateQueries({ queryKey: ['customReportTemplates'] });
            setShowSaveModal(false);
        },
        // FIX: Replaced 'any' with 'unknown' for type safety
        onError: (error: unknown) => {
            let message = "Save failed";
            if (error instanceof AxiosError && error.response?.data?.detail) {
                message = `${message}: ${error.response.data.detail}`;
            } else if (error instanceof Error) {
                message = `${message}: ${error.message}`;
            }
            toast.error(message);
        },
    });

    // Preview data mutation
    const previewMutation = useMutation({
        mutationFn: async (reportConfig: CustomReportConfig) => {
            const res = await api.post('/reports/custom/preview', { 
                selectedFields: reportConfig.selectedFields,
                filters: reportConfig.filters,
                sortBy: reportConfig.sortBy,
                sortOrder: reportConfig.sortOrder,
                limit: 10 
            });
            return res.data;
        },
        onSuccess: (data) => {
            setPreviewData(data);
            toast.success("Preview loaded successfully!");
        },
        // FIX: Replaced 'any' with 'unknown' for type safety
        onError: (error: unknown) => {
            let message = "Preview failed";
            if (error instanceof AxiosError && error.response?.data?.detail) {
                message = `${message}: ${error.response.data.detail}`;
            } else if (error instanceof Error) {
                message = `${message}: ${error.message}`;
            }
            toast.error(message);
        },
    });

    // Function to trigger file download
    const downloadFile = async (reportId: string, filename: string) => {
        try {
            const response = await api.get(`/reports/custom/${reportId}/download`, {
                responseType: 'blob', // Important
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'
                }
            });
            
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename || 'custom_report.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success("Report downloaded successfully!");
        // FIX: Replaced 'any' with 'unknown' for type safety
        } catch (error) {
            console.error('Download error:', error);
            let message = "Download failed";
            if (error instanceof AxiosError && error.response?.data?.detail) {
                message = `${message}: ${error.response.data.detail}`;
            } else if (error instanceof Error) {
                message = `${message}: ${error.message}`;
            }
            toast.error(message);
        }
    };

    // Poll report status
    const pollReportStatus = async (reportId: string) => {
        const maxAttempts = 30; // 5 minutes max
        let attempts = 0;
        
        const checkStatus = async () => {
            try {
                const response = await api.get(`/reports/custom/${reportId}/status`);
                const status = response.data;
                setCurrentReportStatus(status);
                
                if (status.status === 'Completed') {
                    await downloadFile(reportId, status.file_name);
                    setCurrentReportStatus(null);
                    return;
                } else if (status.status === 'Failed') {
                    toast.error(`Report generation failed: ${status.message || 'Unknown error'}`);
                    setCurrentReportStatus(null);
                    return;
                }
                
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 10000); // Check every 10 seconds
                } else {
                    toast.error('Report generation timed out. Please check the reports history page.');
                    setCurrentReportStatus(null);
                }
            // FIX: Replaced 'any' with 'unknown' for type safety
            } catch (error) {
                console.error('Error polling report status:', error);
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 5000); // Retry in 5 seconds on error
                } else {
                    toast.error('Failed to check report status. Please check the reports history page.');
                    setCurrentReportStatus(null);
                }
            }
        };
        
        checkStatus();
    };

    const filteredFields = activeCategory === 'All' 
        ? availableFields 
        : availableFields.filter(field => field.category === activeCategory);

    const toggleField = (fieldKey: string) => {
        setConfig(prev => ({
            ...prev,
            selectedFields: prev.selectedFields.includes(fieldKey)
                ? prev.selectedFields.filter(f => f !== fieldKey)
                : [...prev.selectedFields, fieldKey]
        }));
    };

    const addFilter = () => {
        setConfig(prev => ({
            ...prev,
            filters: [...prev.filters, { field: 'name', operator: 'contains', value: '' }]
        }));
    };

    const updateFilter = (index: number, updates: Partial<FilterCondition>) => {
        setConfig(prev => ({
            ...prev,
            filters: prev.filters.map((filter, i) => 
                i === index ? { ...filter, ...updates } : filter
            )
        }));
    };

    const removeFilter = (index: number) => {
        setConfig(prev => ({
            ...prev,
            filters: prev.filters.filter((_, i) => i !== index)
        }));
    };

    const handleGenerate = () => {
        if (config.selectedFields.length === 0) {
            toast.error("Please select at least one field");
            return;
        }
        generateMutation.mutate(config);
    };

    const handleSave = () => {
        if (!config.name.trim()) {
            toast.error("Please enter a report name");
            return;
        }
        saveMutation.mutate({
            name: config.name,
            description: config.description,
            config
        });
    };

    const loadSavedReport = (savedReport: SavedReport) => {
        setConfig(savedReport.config);
        toast.success(`Loaded report template: ${savedReport.name}`);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Queued':
                return <FaSpinner className="animate-spin text-blue-500" />;
            case 'Generating':
                return <FaSpinner className="animate-spin text-yellow-500" />;
            case 'Completed':
                return <FaCheck className="text-green-500" />;
            case 'Failed':
                return <FaExclamationTriangle className="text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen w-[1500px] bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-gray-800">
            <Navbar />
            <div className="p-4 sm:p-6 lg:p-8 md:pl-72 pt-20 sm:pt-24 max-w-8xl mx-auto">
                {/* Header */}
                <br /><br /><br />
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-700 to-blue-950 bg-clip-text text-transparent mb-2">
                        Custom Report Builder <br /><br />
                    </h1>
                    <p className="text-gray-600 text-lg">Create personalized reports with your specific data requirements</p><br />
                </div><br />

                {/* Report Generation Status */}
                {currentReportStatus && (
                    <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            {getStatusIcon(currentReportStatus.status)}
                            <div>
                                <p className="font-medium text-gray-800">
                                    Report Status: {currentReportStatus.status}
                                </p>
                                {currentReportStatus.message && (
                                    <p className="text-sm text-gray-600">{currentReportStatus.message}</p>
                                )}
                                {currentReportStatus.status === 'Generating' && (
                                    <p className="text-sm text-blue-600">Please wait while your report is being generated...</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1  gap-8">
                    {/* Main Configuration Panel */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Report Info */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8"><br />
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Report Configuration</h2><br />
                            <div className="grid grid-cols-1  gap-6">
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">&nbsp;Report Name</label>
                                    &nbsp;<input
                                        type="text"
                                        value={config.name}
                                        onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-80 px-4 py-3 border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-800 focus:border-transparent"
                                        placeholder="  My Custom Report"
                                    />
                                    <br />
                                </div>
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">&nbsp;Format</label>
                                    &nbsp;<select
                                        value={config.format}
                                        onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'xlsx' | 'csv' }))}
                                        className="w-80 px-4 py-3 border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-800 focus:border-transparent"
                                    >
                                        <option value="xlsx">Excel (.xlsx)</option>
                                        <option value="csv">CSV (.csv)</option>
                                    </select>
                                </div>
                                <br />
                            </div>
                            <div className="mt-4">
                                <label className="block text-lg font-medium text-gray-700 mb-2">&nbsp;Description</label>
                                &nbsp;<textarea
                                    value={config.description}
                                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-96 px-4 py-3 border border-gray-500 rounded-md focus:ring-2 focus:ring-blue-800 focus:border-transparent"
                                    placeholder=" Brief description of this report..."
                                />
                            </div>
                            <br /><br />
                        </div><br /><br /><br />

                        {/* Field Selection */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
                            <br /><h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                &nbsp;<FaChartPie className="text-blue-800 text-2xl"  />
                                Select Fields ({config.selectedFields.length})
                            </h2><br />
                            
                            {/* Category Filter */}
                            <div className="flex flex-wrap gap-2 mb-6">
                               &nbsp; {fieldCategories.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-4 py-2 rounded-md text-lg h-8 w-40 font-medium transition-all duration-300 ${
                                            activeCategory === category
                                                ? 'bg-blue-800 text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                                <br />
                            </div>
                            <br />
                            {/* Field Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {filteredFields.map(field => {
                                    const Icon = field.icon;
                                    const isSelected = config.selectedFields.includes(field.key);
                                    return (
                                        <button
                                            key={field.key}
                                            onClick={() => toggleField(field.key)}
                                            className={`flex items-center gap-3 p-4 rounded-md border transition-all duration-300 text-left ${
                                                isSelected
                                                    ? 'bg-indigo-50 border-indigo-300 text-blue-900'
                                                    : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                                            }`}
                                        >
                                            &nbsp;<Icon className={`text-lg ${isSelected ? 'text-blue-800' : 'text-gray-400'}`} />
                                            <div>
                                                <p className="font-medium">{field.label}</p>
                                                <p className="text-xs text-gray-500">{field.category}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div><br /><br />
                        </div><br /><br />

                        {/* Filters */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                    <FaFilter className="text-blue-800" />
                                    Filters ({config.filters.length})
                                </h2>
                                <button
                                    onClick={addFilter}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 w-32 h-10 text-white rounded-md hover:bg-blue-950 transition-colors"
                                >
                                    &nbsp;<FaPlus />
                                    Add Filter
                                </button>&nbsp;
                            </div><br /><br />

                            {config.filters.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No filters applied. Click "Add Filter" to add conditions.
                                    <br/><br />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {config.filters.map((filter, index) => (
                                        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                                <div><br />
                                                    <label className="block text-lg font-medium text-gray-700 mb-2">Field</label>
                                                    <select
                                                        value={filter.field}
                                                        onChange={(e) => updateFilter(index, { field: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        {availableFields.map(field => (
                                                            <option key={field.key} value={field.key}>{field.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-lg font-medium text-gray-700 mb-2">Operator</label>
                                                    <select
                                                        value={filter.operator}
                                                        onChange={(e) => updateFilter(index, { operator: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    >
                                                        {operators.map(op => (
                                                            <option key={op.value} value={op.value}>{op.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-lg font-medium text-gray-700 mb-2">Value</label>
                                                    <input
                                                        type="text"
                                                        value={filter.value}
                                                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                        placeholder=" Enter value..."
                                                    />
                                                </div>
                                                <div>
                                                    <button
                                                        onClick={() => removeFilter(index)}
                                                        className="w-full px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                                <br /><br />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <br />
                        </div><br />

                        {/* Sorting & Options */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8"><br />
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Sorting & Options</h2><br />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">&nbsp;Sort By</label>
                                    <select
                                        value={config.sortBy}
                                        onChange={(e) => setConfig(prev => ({ ...prev, sortBy: e.target.value }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        {availableFields.map(field => (
                                            <option key={field.key} value={field.key}>&nbsp;{field.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-lg font-medium text-gray-700 mb-2">&nbsp;Sort Order</label>
                                    <select
                                        value={config.sortOrder}
                                        onChange={(e) => setConfig(prev => ({ ...prev, sortOrder: e.target.value as 'asc' | 'desc' }))}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    >
                                        <option value="asc">&nbsp;Ascending</option>
                                        <option value="desc">&nbsp;Descending</option>
                                    </select>
                                </div>
                            </div>
                            <br />
                            <div className="mt-6">
                                <label className="flex items-center gap-3">
                                    &nbsp;<input
                                        type="checkbox"
                                        checked={config.includeCharts}
                                        onChange={(e) => setConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="text-md font-medium text-gray-700">Include Charts and Visualizations</span>
                                </label>
                            </div>
                            <br /><br />
                        </div>
                    
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6"><br />
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Actions</h3><br />
                            <div className="space-y-3">
                                <button
                                    onClick={() => previewMutation.mutate(config)}
                                    disabled={config.selectedFields.length === 0 || previewMutation.isPending}
                                    className="w-40  h-8 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    &nbsp;{previewMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaChartPie />}
                                    Preview Data
                                </button>&nbsp;
                                
                                <button
                                    onClick={handleGenerate}
                                    disabled={config.selectedFields.length === 0 || generateMutation.isPending || currentReportStatus !== null}
                                    className="w-56 h-8 inline-flex items-center justify-center gap-2 px-4 py-3 bg-green-800 text-white rounded-md hover:bg-green-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    &nbsp;{generateMutation.isPending || currentReportStatus ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                                    {generateMutation.isPending || currentReportStatus ? 'Generating...' : 'Generate Report'}
                                </button>&nbsp;
                                
                                <button
                                    onClick={() => setShowSaveModal(true)}
                                    disabled={!config.name.trim() || saveMutation.isPending}
                                    className="w-52 h-8 inline-flex items-center justify-center gap-2 px-4 py-3 bg-purple-800 text-white rounded-md hover:bg-purple-900 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    &nbsp;{saveMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
                                    Save Template
                                </button>
                                <br /><br />
                            </div>
                            <br />
                        </div>
                        <br /><br />

                        {/* Saved Templates */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Saved Templates</h3><br /><br />
                            {isLoadingReports ? (
                                <div className="text-center py-4">
                                    &nbsp;<FaSpinner className="animate-spin text-2xl text-indigo-500 mx-auto" />
                                </div>
                            ) : savedReports && savedReports.length > 0 ? (
                                <div className="space-y-3">
                                    {savedReports.map(report => (
                                        <button
                                            key={report.id}
                                            onClick={() => loadSavedReport(report)}
                                            className="w-full text-left p-3 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                                        >
                                            <p className="font-lg text-gray-800">{report.name}</p><br />
                                            <p className="text-md text-gray-500 truncate">{report.description}</p><br />
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No saved templates yet.</p>
                            )}
                        </div><br /><br />

                        {/* Preview Data */}
                        {previewData && (
                            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
                                <h3 className="text-2xl font-bold text-gray-800 mb-4">Preview (First 10 rows)</h3><br />
                                <div className="overflow-x-auto">
                                    <table className="w-full text-lg">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                {config.selectedFields.slice(0, 3).map(field => (
                                                    <th key={field} className="px-2 py-2 text-left font-medium text-gray-700">
                                                        {availableFields.find(f => f.key === field)?.label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                             {previewData.slice(0, 5).map((row, index) => (
                                                <tr key={index} className="border-b border-gray-100">
                                                    {config.selectedFields.slice(0, 3).map(field => (
                                                        <td key={field} className="px-2 py-2 text-gray-600 truncate max-w-20">
                                                            {typeof row[field] === 'object' ? JSON.stringify(row[field]) : String(row[field] || '')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div><br />
                                <p className="text-lg text-gray-500 mt-2">
                                    Showing {Math.min(5, previewData.length)} of {previewData.length} rows, first 3 columns
                                </p><br />
                            </div>
                        )}
                    </div>
                    <br />
                </div>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Save Report Template</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                                <input
                                    type="text"
                                    value={config.name}
                                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="My Custom Report Template"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={config.description}
                                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Describe what this template is for..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowSaveModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!config.name.trim() || saveMutation.isPending}
                                className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {saveMutation.isPending ? <FaSpinner className="animate-spin mx-auto" /> : 'Save Template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomReportBuilder;