import React, { useState } from "react";
import { Search, Database, Code } from "lucide-react";

const API_BASE = "http://localhost:8000/analytics";

const CustomQuery = () => {
  const [filters, setFilters] = useState({});
  const [groupBy, setGroupBy] = useState("");
  const [aggregation, setAggregation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/custom-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filters, group_by: groupBy, aggregation })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Query failed:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px' }}>
          <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '16px' }}>
            <Database style={{ width: '48px', height: '48px', color: 'white' }} />
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
              Custom Analytics Query
            </h1>
            <p style={{ color: '#bfdbfe', fontSize: '1.25rem', lineHeight: '1.6' }}>
              Build custom queries to analyze your HR data with advanced filters and aggregations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '0 80px 80px' }}>
        {/* Query Builder */}
        <div style={{ 
          background: 'white', 
          borderRadius: '24px', 
          padding: '48px', 
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
          border: '1px solid #e2e8f0',
          marginBottom: '48px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <Code style={{ width: '32px', height: '32px', color: '#2563eb' }} />
            <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
              Query Builder
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
            {/* Filters */}
            <div>
              <label style={{ 
                display: 'block', 
                fontWeight: '700', 
                fontSize: '1.125rem', 
                color: '#374151', 
                marginBottom: '12px' 
              }}>
                Filters (JSON Format)
              </label>
              <textarea 
                style={{ 
                  width: '100%', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  minHeight: '120px',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }} 
                rows={5} 
                value={JSON.stringify(filters, null, 2)} 
                onChange={(e) => {
                  try {
                    setFilters(JSON.parse(e.target.value));
                  } catch {}
                }}
                placeholder='{"department": "Engineering", "is_active": true}'
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Group By and Aggregation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontWeight: '700', 
                  fontSize: '1.125rem', 
                  color: '#374151', 
                  marginBottom: '12px' 
                }}>
                  Group By Field
                </label>
                <input 
                  style={{ 
                    width: '100%', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    fontSize: '1rem',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    transition: 'border-color 0.2s'
                  }} 
                  value={groupBy} 
                  onChange={(e) => setGroupBy(e.target.value)}
                  placeholder="department"
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontWeight: '700', 
                  fontSize: '1.125rem', 
                  color: '#374151', 
                  marginBottom: '12px' 
                }}>
                  Aggregation Type
                </label>
                <select
                  style={{ 
                    width: '100%', 
                    border: '2px solid #e2e8f0', 
                    borderRadius: '12px', 
                    padding: '16px', 
                    fontSize: '1rem',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    transition: 'border-color 0.2s'
                  }} 
                  value={aggregation} 
                  onChange={(e) => setAggregation(e.target.value)}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="">Select aggregation...</option>
                  <option value="count">Count</option>
                  <option value="avg_salary">Average Salary</option>
                  <option value="avg_performance">Average Performance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={handleSubmit}
              disabled={loading}
              style={{ 
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                color: 'white', 
                padding: '16px 48px', 
                borderRadius: '16px', 
                border: 'none',
                fontSize: '1.125rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0px)')}
            >
              <Search style={{ width: '20px', height: '20px' }} />
              {loading ? 'Running Query...' : 'Run Query'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div style={{ 
            background: 'white', 
            borderRadius: '24px', 
            padding: '48px', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ padding: '12px', background: '#dbeafe', borderRadius: '12px' }}>
                <Database style={{ width: '24px', height: '24px', color: '#2563eb' }} />
              </div>
              <h3 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
                Query Results
              </h3>
              <div style={{ 
                background: '#dbeafe', 
                color: '#2563eb', 
                padding: '8px 16px', 
                borderRadius: '20px', 
                fontSize: '0.875rem', 
                fontWeight: '600' 
              }}>
                {result.count} records
              </div>
            </div>
            <pre style={{ 
              backgroundColor: '#f8fafc', 
              border: '2px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              fontSize: '0.875rem',
              fontFamily: 'monospace',
              color: '#374151',
              lineHeight: '1.6',
              overflow: 'auto',
              maxHeight: '500px',
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomQuery;