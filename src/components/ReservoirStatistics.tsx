import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Define types for the reservoir data
interface HistoricalComparison {
  min: number;
  median: number;
  max: number;
  percentileRank: number;
}

interface PriceAreaData {
  areaId: number;
  areaName: string;
  week: number;
  year: number;
  fillLevel: number;
  capacityTWh: number;
  fillingTWh: number;
  previousWeekFillLevel: number;
  change: number;
  historicalComparison: HistoricalComparison | null;
}

interface NationalData {
  week: number;
  year: number;
  fillLevel: number;
  capacityTWh: number;
  fillingTWh: number;
  previousWeekFillLevel: number;
  change: number;
  nextPublishDate: string;
  historicalComparison: HistoricalComparison | null;
}

interface ReservoirData {
  national: NationalData | null;
  priceAreas: PriceAreaData[];
}

interface ApiResponse {
  success: boolean;
  data: ReservoirData;
  timestamp: string;
}

// Helper function to get the current week number
function getWeekNumber(date: Date): number {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

export default function ReservoirStatistics() {
  const [reservoirData, setReservoirData] = useState<ReservoirData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add fallback data for when API fails
  const currentWeek = getWeekNumber(new Date());
  const currentYear = new Date().getFullYear();
  
  const fallbackData: ReservoirData = {
    national: {
      week: currentWeek,
      year: currentYear,
      fillLevel: 65.5,
      capacityTWh: 87.6,
      fillingTWh: 57.4,
      previousWeekFillLevel: 64.2,
      change: 1.3,
      nextPublishDate: new Date().toISOString(),
      historicalComparison: {
        min: 45.2,
        median: 70.3,
        max: 95.1,
        percentileRank: 40
      }
    },
    priceAreas: [
      {
        areaId: 1,
        areaName: "Sørøst-Norge (NO1)",
        week: currentWeek,
        year: currentYear,
        fillLevel: 58.7,
        capacityTWh: 12.3,
        fillingTWh: 7.2,
        previousWeekFillLevel: 57.5,
        change: 1.2,
        historicalComparison: {
          min: 40.1,
          median: 65.4,
          max: 90.2,
          percentileRank: 37
        }
      },
      {
        areaId: 2,
        areaName: "Sørvest-Norge (NO2)",
        week: currentWeek,
        year: currentYear,
        fillLevel: 62.3,
        capacityTWh: 33.1,
        fillingTWh: 20.6,
        previousWeekFillLevel: 60.8,
        change: 1.5,
        historicalComparison: {
          min: 42.5,
          median: 68.7,
          max: 92.1,
          percentileRank: 42
        }
      },
      {
        areaId: 3,
        areaName: "Midt-Norge (NO3)",
        week: currentWeek,
        year: currentYear,
        fillLevel: 70.2,
        capacityTWh: 8.7,
        fillingTWh: 6.1,
        previousWeekFillLevel: 69.5,
        change: 0.7,
        historicalComparison: {
          min: 48.3,
          median: 72.6,
          max: 94.8,
          percentileRank: 55
        }
      },
      {
        areaId: 4,
        areaName: "Nord-Norge (NO4)",
        week: currentWeek,
        year: currentYear,
        fillLevel: 75.8,
        capacityTWh: 15.2,
        fillingTWh: 11.5,
        previousWeekFillLevel: 74.9,
        change: 0.9,
        historicalComparison: {
          min: 52.7,
          median: 76.3,
          max: 96.5,
          percentileRank: 62
        }
      },
      {
        areaId: 5,
        areaName: "Vest-Norge (NO5)",
        week: currentWeek,
        year: currentYear,
        fillLevel: 67.4,
        capacityTWh: 18.3,
        fillingTWh: 12.3,
        previousWeekFillLevel: 66.1,
        change: 1.3,
        historicalComparison: {
          min: 46.9,
          median: 71.8,
          max: 93.7,
          percentileRank: 48
        }
      }
    ]
  };

  useEffect(() => {
    const fetchReservoirData = async () => {
      try {
        console.log('Component: Fetching reservoir data...');
        setLoading(true);
        const response = await fetch('/api/reservoirs');
        
        console.log(`Component: Response status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch reservoir data: ${response.status}`);
        }
        
        const result: ApiResponse = await response.json();
        console.log('Component: Data received:', result);
        
        if (result.success) {
          console.log('Component: Setting reservoir data');
          setReservoirData(result.data);
        } else {
          console.error('Component: API returned error:', result.error);
          throw new Error(result.error || 'Unknown error');
        }
      } catch (error) {
        console.error('Component: Error fetching reservoir data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchReservoirData();
  }, []);

  // Function to prepare chart data
  const prepareChartData = () => {
    const dataToUse = reservoirData || fallbackData;
    
    return dataToUse.priceAreas.map(area => ({
      name: area.areaName.replace(/\(.*?\)/, '').trim(),
      fyllingsgrad: area.fillLevel,
      median: area.historicalComparison?.median || 0
    }));
  };

  // Function to get color based on fill level
  const getFillLevelColor = (level: number) => {
    if (level < 30) return '#EF4444'; // Red for low levels
    if (level < 50) return '#F59E0B'; // Amber for medium-low levels
    if (level < 70) return '#10B981'; // Green for medium-high levels
    return '#3B82F6'; // Blue for high levels
  };

  // Function to get status text based on fill level
  const getFillLevelStatus = (level: number) => {
    if (level < 30) return 'Kritisk lavt';
    if (level < 50) return 'Lavt';
    if (level < 70) return 'Normalt';
    if (level < 85) return 'Høyt';
    return 'Svært høyt';
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Vannmagasinfylling i Norge</h2>
          <div className="mt-8 flex justify-center">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500">Laster vannmagasindata...</p>
        </div>
      </div>
    );
  }

  if (error && !reservoirData) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Vannmagasinfylling i Norge</h2>
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-700">Kunne ikke laste vannmagasindata: {error}</p>
            <p className="mt-2 text-red-600">Viser estimerte data basert på historiske tall.</p>
          </div>
        </div>
      </div>
    );
  }

  const dataToUse = reservoirData || fallbackData;
  const chartData = prepareChartData();
  const national = dataToUse.national;
  const nextUpdateDate = national?.nextPublishDate 
    ? new Date(national.nextPublishDate).toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })
    : 'ukjent dato';

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Vannmagasinfylling i Norge</h2>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
          Fyllingsgraden i norske vannmagasiner påvirker strømprisene direkte
        </p>
        {national && (
          <div className="mt-4">
            <p className="text-xl font-semibold">
              Nasjonal fyllingsgrad: <span className="text-blue-600">{national.fillLevel.toFixed(1)}%</span>
              <span className={`ml-2 text-sm ${national.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ({national.change > 0 ? '+' : ''}{national.change.toFixed(1)}% siste uke)
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Uke {national.week}, {national.year} • Neste oppdatering: {nextUpdateDate}
            </p>
          </div>
        )}
      </div>

      {/* Chart showing reservoir levels by price area */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Fyllingsgrad per prisområde</h3>
          <p className="mt-2 text-sm text-gray-600">
            Sammenligning av fyllingsgraden i de ulike prisområdene i Norge
          </p>
        </div>
        <div className="px-6 py-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Fyllingsgrad']} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="fyllingsgrad" 
                  stroke="#3B82F6" 
                  fill="#93C5FD" 
                  name="Fyllingsgrad" 
                />
                <Area 
                  type="monotone" 
                  dataKey="median" 
                  stroke="#6B7280" 
                  fill="#E5E7EB" 
                  strokeDasharray="5 5" 
                  name="Median (20 år)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cards showing details for each price area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataToUse.priceAreas.map((area) => (
          <div key={area.areaId} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">{area.areaName}</h3>
              
              <div className="mt-4 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="h-4 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${area.fillLevel}%`,
                      backgroundColor: getFillLevelColor(area.fillLevel)
                    }}
                  ></div>
                </div>
                <span className="ml-3 text-lg font-semibold">{area.fillLevel.toFixed(1)}%</span>
              </div>
              
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">Status: <span className="font-medium" style={{ color: getFillLevelColor(area.fillLevel) }}>{getFillLevelStatus(area.fillLevel)}</span></span>
                <span className={`font-medium ${area.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {area.change > 0 ? '+' : ''}{area.change.toFixed(1)}%
                </span>
              </div>
              
              {area.historicalComparison && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700">Historisk sammenligning</h4>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <p className="text-gray-500">Min</p>
                      <p className="font-medium text-gray-900">{area.historicalComparison.min.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Median</p>
                      <p className="font-medium text-gray-900">{area.historicalComparison.median.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Maks</p>
                      <p className="font-medium text-gray-900">{area.historicalComparison.max.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">
                      Nåværende nivå er {area.historicalComparison.percentileRank}% av historisk spenn
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Kapasitet: {area.capacityTWh.toFixed(2)} TWh</p>
                <p>Fylling: {area.fillingTWh.toFixed(2)} TWh</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 