import { Plugin } from 'vite';

/**
 * Vite plugin to remove admin code from production builds
 */
export function removeAdminPlugin(): Plugin {
  const isProduction = process.env.NODE_ENV === 'production';
  const adminEnabled = process.env.ADMIN_ENABLED === 'true';
  
  // In production, admin must be explicitly disabled
  if (isProduction && adminEnabled) {
    throw new Error('Admin panel cannot be enabled in production builds!');
  }
  
  return {
    name: 'remove-admin',
    
    // Transform imports to remove admin components
    resolveId(id) {
      if (!isProduction || adminEnabled) return null;
      
      // Block resolution of admin-related modules
      if (id.includes('/admin') || 
          id.includes('Admin') || 
          id.includes('admin-')) {
        console.log(`[ADMIN REMOVAL] Blocking module: ${id}`);
        return { id: 'data:text/javascript,export default {}', external: false };
      }
      
      return null;
    },
    
    // Transform code to remove admin routes and components
    transform(code, id) {
      if (!isProduction || adminEnabled) return null;
      
      // Skip transformation for non-JS files
      if (!id.match(/\.(tsx?|jsx?|mjs)$/)) return null;
      
      let transformedCode = code;
      
      // Remove admin route imports
      transformedCode = transformedCode.replace(
        /import\s+.*?from\s+['"].*?\/admin.*?['"];?\n?/g,
        ''
      );
      
      // Remove lazy-loaded admin routes
      transformedCode = transformedCode.replace(
        /const\s+\w+\s*=\s*lazy\(\s*\(\)\s*=>\s*import\(['"].*?\/admin.*?['"]\)\s*\);?\n?/g,
        ''
      );
      
      // Remove admin route definitions from React Router
      transformedCode = transformedCode.replace(
        /<Route\s+[^>]*path=['"]\/admin[^>]*>.*?<\/Route>/gs,
        ''
      );
      
      // Remove admin navigation links
      transformedCode = transformedCode.replace(
        /<(?:Link|NavLink)\s+[^>]*to=['"]\/admin[^>]*>.*?<\/(?:Link|NavLink)>/gs,
        ''
      );
      
      // Log if significant changes were made
      if (transformedCode !== code) {
        console.log(`[ADMIN REMOVAL] Transformed: ${id}`);
      }
      
      return transformedCode;
    },
    
    // Exclude admin chunks from build
    generateBundle(options, bundle) {
      if (!isProduction || adminEnabled) return;
      
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.includes('admin') || fileName.includes('Admin')) {
          console.log(`[ADMIN REMOVAL] Removing chunk: ${fileName}`);
          delete bundle[fileName];
        }
      }
    },
  };
}