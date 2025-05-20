import { INestApplication } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Route discovery utility to help with API endpoint test coverage
 */

interface RouteInfo {
  path: string;
  method: string;
  controller: string;
  handler: string;
  isPublic: boolean;
  hasTest: boolean;
}

/**
 * Extracts all routes from the NestJS application
 * @param app NestJS application instance
 * @returns Array of route information objects
 */
export function extractRoutes(app: INestApplication): RouteInfo[] {
  const server = app.getHttpServer();
  const router = server._events.request._router;
  
  const routes: RouteInfo[] = [];
  
  // Extract routes from the Express router
  router.stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase());
      
      methods.forEach(method => {
        routes.push({
          path,
          method,
          controller: 'Unknown', // We'll need metadata to get this
          handler: 'Unknown',    // We'll need metadata to get this
          isPublic: false,       // We'll need metadata to get this
          hasTest: false,        // Will be set later
        });
      });
    }
  });
  
  return routes;
}

/**
 * Checks if a route has a corresponding test file
 * @param routes Array of route information
 * @param testDir Directory containing test files
 * @returns Updated array with hasTest flag set
 */
export function checkTestCoverage(routes: RouteInfo[], testDir: string): RouteInfo[] {
  // Get all test files in the test directory (recursive)
  const testFiles = getAllFiles(testDir, []);
  
  // For each route, check if there's a test file that might cover it
  return routes.map(route => {
    // Extract the path parts to match against test file names
    const pathParts = route.path.split('/').filter(part => part && !part.startsWith(':'));
    
    // Check if any test file contains code that tests this route
    const hasTest = testFiles.some(file => {
      // Read file content
      const content = fs.readFileSync(file, 'utf8');
      
      // Check if the file mentions the route path or parts of it
      const pathMatch = pathParts.some(part => content.includes(`'/${part}'`) || content.includes(`"/${part}"`));
      
      // Check if the file mentions the HTTP method
      const methodMatch = content.includes(`.${route.method.toLowerCase()}(`) || 
                           content.includes(`'${route.method}'`) || 
                           content.includes(`"${route.method}"`);
      
      return pathMatch && methodMatch;
    });
    
    return { ...route, hasTest };
  });
}

/**
 * Helper function to recursively get all files in a directory
 * @param dirPath Directory to scan
 * @param arrayOfFiles Array to accumulate results
 * @returns Array of all file paths
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[]): string[] {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.test.ts') || filePath.endsWith('.spec.ts')) {
      arrayOfFiles.push(filePath);
    }
  });
  
  return arrayOfFiles;
}

/**
 * Generates a report of API endpoint test coverage
 * @param routes Array of route information
 * @param outputFile Path to write the report
 */
export function generateCoverageReport(routes: RouteInfo[], outputFile: string): void {
  // Calculate coverage statistics
  const totalRoutes = routes.length;
  const testedRoutes = routes.filter(route => route.hasTest).length;
  const coveragePercentage = (testedRoutes / totalRoutes) * 100;
  
  // Group routes by controller
  const routesByController = routes.reduce((acc, route) => {
    const controller = route.controller || 'Unknown';
    if (!acc[controller]) {
      acc[controller] = [];
    }
    acc[controller].push(route);
    return acc;
  }, {} as Record<string, RouteInfo[]>);
  
  // Generate markdown report
  let report = `# API Endpoint Test Coverage Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Coverage Summary\n\n`;
  report += `- Total Routes: ${totalRoutes}\n`;
  report += `- Tested Routes: ${testedRoutes}\n`;
  report += `- Coverage: ${coveragePercentage.toFixed(2)}%\n\n`;
  
  report += `## Routes by Controller\n\n`;
  
  Object.entries(routesByController).forEach(([controller, controllerRoutes]) => {
    report += `### ${controller}\n\n`;
    report += `| Method | Path | Tested | Public |\n`;
    report += `|--------|---------|--------|--------|\n`;
    
    controllerRoutes.forEach(route => {
      report += `| ${route.method} | ${route.path} | ${route.hasTest ? '✅' : '❌'} | ${route.isPublic ? '✅' : '❌'} |\n`;
    });
    
    report += `\n`;
  });
  
  // Write the report to a file
  fs.writeFileSync(outputFile, report);
}

/**
 * Creates a report of all API endpoints and their test coverage
 * @param app NestJS application instance
 * @param testDir Directory containing test files
 * @param outputFile Path to write the report
 */
export function createApiTestCoverageReport(
  app: INestApplication, 
  testDir: string,
  outputFile: string
): void {
  // Extract all routes
  const routes = extractRoutes(app);
  
  // Check test coverage
  const routesWithCoverage = checkTestCoverage(routes, testDir);
  
  // Generate and write the report
  generateCoverageReport(routesWithCoverage, outputFile);
}