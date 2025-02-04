import { SecurityTest, TestGroup } from '../types';
import { sshTests } from './ssh';
import { systemTests } from './system';
import { networkTests } from './network';
import { authenticationTests } from './authentication';
import { fileSystemTests } from './filesystem';

// Group tests by category for easy access
export const testDatabase: TestGroup[] = [
  sshTests,
  systemTests,
  networkTests,
  authenticationTests,
  fileSystemTests
];

// Helper function to get all tests
export function getAllTests(): SecurityTest[] {
  return testDatabase.flatMap(group => group.tests);
}

// Helper function to get tests by category
export function getTestsByCategory(category: string): SecurityTest[] {
  const group = testDatabase.find(g => g.category === category);
  return group ? group.tests : [];
}

// Helper function to get tests by framework
export function getTestsByFramework(framework: string): SecurityTest[] {
  return getAllTests().filter(test => test.frameworks?.includes(framework));
}

// Helper function to get tests by platform
export function getTestsByPlatform(platform: string): SecurityTest[] {
  return getAllTests().filter(test => test.platforms.includes(platform));
}

// Helper function to get test by ID
export function getTestById(id: string): SecurityTest | undefined {
  return getAllTests().find(test => test.id === id);
}

// Helper function to get tests by tag
export function getTestsByTag(tag: string): SecurityTest[] {
  return getAllTests().filter(test => test.tags?.includes(tag));
}

// Helper function to resolve test dependencies
export function resolveTestDependencies(testId: string): string[] {
  const test = getTestById(testId);
  if (!test) return [];

  const dependencies: string[] = [...(test.dependencies || [])];
  test.dependencies?.forEach(depId => {
    dependencies.push(...resolveTestDependencies(depId));
  });

  return [...new Set(dependencies)]; // Remove duplicates
}

// Get test categories summary
export function getTestCategoriesSummary(): { 
  category: string; 
  count: number;
  frameworks: string[];
  platforms: string[];
}[] {
  const summary = testDatabase.map(group => {
    const tests = group.tests;
    const frameworks = new Set<string>();
    const platforms = new Set<string>();
    
    tests.forEach(test => {
      test.frameworks?.forEach(f => frameworks.add(f));
      test.platforms.forEach(p => platforms.add(p));
    });

    return {
      category: group.category,
      count: tests.length,
      frameworks: Array.from(frameworks),
      platforms: Array.from(platforms)
    };
  });

  return summary;
}
