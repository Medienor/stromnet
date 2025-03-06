import { NextRequest, NextResponse } from 'next/server';

// Define interface for grid data
interface LocalGrid {
  name: string;
  // Add other properties that exist in the grid objects
  id?: string;
  code?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get name parameter from URL
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name');
    
    // Fetch the local grids data
    const response = await fetch('https://strom-api.forbrukerhelt.no/local_grids');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const allGrids = await response.json() as LocalGrid[];
    
    // Filter by name if provided
    let filteredGrids = allGrids;
    if (name) {
      // Normalize the search term and grid names for comparison
      const normalizedName = name.toLowerCase().trim();
      
      filteredGrids = allGrids.filter((grid: LocalGrid) => {
        const gridName = grid.name.toLowerCase();
        return gridName === normalizedName || 
               gridName.includes(normalizedName) ||
               normalizedName.includes(gridName);
      });
    }
    
    return NextResponse.json({
      success: true,
      data: filteredGrids
    });
  } catch (error: unknown) {
    console.error('Error fetching local grids:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch local grids data'
    }, { status: 500 });
  }
} 