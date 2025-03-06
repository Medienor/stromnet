'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function TestApi() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [localGridsData, setLocalGridsData] = useState(null);
  const [structureAnalysis, setStructureAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showRawData, setShowRawData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 20; // Increased from 10 to 20

  async function fetchData() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/electricity-deals');
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setStructureAnalysis(result.structureAnalysis);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to fetch data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLocalGrids() {
    setLoading(true);
    setError(null);
    
    try {
      // First check if the endpoint exists with a HEAD request
      const checkResponse = await fetch('/api/local-grids', { method: 'HEAD' })
        .catch(() => ({ ok: false }));
      
      if (!checkResponse.ok) {
        setError('API endpoint /api/local-grids does not exist. Please check server configuration.');
        console.error('API endpoint not found');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/local-grids');
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setError('API endpoint returned non-JSON response. Check server logs.');
        console.error('Non-JSON response from API:', await response.text());
        setLoading(false);
        return;
      }
      
      const result = await response.json();
      
      if (result.success) {
        setLocalGridsData(result.data);
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      setError('Failed to fetch local grids data: ' + (err.message || 'Unknown error'));
      console.error('Local grids fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter and paginate local grids data
  const filteredLocalGrids = localGridsData 
    ? localGridsData.filter(grid => 
        grid.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        grid.areaCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (grid.municipalityNumber?.toString() || '').includes(searchTerm)
      )
    : [];
    
  const totalPages = Math.ceil(filteredLocalGrids.length / itemsPerPage);
  const paginatedLocalGrids = filteredLocalGrids.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">API Test Page</h1>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button 
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Loading...' : 'Fetch Electricity Deals'}
              </button>
              
              <button 
                onClick={fetchLocalGrids}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
              >
                {loading ? 'Loading...' : 'Fetch Local Grids'}
              </button>
              
              {(data || localGridsData) && (
                <button 
                  onClick={() => setShowRawData(!showRawData)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  {showRawData ? 'Hide Raw Data' : 'Show Raw Data'}
                </button>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                {error}
              </div>
            )}
            
            {/* Electricity Deals Data */}
            {data && (
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4">Electricity Deals Response</h2>
                <div className="bg-gray-100 p-4 rounded-md mb-6">
                  <p className="mb-2"><strong>Date:</strong> {data.date || 'N/A'}</p>
                  <p className="mb-2"><strong>Total Products:</strong> {data.products?.length || 0}</p>
                  
                  {data.products && data.products.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">First 5 Products:</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="px-4 py-2 text-left">Name</th>
                              <th className="px-4 py-2 text-left">Provider</th>
                              <th className="px-4 py-2 text-left">Type</th>
                              <th className="px-4 py-2 text-left">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.products.slice(0, 5).map((product, index) => (
                              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2">{product.name || 'N/A'}</td>
                                <td className="px-4 py-2">{product.provider?.name || 'N/A'}</td>
                                <td className="px-4 py-2">{product.type || 'N/A'}</td>
                                <td className="px-4 py-2">
                                  {product.totalmonthly !== undefined ? `${product.totalmonthly.toFixed(2)} kr` : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                
                {structureAnalysis && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Product Structure Analysis</h3>
                    <div className="bg-gray-100 p-4 rounded-md">
                      <p className="mb-2"><strong>Total Fields:</strong> {structureAnalysis.totalKeys}</p>
                      <h4 className="font-semibold mt-4 mb-2">All Fields with Sample Values:</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="px-4 py-2 text-left">Field Name</th>
                              <th className="px-4 py-2 text-left">Sample Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {structureAnalysis.keys.map((key, index) => (
                              <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2 font-mono text-sm">{key}</td>
                                <td className="px-4 py-2 font-mono text-sm break-all">
                                  {typeof structureAnalysis.sampleValues[key] === 'object' 
                                    ? JSON.stringify(structureAnalysis.sampleValues[key])
                                    : String(structureAnalysis.sampleValues[key])}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
                
                {showRawData && data.products && data.products.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Raw Data (First Product)</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(data.products[0], null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Local Grids Data */}
            {localGridsData && (
              <div>
                <h2 className="text-xl font-bold mb-4">Local Grids Response</h2>
                <div className="bg-gray-100 p-4 rounded-md mb-6">
                  <p className="mb-2"><strong>Total Grids:</strong> {localGridsData.length || 0}</p>
                  
                  {localGridsData && localGridsData.length > 0 && (
                    <div className="mt-4">
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Search by name, area code, or municipality number..."
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                          }}
                        />
                      </div>
                      
                      <h3 className="text-lg font-semibold mb-2">
                        Local Grids (Showing {paginatedLocalGrids.length} of {filteredLocalGrids.length} results)
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="px-4 py-2 text-left">ID</th>
                              <th className="px-4 py-2 text-left">Name</th>
                              <th className="px-4 py-2 text-left">Area Code</th>
                              <th className="px-4 py-2 text-left">Municipality Number</th>
                              <th className="px-4 py-2 text-left">VAT Exemption</th>
                              <th className="px-4 py-2 text-left">ElCertificate Exemption</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedLocalGrids.map((grid, index) => (
                              <tr key={grid.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-4 py-2">{grid.id || 'N/A'}</td>
                                <td className="px-4 py-2 font-medium">{grid.name || 'N/A'}</td>
                                <td className="px-4 py-2">{grid.areaCode || 'N/A'}</td>
                                <td className="px-4 py-2">{grid.municipalityNumber || 'N/A'}</td>
                                <td className="px-4 py-2">{grid.vatExemption ? 'Yes' : 'No'}</td>
                                <td className="px-4 py-2">{grid.elCertificateExemption ? 'Yes' : 'No'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Pagination controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                          >
                            Previous
                          </button>
                          
                          <span>
                            Page {currentPage} of {totalPages}
                          </span>
                          
                          <button
                            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {showRawData && localGridsData && localGridsData.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Raw Data (First Local Grid)</h3>
                    <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(localGridsData[0], null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 