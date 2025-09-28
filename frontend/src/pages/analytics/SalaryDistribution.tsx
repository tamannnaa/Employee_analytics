import  { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";
import { DollarSign, TrendingUp, Calculator, Users } from "lucide-react";
import Navbar from "../../components/dashboard/Navbar";

const API_BASE = "http://localhost:8000/analytics";

const SalaryDistribution = () => {
  const [salaryData, setSalaryData] = useState({ distribution: [], statistics: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/salary-distribution`)
      .then(res => res.json())
      .then(data => {
        setSalaryData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const totalEmployees = salaryData.distribution.reduce((sum, range) => sum + (range.count || 0), 0);
  const highestRange = salaryData.distribution.reduce((max, range) => 
    (range.count || 0) > (max.count || 0) ? range : max, 
    salaryData.distribution[0] || {}
  );

  const salaryGap = salaryData.statistics?.max_salary && salaryData.statistics?.min_salary 
    ? salaryData.statistics.max_salary - salaryData.statistics.min_salary 
    : 0;

  return (
    <div>
      <Navbar/>
    <div style={{ 
      width:'1500px',
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
            <DollarSign style={{ width: '48px', height: '48px', color: 'white' }} />
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
              Salary Distribution
            </h1>
            <p style={{ color: '#bfdbfe', fontSize: '1.25rem', lineHeight: '1.6' }}>
              Comprehensive analysis of compensation patterns and salary equity across your organization
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '0 80px 80px' }}>
        {/* Statistics Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '48px' }}>
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
            <div style={{ padding: '20px', background: '#e9d5ff', borderRadius: '16px' }}>
              <Calculator style={{ width: '32px', height: '32px', color: '#7c3aed' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                ${loading ? '...' : (salaryData.statistics?.median_salary?.toLocaleString() || '---')}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Median Salary</div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '20px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ padding: '20px', background: '#dbeafe', borderRadius: '16px' }}>
              <DollarSign style={{ width: '32px', height: '32px', color: '#2563eb' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                ${loading ? '...' : (salaryData.statistics?.avg_salary?.toLocaleString() || '---')}
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
            <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '16px' }}>
              <TrendingUp style={{ width: '32px', height: '32px', color: '#059669' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                ${loading ? '...' : (salaryData.statistics?.max_salary?.toLocaleString() || '---')}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Highest Salary</div>
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
            <div style={{ padding: '20px', background: '#fed7aa', borderRadius: '16px' }}>
              <Users style={{ width: '32px', height: '32px', color: '#ea580c' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : totalEmployees.toLocaleString()}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Total Employees</div>
            </div>
          </div>
        </div>

        {/* Additional Insight Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '32px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: '#fecaca', borderRadius: '12px' }}>
                <TrendingUp style={{ width: '24px', height: '24px', color: '#dc2626' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Salary Gap</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#dc2626', marginBottom: '8px' }}>
              ${loading ? '...' : salaryGap.toLocaleString()}
            </div>
            <div style={{ color: '#64748b', fontSize: '1rem' }}>
              Difference between highest and lowest salary
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '20px', 
            padding: '32px', 
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '12px' }}>
                <Users style={{ width: '24px', height: '24px', color: '#d97706' }} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>Most Common Range</h3>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#d97706', marginBottom: '8px' }}>
              {loading ? '...' : (highestRange.range || 'N/A')}
            </div>
            <div style={{ color: '#64748b', fontSize: '1rem' }}>
              {loading ? '' : `${highestRange.count || 0} employees in this range`}
            </div>
          </div>
        </div>

        {/* Salary Histogram */}
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '48px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          border: '1px solid #e2e8f0',
          marginBottom: '48px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ padding: '16px', background: '#c7d2fe', borderRadius: '12px' }}>
              <DollarSign style={{ width: '32px', height: '32px', color: '#4338ca' }} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Salary Distribution Histogram
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
              Loading salary distribution data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={salaryData.distribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                <XAxis 
                  dataKey="range" 
                  stroke="#64748b" 
                  fontSize={14} 
                  fontWeight="600"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64748b" fontSize={14} fontWeight="600" />
                <Tooltip 
                  formatter={(value) => [value, 'Employees']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontWeight: '600'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#4338ca" 
                  radius={[12, 12, 0, 0]}
                  maxBarSize={100}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Detailed Statistics Table */}
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '48px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ padding: '16px', background: '#e9d5ff', borderRadius: '12px' }}>
              <Calculator style={{ width: '32px', height: '32px', color: '#7c3aed' }} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Distribution Breakdown
            </h2>
          </div>

          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '200px',
              color: '#64748b',
              fontSize: '1.125rem'
            }}>
              Loading detailed breakdown...
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ 
                      padding: '20px 24px', 
                      textAlign: 'left', 
                      fontWeight: '700', 
                      color: '#374151',
                      borderRadius: '12px 0 0 12px',
                      fontSize: '1.125rem'
                    }}>
                      Salary Range
                    </th>
                    <th style={{ 
                      padding: '20px 24px', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151',
                      fontSize: '1.125rem'
                    }}>
                      Employees
                    </th>
                    <th style={{ 
                      padding: '20px 24px', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151',
                      fontSize: '1.125rem'
                    }}>
                      Percentage
                    </th>
                    <th style={{ 
                      padding: '20px 24px', 
                      textAlign: 'center', 
                      fontWeight: '700', 
                      color: '#374151',
                      borderRadius: '0 12px 12px 0',
                      fontSize: '1.125rem'
                    }}>
                      Visual
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salaryData.distribution.map((range, index) => {
                    const percentage = totalEmployees > 0 ? ((range.count / totalEmployees) * 100).toFixed(1) : 0;
                    return (
                      <tr key={range.range} style={{ 
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa',
                        transition: 'background-color 0.2s'
                      }}>
                        <td style={{ 
                          padding: '24px', 
                          fontWeight: '600', 
                          color: '#1e293b',
                          fontSize: '1.125rem'
                        }}>
                          {range.range}
                        </td>
                        <td style={{ 
                          padding: '24px', 
                          textAlign: 'center', 
                          color: '#64748b',
                          fontSize: '1.125rem',
                          fontWeight: '600'
                        }}>
                          {range.count?.toLocaleString() || 0}
                        </td>
                        <td style={{ 
                          padding: '24px', 
                          textAlign: 'center', 
                          color: '#64748b',
                          fontSize: '1.125rem',
                          fontWeight: '600'
                        }}>
                          {percentage}%
                        </td>
                        <td style={{ 
                          padding: '24px', 
                          textAlign: 'center'
                        }}>
                          <div style={{
                            width: '100%',
                            height: '12px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '6px',
                            overflow: 'hidden',
                            position: 'relative'
                          }}>
                            <div style={{
                              width: `${percentage}%`,
                              height: '100%',
                              backgroundColor: '#4338ca',
                              borderRadius: '6px',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default SalaryDistribution;