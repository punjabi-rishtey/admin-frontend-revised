// components/common/Chart.jsx
const Chart = ({ type, data, dataKey, xKey = 'name', title }) => {
  // Simple fallback charts without recharts
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  // Simple bar chart implementation
  if (type === 'bar' || type === 'line') {
    const maxValue = Math.max(...data.map(item => item[dataKey] || 0));
    
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-[300px] flex items-end justify-between gap-2 px-4">
          {data.slice(0, 10).map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-purple-600 rounded-t transition-all duration-300 hover:bg-purple-700"
                style={{ 
                  height: `${(item[dataKey] / maxValue) * 250}px`,
                  minHeight: '20px'
                }}
              />
              <div className="text-xs text-gray-600 mt-2 rotate-45 origin-left whitespace-nowrap">
                {item[xKey]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Simple pie chart implementation
  if (type === 'pie') {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    const colors = ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];
    
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-[300px]">
          <div className="w-64">
            {data.map((item, index) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className="text-sm text-gray-600">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6">
                    <div 
                      className="h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: colors[index % colors.length]
                      }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Chart;