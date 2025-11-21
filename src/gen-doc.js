// DuxWind Documentation Generator
import { getConfig } from './core.js';

/**
 * Generate documentation HTML for properties and keywords
 * @returns {string} HTML documentation
 */
export function generateDoc() {
  const config = getConfig();
  const props = config.props || {};
  const keywords = config.keywords || {};
  
  // Inject filterDocs function to window if available
  if (typeof window !== 'undefined') {
    window.filterDocs = function(searchTerm) {
      var s = searchTerm.toLowerCase().trim();
      var rows = document.querySelectorAll('.doc-row');
      var results = document.getElementById('search-results');
      var total = rows.length;
      var visible = 0;
      
      rows.forEach(function(row) {
        var matches = !s || row.innerHTML.toLowerCase().indexOf(s) !== -1;
        if (matches) {
          row.style.display = '';
          visible++;
        } else {
          row.style.display = 'none';
        }
      });
      
      results.textContent = s ? 
        'Showing ' + visible + ' of ' + total + ' items matching "' + s + '"' : 
        'Showing all ' + total + ' items';
    };
  }
  
  let html = `
    <div class="container">
      <h1 class="font-bold text-3xl mb-8">DuxWind Documentation</h1>
      
      <!-- Search Section -->
      <div class="mb-8">
        <div class="max-w-md mx-auto">
          <input 
            type="text" 
            id="doc-search" 
            placeholder="Search properties and keywords..." 
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onkeyup="filterDocs(this.value)"
          >
        </div>
        <div class="text-center mt-2">
          <span id="search-results" class="text-sm text-gray-500">
            Showing all ${Object.keys(props).length + Object.keys(keywords).length} items
          </span>
        </div>
      </div>
      
      <!-- Properties Section -->
      <div class="mb-12">
        <h2 class="font-semibold text-2xl mb-6">CSS Properties (${Object.keys(props).length})</h2>
        <div class="overflow-x-auto">
          <table class="w-full bg-white border border-gray-200 rounded-lg">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Class</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">CSS Property</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Example</th>
              </tr>
            </thead>
            <tbody id="properties-table">
  `;
  
  // Add ALL property documentation
  Object.entries(props).forEach(([prop, css]) => {
    const cssDisplay = Array.isArray(css) ? css.join(', ') : css;
    const exampleClass = `${prop}-4`;
    html += `
              <tr class="doc-row border-b border-gray-100 hover:bg-gray-50" data-type="property">
                <td class="px-4 py-3 font-mono text-sm text-blue-600">${prop}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${cssDisplay}</td>
                <td class="px-4 py-3"><code class="bg-gray-100 px-2 py-1 rounded text-xs font-mono">${exampleClass}</code></td>
              </tr>
    `;
  });
  
  html += `
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Keywords Section -->
      <div class="mb-12">
        <h2 class="font-semibold text-2xl mb-6">CSS Keywords (${Object.keys(keywords).length})</h2>
        <div class="overflow-x-auto">
          <table class="w-full bg-white border border-gray-200 rounded-lg">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Class</th>
                <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">CSS Declaration</th>
              </tr>
            </thead>
            <tbody id="keywords-table">
  `;
  
  // Add ALL keyword documentation
  Object.entries(keywords).forEach(([keyword, css]) => {
    html += `
              <tr class="doc-row border-b border-gray-100 hover:bg-gray-50" data-type="keyword">
                <td class="px-4 py-3 font-mono text-sm text-green-600">${keyword}</td>
                <td class="px-4 py-3 text-sm text-gray-700">${css}</td>
              </tr>
    `;
  });
  
  html += `
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  return html;
}