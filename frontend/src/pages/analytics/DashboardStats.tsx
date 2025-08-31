import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Users, TrendingUp, DollarSign, Award, Download, RefreshCw, Building2,ChevronDown,
  UserPlus, AlertCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:8000/analytics';

const colors = {
  primary: '#1e40af',
  secondary: '#3b82f6',
  accent: '#60a5fa',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626',
  purple: '#7c3aed',
  orange: '#ea580c',
  indigo: '#4338ca',
  emerald: '#10b981',
  rose: '#e11d48',
  amber: '#f59e0b',
  cyan: '#0891b2'
};

const CHART_COLORS = [
  colors.primary, colors.purple, colors.emerald, colors.orange, 
  colors.rose, colors.cyan, colors.amber, colors.indigo
];

const DashboardStats = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  // State for all analytics data
  const [dashboardData, setDashboardData] = useState<any>({
    total_employees: 0,
    active_projects: 0,
    average_salary: 0,
    new_hires_this_month: 0,
    attrition_rate: 0,
    top_department: ''
  });
  
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [salaryData, setSalaryData] = useState<any>({
    distribution: [],
    statistics: {}
  });
  const [hiringTrends, setHiringTrends] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any>({
    monthly_trends: [],
    performance_distribution: []
  });
  const [retentionData, setRetentionData] = useState<any>({});

  // API fetch utility with error handling
  const fetchData = async (endpoint: string, params: any = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          queryParams.append(key, params[key]);
        }
      });
      
      const url = `${API_BASE}${endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err: any) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(err.message);
      throw err;
    }
  };

  // Load dashboard stats
  const loadDashboardStats = async () => {
    try {
      const params: any = {};
      if (selectedDepartment !== 'all') params.department = selectedDepartment;
      if (dateRange.start) params.start_date = dateRange.start;
      if (dateRange.end) params.end_date = dateRange.end;
      
      const data = await fetchData('/dashboard-stats', params);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    }
  };

  // Load department performance data
  const loadDepartmentData = async () => {
    try {
      const data = await fetchData('/department-performance');
      // Transform for pie chart
      const transformed = data.map((dept: any) => ({
        name: dept.name,
        employees: dept.employees,
        avgSalary: dept.avgSalary,
        performance: dept.performance
      }));
      setDepartmentData(transformed);
    } catch (error) {
      console.error('Failed to load department data:', error);
    }
  };

  // Load salary distribution
  const loadSalaryData = async () => {
    try {
      const params: any = {};
      if (selectedDepartment !== 'all') params.department = selectedDepartment;
      
      const data = await fetchData('/salary-distribution', params);
      setSalaryData(data);
    } catch (error) {
      console.error('Failed to load salary data:', error);
    }
  };

  // Load hiring trends
  const loadHiringTrends = async () => {
    try {
      const data = await fetchData('/hiring-trends', { months: 12 });
      setHiringTrends(data);
    } catch (error) {
      console.error('Failed to load hiring trends:', error);
    }
  };

  // Load performance trends
  const loadPerformanceData = async () => {
    try {
      const params: any = { months: 6 };
      if (selectedDepartment !== 'all') params.department = selectedDepartment;
      
      const data = await fetchData('/performance-trends', params);
      setPerformanceData(data);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    }
  };

  // Load retention data
  const loadRetentionData = async () => {
    try {
      const params: any = {};
      if (selectedDepartment !== 'all') params.department = selectedDepartment;
      
      const data = await fetchData('/retention-rate', params);
      setRetentionData(data);
    } catch (error) {
      console.error('Failed to load retention data:', error);
    }
  };

  // Load all analytics data
  const refreshAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        loadDashboardStats(),
        loadDepartmentData(),
        loadSalaryData(),
        loadHiringTrends(),
        loadPerformanceData(),
        loadRetentionData()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export data
  // const exportData = async (format: string, dataType: string = 'employees') => {
  //   try {
  //     const params = { 
  //       data_type: dataType, 
  //       format, 
  //       ...(selectedDepartment !== 'all' ? { department: selectedDepartment } : {})
  //     };
  //     const data = await fetchData('/export-data', params);
      
  //     const blob = new Blob([JSON.stringify(data.data, null, 2)], { 
  //       type: 'application/json' 
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = `hr_analytics_${dataType}_${new Date().toISOString().split('T')[0]}.${format}`;
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error('Failed to export data:', error);
  //   }
  // };
  const exportData = async (format: string, dataType: string = 'employees') => {
  try {
    const params = { 
      data_type: dataType, 
      format, 
      ...(selectedDepartment !== 'all' ? { department: selectedDepartment } : {})
    };
    
    // Make request to get the file
    const response = await fetch(`/export-data?${new URLSearchParams(params)}`, {
      method: 'GET',
      headers: {
        'Accept': '*/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }
    
    // Get the blob from response
    const blob = await response.blob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Set appropriate filename based on format
    const timestamp = new Date().toISOString().split('T')[0];
    a.download = `hr_analytics_${dataType}_${timestamp}.${format}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message (optional)
    console.log(`${format.toUpperCase()} file exported successfully`);
    
  } catch (error) {
    console.error('Failed to export data:', error);
    // You might want to show a toast notification here
  }
};
const ExportDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const exportOptions = [
    { format: 'json', label: 'Export as JSON', icon: '📄' },
    { format: 'csv', label: 'Export as CSV', icon: '📊' },
    { format: 'xlsx', label: 'Export as Excel', icon: '📈' }
  ];
  
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        style={{ 
          background: 'rgba(255, 255, 255, 0.2)', 
          padding: '16px 24px', 
          borderRadius: '12px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          border: '1px solid rgba(255, 255, 255, 0.3)', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', 
          fontWeight: '700', 
          fontSize: '1.125rem', 
          color: 'white', 
          cursor: loading ? 'not-allowed' : 'pointer', 
          opacity: loading ? 0.5 : 1, 
          transition: 'all 0.2s' 
        }}
        onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
        onMouseLeave={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
      >
        <Download style={{ width: '24px', height: '24px' }} />
        <span>Export Data</span>
        <ChevronDown style={{ width: '16px', height: '16px' }} />
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '8px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {exportOptions.map((option) => (
            <button
              key={option.format}
              onClick={() => {
                exportData(option.format, 'employees');
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                color: '#1f2937',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '1.2em' }}>{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
const ExportButtons = () => {
  const buttonStyle = {
    background: 'rgba(255, 255, 255, 0.2)',
    padding: '12px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };
  
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <button
        onClick={() => exportData('json', 'employees')}
        disabled={loading}
        style={buttonStyle}
        onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
        onMouseLeave={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
      >
        📄 JSON
      </button>
      
      <button
        onClick={() => exportData('csv', 'employees')}
        disabled={loading}
        style={buttonStyle}
        onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
        onMouseLeave={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
      >
        📊 CSV
      </button>
      
      <button
        onClick={() => exportData('xlsx', 'employees')}
        disabled={loading}
        style={buttonStyle}
        onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
        onMouseLeave={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
      >
        📈 Excel
      </button>
    </div>
  );
};
  // Load data on component mount and when filters change
  useEffect(() => {
    refreshAllData();
  }, [selectedDepartment, dateRange]);

  // --- PageHeader ---
  const PageHeader = ({ title, description, children }: any) => (
    <div style={{ margin: '0 auto', maxWidth: '1600px', padding: '60px 60px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)', borderRadius: '24px 24px 0 0', color: 'white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', borderBottom: '4px solid #1d4ed8', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px' }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '24px', background: 'linear-gradient(to right, #ffffff, #dbeafe, #c7d2fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: '1.1' }}>
            {title}
          </h1>
          <p style={{ color: '#bfdbfe', fontSize: '1.25rem', lineHeight: '1.6', maxWidth: '600px' }}>{description}</p>
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          {children}
        </div>
      </div>
    </div>
  );

  // --- Filter Section ---
  const FilterSection = ({
    dateRange,
    setDateRange,
    selectedDepartment,
    setSelectedDepartment,
    departmentData,
  }: any) => (
    <div style={{ margin: '0 auto', maxWidth: '1600px', background: 'white', borderRadius: '0 0 24px 24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', borderBottom: '4px solid #bfdbfe', padding: '48px 60px', marginBottom: '48px' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '1.25rem' }}>Date Range:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange((prev: any) => ({ ...prev, start: e.target.value }))}
              style={{ background: '#f1f5f9', color: '#1e293b', padding: '16px 20px', borderRadius: '12px', border: '2px solid #93c5fd', fontSize: '1.125rem', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <span style={{ color: '#64748b', fontWeight: '700', fontSize: '1.125rem' }}>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange((prev: any) => ({ ...prev, end: e.target.value }))}
              style={{ background: '#f1f5f9', color: '#1e293b', padding: '16px 20px', borderRadius: '12px', border: '2px solid #93c5fd', fontSize: '1.125rem', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <span style={{ color: '#0f172a', fontWeight: '700', fontSize: '1.25rem' }}>Department:</span>
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            style={{ background: '#f1f5f9', color: '#1e293b', padding: '16px 24px', borderRadius: '12px', border: '2px solid #93c5fd', fontSize: '1.125rem', fontWeight: '600', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', minWidth: '220px' }}
          >
            <option value="all">All Departments</option>
            {departmentData.map((dept: any) => (
              <option key={dept.name} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // --- Error Display ---
  const ErrorDisplay = ({ error, onRetry }: any) => (
    error && (
      <div style={{ margin: '0 auto', maxWidth: '1600px', background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '16px', padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <AlertCircle style={{ width: '24px', height: '24px', color: colors.error, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ color: colors.error, fontWeight: '600', margin: 0 }}>
            Error loading data: {error}
          </p>
        </div>
        <button
          onClick={onRetry}
          style={{ background: colors.error, color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    )
  );

  // --- KPI Card ---
  const KPICard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '32px', minWidth: '260px', minHeight: '200px', transition: 'box-shadow 0.2s', cursor: 'pointer' }}
         onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.15)'}
         onMouseLeave={e => e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)'}>
      <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '12px', background: color, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', marginBottom: '20px' }}>
        <Icon style={{ width: '32px', height: '32px', color: 'white' }} />
      </div>
      <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
        {loading ? '...' : (value || '---')}
      </h3>
      <p style={{ color: '#374151', fontWeight: '700', marginBottom: '8px', fontSize: '1.125rem' }}>{title}</p>
      {subtitle && <p style={{ fontSize: '1rem', color: '#3b82f6', fontWeight: '500' }}>{subtitle}</p>}
    </div>
  );

  // --- Main Render ---
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)', fontFamily: '"Inter", system-ui, sans-serif', padding: '0' }}>
      <div style={{ maxWidth: '1800px', margin: '0 auto' }}>
        {/* Header */}
        <PageHeader
          title="Analytics"
          description="Comprehensive workforce insights and performance metrics for data-driven decision making"
        >
          {/* <button
            onClick={() => exportData('json', 'employees')}
            disabled={loading}
            style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: '700', fontSize: '1.125rem', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.2s' }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
          >
            <Download style={{ width: '24px', height: '24px' }} />
            <span>Export Data</span>
          </button> */}
          <ExportDropdown/>
          <button
            onClick={refreshAllData}
            disabled={loading}
            style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255, 255, 255, 0.3)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: '700', fontSize: '1.125rem', color: 'white', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, transition: 'all 0.2s' }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
          >
            <RefreshCw style={{ width: '24px', height: '24px', animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </PageHeader>

        {/* Error Display */}
        <ErrorDisplay error={error} onRetry={refreshAllData} />

        {/* Filters */}
        <FilterSection
          dateRange={dateRange}
          setDateRange={setDateRange}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          departmentData={departmentData}
        />

        {/* KPI Cards */}
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '40px', justifyContent: 'flex-start', alignItems: 'stretch', padding: '32px 60px', background: 'transparent' }}>
          <KPICard
            title="Total Employees"
            value={dashboardData.total_employees?.toLocaleString()}
            icon={Users}
            color="#2563eb"
            subtitle="Active workforce"
          />
          <KPICard
            title="Active Projects"
            value={dashboardData.active_projects}
            icon={Building2}
            color="#059669"
            subtitle="Ongoing initiatives"
          />
          <KPICard
            title="Average Salary"
            value={dashboardData.average_salary ? `$${dashboardData.average_salary.toLocaleString()}` : '---'}
            icon={DollarSign}
            color="#7c3aed"
            subtitle="Across all departments"
          />
          <KPICard
            title="New Hires"
            value={dashboardData.new_hires_this_month}
            icon={UserPlus}
            color="#ea580c"
            subtitle="This month"
          />
        </div>

        {/* Analytics Charts */}
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '48px', padding: '32px 60px 60px' }}>
          {/* Department Distribution */}
          {departmentData.length > 0 && (
            <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', margin: '0', marginBottom: '16px', padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ padding: '20px', background: '#dbeafe', borderRadius: '16px', marginRight: '24px' }}>
                  <Users style={{ width: '40px', height: '40px', color: '#2563eb' }} />
                </div>
                <h3 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b' }}>Department Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    dataKey="employees"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={140}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    stroke="#ffffff"
                    strokeWidth={3}
                  >
                    {departmentData.map((_: any, index: number) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [value, 'Employees']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontWeight: '600'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Hiring Trends */}
          {hiringTrends.length > 0 && (
            <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', margin: '0', marginBottom: '16px', padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ padding: '20px', background: '#fed7aa', borderRadius: '16px', marginRight: '24px' }}>
                  <TrendingUp style={{ width: '40px', height: '40px', color: '#ea580c' }} />
                </div>
                <h3 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b' }}>Hiring vs Departures</h3>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={hiringTrends} barGap={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={14} fontWeight="600" />
                  <YAxis stroke="#64748b" fontSize={14} fontWeight="600" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontWeight: '600'
                    }}
                  />
                  <Legend wrapperStyle={{ fontWeight: '600', fontSize: '14px' }} />
                  <Bar dataKey="hires" fill={colors.emerald} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="departures" fill={colors.error} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Performance Trends */}
          {performanceData.monthly_trends && performanceData.monthly_trends.length > 0 && (
            <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', margin: '0', marginBottom: '16px', padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ padding: '20px', background: '#e9d5ff', borderRadius: '16px', marginRight: '24px' }}>
                  <Award style={{ width: '40px', height: '40px', color: '#7c3aed' }} />
                </div>
                <h3 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b' }}>Performance Trends</h3>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceData.monthly_trends}>
                  <defs>
                    <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={colors.purple} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={colors.purple} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={14} fontWeight="600" />
                  <YAxis domain={[1, 5]} stroke="#64748b" fontSize={14} fontWeight="600" />
                  <Tooltip
                    formatter={(value: any) => [value.toFixed(2), 'Performance Score']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontWeight: '600'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={colors.purple}
                    fill="url(#performanceGradient)"
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Salary Distribution */}
          {salaryData.distribution && salaryData.distribution.length > 0 && (
            <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', margin: '0', marginBottom: '16px', padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                <div style={{ padding: '20px', background: '#c7d2fe', borderRadius: '16px', marginRight: '24px' }}>
                  <DollarSign style={{ width: '40px', height: '40px', color: '#4338ca' }} />
                </div>
                <h3 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b' }}>Salary Distribution</h3>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salaryData.distribution} barGap={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                  <XAxis dataKey="range" stroke="#64748b" fontSize={14} fontWeight="600" />
                  <YAxis stroke="#64748b" fontSize={14} fontWeight="600" />
                  <Tooltip
                    formatter={(value: any) => [value, 'Employees']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontWeight: '600'
                    }}
                  />
                  <Bar dataKey="count" fill={colors.indigo} radius={[12, 12, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default DashboardStats;