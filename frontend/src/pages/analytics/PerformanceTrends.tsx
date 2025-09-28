import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Award, TrendingUp, Star, Target } from "lucide-react";
import Navbar from "../../components/dashboard/Navbar";

const API_BASE = "http://localhost:8000/analytics";

const PerformanceTrends = () => {
  const [performanceData, setPerformanceData] = useState({ monthly_trends: [], performance_distribution: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/performance-trends`)
      .then(res => res.json())
      .then(data => {
        setPerformanceData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const avgScore = performanceData.monthly_trends.length > 0 
    ? (performanceData.monthly_trends.reduce((sum, month) => sum + (month.score || 0), 0) / performanceData.monthly_trends.length).toFixed(2)
    : 0;

  const latestScore = performanceData.monthly_trends.length > 0 
    ? performanceData.monthly_trends[performanceData.monthly_trends.length - 1]?.score?.toFixed(2) 
    : 0;

  const trend = performanceData.monthly_trends.length >= 2 
    ? performanceData.monthly_trends[performanceData.monthly_trends.length - 1]?.score - 
      performanceData.monthly_trends[performanceData.monthly_trends.length - 2]?.score
    : 0;

  const highPerformers = performanceData.performance_distribution?.find(d => d.range === "4.0-5.0")?.count || 0;
  const totalEmployees = performanceData.performance_distribution?.reduce((sum, d) => sum + (d.count || 0), 0) || 1;
  const highPerformerPercentage = ((highPerformers / totalEmployees) * 100).toFixed(1);

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
            <Award style={{ width: '48px', height: '48px', color: 'white' }} />
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
              Performance Trends
            </h1>
            <p style={{ color: '#bfdbfe', fontSize: '1.25rem', lineHeight: '1.6' }}>
              Monitor employee performance metrics and identify improvement opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '0 80px 80px' }}>
        {/* Summary Cards */}
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
              <Star style={{ width: '32px', height: '32px', color: '#7c3aed' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : avgScore}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Average Score</div>
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
            <div style={{ padding: '20px', background: '#dbeafe', borderRadius: '16px' }}>
              <Target style={{ width: '32px', height: '32px', color: '#2563eb' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : latestScore}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Current Score</div>
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
            <div style={{ padding: '20px', background: trend >= 0 ? '#dcfce7' : '#fecaca', borderRadius: '16px' }}>
              <TrendingUp style={{ width: '32px', height: '32px', color: trend >= 0 ? '#059669' : '#dc2626' }} />
            </div>
            <div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '800', 
                color: trend >= 0 ? '#059669' : '#dc2626', 
                marginBottom: '8px' 
              }}>
                {loading ? '...' : `${trend >= 0 ? '+' : ''}${trend?.toFixed(2) || 0}`}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Monthly Change</div>
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
              <Award style={{ width: '32px', height: '32px', color: '#d97706' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : `${highPerformerPercentage}%`}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>High Performers</div>
            </div>
          </div>
        </div>

        {/* Performance Trend Chart */}
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '48px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          border: '1px solid #e2e8f0',
          marginBottom: '48px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ padding: '16px', background: '#e9d5ff', borderRadius: '12px' }}>
              <Award style={{ width: '32px', height: '32px', color: '#7c3aed' }} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Performance Score Trends
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
              Loading performance data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={performanceData.monthly_trends} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={14} 
                  fontWeight="600"
                />
                <YAxis 
                  domain={[1, 5]} 
                  stroke="#64748b" 
                  fontSize={14} 
                  fontWeight="600" 
                />
                <Tooltip 
                  formatter={(value) => [value?.toFixed(2), 'Performance Score']}
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
                  stroke="#7c3aed"
                  fill="url(#performanceGradient)"
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Performance Distribution */}
        {performanceData.performance_distribution && performanceData.performance_distribution.length > 0 && (
          <div style={{ 
            background: 'white', 
            borderRadius: '24px', 
            padding: '48px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
              <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '12px' }}>
                <Star style={{ width: '32px', height: '32px', color: '#d97706' }} />
              </div>
              <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Performance Score Distribution
              </h2>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performanceData.performance_distribution} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                <XAxis 
                  dataKey="range" 
                  stroke="#64748b" 
                  fontSize={14} 
                  fontWeight="600"
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
                  fill="#7c3aed" 
                  radius={[12, 12, 0, 0]}
                  maxBarSize={100}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default PerformanceTrends;