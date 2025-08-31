import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Target, Users, TrendingUp, Shield, AlertCircle } from "lucide-react";

const API_BASE = "http://localhost:8000/analytics";

const colors = ['#059669', '#2563eb', '#7c3aed', '#ea580c', '#dc2626', '#0891b2'];

const RetentionRate = () => {
  const [retentionData, setRetentionData] = useState({ 
    department_retention: [], 
    overall_retention_rate: null,
    tenure_retention: [],
    total_hired: 0,
    active_employees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/retention-rate`)
      .then(res => res.json())
      .then(data => {
        setRetentionData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const attritionRate = retentionData.overall_retention_rate 
    ? (100 - parseFloat(retentionData.overall_retention_rate)).toFixed(1)
    : 0;

  const bestDepartment = retentionData.department_retention && retentionData.department_retention.length > 0
    ? retentionData.department_retention.reduce((best, dept) => 
        (dept.retention_rate || 0) > (best.retention_rate || 0) ? dept : best, 
        retentionData.department_retention[0]
      )
    : null;

  const worstDepartment = retentionData.department_retention && retentionData.department_retention.length > 0
    ? retentionData.department_retention.reduce((worst, dept) => 
        (dept.retention_rate || 100) < (worst.retention_rate || 100) ? dept : worst, 
        retentionData.department_retention[0]
      )
    : null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)', 
      fontFamily: '"Inter", system-ui, sans-serif',
      padding: '0'
    }}>
      {/* Header */}
      <div style={{ 
        maxWidth: '1800px', 
        margin: '0 auto', 
        padding: '60px 80px', 
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)', 
        borderRadius: '0 0 32px 32px', 
        color: 'white', 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        marginBottom: '60px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '16px' }}>
            <Target style={{ width: '48px', height: '48px', color: 'white' }} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: '800', 
              marginBottom: '16px', 
              background: 'linear-gradient(to right, #ffffff, #dbeafe, #c7d2fe)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.1'
            }}>
              Employee Retention
            </h1>
            <p style={{ color: '#bfdbfe', fontSize: '1.25rem', lineHeight: '1.6' }}>
              Analyze retention rates, identify trends, and improve employee satisfaction
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '0 80px 80px' }}>
        {/* Key Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '48px' }}>
          {/* Overall Retention Rate */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '40px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}>
              <Shield style={{ width: '40px', height: '40px', color: '#059669' }} />
            </div>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: '#059669', marginBottom: '12px' }}>
              {loading ? '...' : `${retentionData.overall_retention_rate || 0}%`}
            </div>
            <div style={{ color: '#64748b', fontWeight: '700', fontSize: '1.25rem', marginBottom: '8px' }}>
              Overall Retention Rate
            </div>
            <div style={{ color: '#374151', fontSize: '1rem' }}>
              {loading ? '' : `${retentionData.active_employees || 0} of ${retentionData.total_hired || 0} employees`}
            </div>
          </div>

          {/* Attrition Rate */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '32px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ padding: '20px', background: '#fecaca', borderRadius: '16px' }}>
              <AlertCircle style={{ width: '32px', height: '32px', color: '#dc2626' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#dc2626', marginBottom: '8px' }}>
                {loading ? '...' : `${attritionRate}%`}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Attrition Rate</div>
            </div>
          </div>

          {/* Best Department */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '32px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '16px' }}>
              <TrendingUp style={{ width: '32px', height: '32px', color: '#d97706' }} />
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : (bestDepartment?.department || 'N/A')}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>
                Best Retention ({loading ? '...' : `${bestDepartment?.retention_rate?.toFixed(1) || 0}%`})
              </div>
            </div>
          </div>

          {/* Active Employees */}
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '32px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ padding: '20px', background: '#dbeafe', borderRadius: '16px' }}>
              <Users style={{ width: '32px', height: '32px', color: '#2563eb' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : retentionData.active_employees?.toLocaleString() || 0}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Active Employees</div>
            </div>
          </div>
        </div>

        {/* Department Retention Chart */}
        {retentionData.department_retention && retentionData.department_retention.length > 0 && (
          <div style={{ 
            background: 'white', 
            borderRadius: '24px', 
            padding: '48px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
            border: '1px solid #e2e8f0',
            marginBottom: '48px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
              <div style={{ padding: '16px', background: '#dcfce7', borderRadius: '12px' }}>
                <Target style={{ width: '32px', height: '32px', color: '#059669' }} />
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Retention by Department
              </h2>
            </div>

            {loading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                color: '#64748b',
                fontSize: '1.125rem'
              }}>
                Loading retention data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={450}>
                <BarChart data={retentionData.department_retention} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                  <XAxis 
                    dataKey="department" 
                    stroke="#64748b" 
                    fontSize={12} 
                    fontWeight="600"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={14} 
                    fontWeight="600"
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Retention Rate']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontWeight: '600'
                    }}
                  />
                  <Bar 
                    dataKey="retention_rate" 
                    fill="#059669" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={80}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Tenure-based Retention */}
        {retentionData.tenure_retention && retentionData.tenure_retention.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px' }}>
            {/* Tenure Retention Chart */}
            <div style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '48px', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                <div style={{ padding: '16px', background: '#e9d5ff', borderRadius: '12px' }}>
                  <Shield style={{ width: '32px', height: '32px', color: '#7c3aed' }} />
                </div>
                <h3 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                  Retention by Tenure
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={retentionData.tenure_retention} layout="horizontal" margin={{ top: 20, right: 30, left: 60, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} fontWeight="600" />
                  <YAxis type="category" dataKey="tenure" stroke="#64748b" fontSize={12} fontWeight="600" width={60} />
                  <Tooltip 
                    formatter={(value) => [`${value.toFixed(1)}%`, 'Retention Rate']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      fontWeight: '600'
                    }}
                  />
                  <Bar 
                    dataKey="retention_rate" 
                    fill="#7c3aed" 
                    radius={[0, 8, 8, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Department Retention Pie Chart */}
            <div style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '48px', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
                <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '12px' }}>
                  <Users style={{ width: '32px', height: '32px', color: '#d97706' }} />
                </div>
                <h3 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                  Active Employees
                </h3>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={retentionData.department_retention}
                    dataKey="active_employees"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ department, percent }) => `${department} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {retentionData.department_retention.map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Active Employees']}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default RetentionRate;