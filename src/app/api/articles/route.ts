import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Fetch articles from Supabase
    const { data: articles, error } = await supabase
      .from('articles')
      .select('ID, Slug, Date, Title, "Image URL"')
      .eq('Status', 'publish');
    
    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }
    
    // Map articles to include local image paths if they exist
    const articlesWithImages = articles.map(article => {
      // Check for different image formats
      const possibleExtensions = ['png', 'webp', 'jpg', 'jpeg'];
      let foundImagePath = null;
      
      for (const ext of possibleExtensions) {
        // Define the expected image path
        const imagePath = `/images/${article.ID}.${ext}`;
        
        // Check if the image exists in the public folder
        const fullImagePath = path.join(process.cwd(), 'public', imagePath);
        
        if (fs.existsSync(fullImagePath)) {
          foundImagePath = imagePath;
          break;
        }
      }
      
      // Override the Image URL if a local image is found
      if (foundImagePath) {
        return {
          ...article,
          "Image URL": foundImagePath
        };
      }
      
      return article;
    });
    
    return NextResponse.json({ 
      success: true, 
      articles: articlesWithImages 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 