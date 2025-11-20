#!/usr/bin/env bun
import { serve } from 'bun';
import { readFile } from 'fs/promises';
import { join } from 'path';

const PORT = process.env.PORT || 8000;

serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    
    // Default to index.html for root
    if (pathname === '/') {
      pathname = '/example/index.html';
    }
    
    // Remove leading slash for file path
    const filePath = join(process.cwd(), pathname.slice(1));
    
    try {
      const file = await readFile(filePath);
      
      // Determine content type
      let contentType = 'text/plain';
      if (pathname.endsWith('.html')) contentType = 'text/html';
      else if (pathname.endsWith('.js')) contentType = 'application/javascript';
      else if (pathname.endsWith('.css')) contentType = 'text/css';
      
      return new Response(file, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache'
        }
      });
    } catch (error) {
      return new Response('File not found', { status: 404 });
    }
  },
});

console.log(`🚀 DuxWind server running on http://localhost:${PORT}`);
console.log(`📁 Example: http://localhost:${PORT}/example/`);