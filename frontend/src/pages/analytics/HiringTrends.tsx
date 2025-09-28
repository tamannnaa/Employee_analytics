import  { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { UserPlus, TrendingDown, TrendingUp, Users } from "lucide-react";
import Navbar from "../../components/dashboard/Navbar";

const API_BASE = "http://localhost:8000/analytics";

const HiringTrends = () => {
  const [hiringTrends, setHiringTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/hiring-trends?months=12`)
      .then(res => res.json())
      .then(data => {
        setHiringTrends(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  const totalHires = hiringTrends.reduce((sum, month) => sum + (month.hires || 0), 0);
  const totalDepartures = hiringTrends.reduce((sum, month) => sum + (month.departures || 0), 0);
  const netGrowth = totalHires - totalDepartures;
  const retentionRate = totalHires > 0 ? ((totalHires - totalDepartures) / totalHires * 100).toFixed(1) : 0;

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
            <UserPlus style={{ width: '48px', height: '48px', color: 'white' }} />
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
              Hiring Trends
            </h1>
            <p style={{ color: '#bfdbfe', fontSize: '1.25rem', lineHeight: '1.6' }}>
              Track hiring patterns, departures, and workforce growth over time
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
            <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '16px' }}>
              <UserPlus style={{ width: '32px', height: '32px', color: '#059669' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : totalHires.toLocaleString()}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Total Hires</div>
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
            <div style={{ padding: '20px', background: '#fecaca', borderRadius: '16px' }}>
              <TrendingDown style={{ width: '32px', height: '32px', color: '#dc2626' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : totalDepartures.toLocaleString()}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Total Departures</div>
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
              <TrendingUp style={{ width: '32px', height: '32px', color: '#2563eb' }} />
            </div>
            <div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '800', 
                color: netGrowth >= 0 ? '#059669' : '#dc2626', 
                marginBottom: '8px' 
              }}>
                {loading ? '...' : `${netGrowth >= 0 ? '+' : ''}${netGrowth}`}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Net Growth</div>
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
              <Users style={{ width: '32px', height: '32px', color: '#d97706' }} />
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                {loading ? '...' : `${retentionRate}%`}
              </div>
              <div style={{ color: '#64748b', fontWeight: '600', fontSize: '1.125rem' }}>Retention Rate</div>
            </div>
          </div>
        </div>

        {/* Main Chart - Line Chart */}
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '48px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          border: '1px solid #e2e8f0',
          marginBottom: '48px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ padding: '16px', background: '#fed7aa', borderRadius: '12px' }}>
              <UserPlus style={{ width: '32px', height: '32px', color: '#ea580c' }} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Monthly Hiring Trends
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
              Loading hiring trends data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={hiringTrends} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={14} 
                  fontWeight="600"
                />
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
                <Legend 
                  wrapperStyle={{ 
                    fontWeight: '600', 
                    fontSize: '14px',
                    paddingTop: '20px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="hires" 
                  stroke="#059669" 
                  strokeWidth={4} 
                  dot={{ r: 8, fill: "#059669", strokeWidth: 2, stroke: 'white' }} 
                  name="New Hires"
                  activeDot={{ r: 10, stroke: '#059669', strokeWidth: 3, fill: 'white' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="departures" 
                  stroke="#dc2626" 
                  strokeWidth={4} 
                  dot={{ r: 8, fill: "#dc2626", strokeWidth: 2, stroke: 'white' }} 
                  name="Departures"
                  activeDot={{ r: 10, stroke: '#dc2626', strokeWidth: 3, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Net Growth Area Chart */}
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '48px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <div style={{ padding: '16px', background: '#dbeafe', borderRadius: '12px' }}>
              <TrendingUp style={{ width: '32px', height: '32px', color: '#2563eb' }} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Net Growth Visualization
            </h2>
          </div>

          {loading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '350px',
              color: '#64748b',
              fontSize: '1.125rem'
            }}>
              Loading growth data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={hiringTrends} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="netGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" strokeWidth={1} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={14} 
                  fontWeight="600"
                />
                <YAxis stroke="#64748b" fontSize={14} fontWeight="600" />
                <Tooltip 
                  formatter={(value) => [value, 'Net Growth']}
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
                  dataKey="net_growth"
                  stroke="#2563eb"
                  fill="url(#netGrowthGradient)"
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
     </div>
  );
};

export default HiringTrends;