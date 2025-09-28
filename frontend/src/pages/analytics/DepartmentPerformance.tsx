import  { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Building2, Users, DollarSign, TrendingUp } from "lucide-react";
import Navbar from "../../components/dashboard/Navbar";

const API_BASE = "http://localhost:8000/analytics";

const DepartmentPerformance = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/department-performance`)
      .then(res => res.json())
      .then(data => {
        setDepartmentData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const totalEmployees = departmentData.reduce((sum, dept) => sum + (dept.employees || 0), 0);
  const avgSalary = departmentData.length > 0 
    ? departmentData.reduce((sum, dept) => sum + (dept.avgSalary || 0), 0) / departmentData.length 
    : 0;
  const topDepartment = departmentData.reduce((top, dept) => 
    (dept.employees || 0) > (top.employees || 0) ? dept : top, departmentData[0] || {});

  return (
    <div>
      <Navbar/>
    <div style={{ 
      width: '1500px',
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #e0e7ff 100%)', 
      fontFamily: '"Inter", system-ui, sans-serif',
      padding: '0'
    }}>
      
      {/* Header */}
      <div style={{ 
        maxWidth: '1600px', 
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
            <Building2 style={{ width: '48px', height: '48px', color: 'white' }} />
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
              Department Performance
            </h1>
            <p style={{ color: '#bfdbfe', fontSize: '1.25rem', lineHeight: '1.6' }}>
              Analyze performance metrics and employee distribution across departments
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '0 80px 80px' }}>
        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '48px' }}>
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
                {loading ? '...' : totalEmployees.toLocaleString()}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Total Employees</div>
            </div>
          </div>

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
            <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '16px' }}>
              <DollarSign style={{ width: '32px', height: '32px', color: '#059669' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : `$${Math.round(avgSalary).toLocaleString()}`}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Average Salary</div>
            </div>
          </div>

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
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : (topDepartment.name || 'N/A')}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Largest Department</div>
            </div>
          </div>
        </div>

        {/* Main Chart */}
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '48px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '12px' }}>
              <Building2 style={{ width: '32px', height: '32px', color: '#2563eb' }} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Department Metrics Overview
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
              Loading department data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  fontWeight="600"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64748b" fontSize={12} fontWeight="600" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: '600'
                  }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontWeight: '600', 
                    fontSize: '14px',
                    paddingTop: '20px'
                  }} 
                />
                <Bar 
                  dataKey="employees" 
                  fill="#2563eb" 
                  name="Employee Count" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                />
                <Bar 
                  dataKey="avgSalary" 
                  fill="#10b981" 
                  name="Avg Salary ($)" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Department Details Table */}
        {departmentData.length > 0 && (
          <div style={{ 
            background: 'white', 
            borderRadius: '24px', 
            padding: '48px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
            border: '1px solid #e2e8f0',
            marginTop: '48px'
          }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '32px' }}>
              Detailed Department Breakdown
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ 
                      padding: '16px 24px', 
                      textAlign: 'left', 
                      fontWeight: '700', 
                      color: '#374151',
                      borderRadius: '12px 0 0 12px',
                      fontSize: '1rem'
                    }}>
                      Department
                    </th>
                    <th style={{ 
                      padding: '16px 24px', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151',
                      fontSize: '1rem'
                    }}>
                      Employees
                    </th>
                    <th style={{ 
                      padding: '16px 24px', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151',
                      fontSize: '1rem'
                    }}>
                      Avg Salary
                    </th>
                    <th style={{ 
                      padding: '16px 24px', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151',
                      borderRadius: '0 12px 12px 0',
                      fontSize: '1rem'
                    }}>
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, index) => (
                    <tr key={dept.name} style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                      transition: 'background-color 0.2s'
                    }}>
                      <td style={{ 
                        padding: '20px 24px', 
                        fontWeight: '600', 
                        color: '#1e293b',
                        fontSize: '1rem'
                      }}>
                        {dept.name}
                      </td>
                      <td style={{ 
                        padding: '20px 24px', 
                        textAlign: 'center', 
                        color: '#64748b',
                        fontSize: '1rem'
                      }}>
                        {dept.employees?.toLocaleString() || 0}
                      </td>
                      <td style={{ 
                        padding: '20px 24px', 
                        textAlign: 'center', 
                        color: '#64748b',
                        fontSize: '1rem'
                      }}>
                        ${dept.avgSalary?.toLocaleString() || 0}
                      </td>
                      <td style={{ 
                        padding: '20px 24px', 
                        textAlign: 'center', 
                        color: '#64748b',
                        fontSize: '1rem'
                      }}>
                        {dept.performance?.toFixed(2) || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default DepartmentPerformance;