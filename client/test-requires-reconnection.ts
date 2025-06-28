import { requiresReconnection } from './src/shared/lib/device/device-recommendations';

// Test 1
const oldConfig1 = { ip: '192.168.1.100' };
const newConfig1 = { ip: '192.168.1.101' };
console.log('Test 1 - IP change:');
console.log('Old:', oldConfig1);
console.log('New:', newConfig1);
console.log('Result:', requiresReconnection(oldConfig1, newConfig1));
console.log('ip in oldConfig1:', 'ip' in oldConfig1);
console.log('ip in newConfig1:', 'ip' in newConfig1);
console.log('Values equal?', oldConfig1.ip === newConfig1.ip);

console.log('\n---\n');

// Test 2
const oldConfig2 = { authType: 'password' };
const newConfig2 = { authType: 'key' };
console.log('Test 2 - Auth type change:');
console.log('Old:', oldConfig2);
console.log('New:', newConfig2);
console.log('Result:', requiresReconnection(oldConfig2, newConfig2));
console.log('authType in oldConfig2:', 'authType' in oldConfig2);
console.log('authType in newConfig2:', 'authType' in newConfig2);
console.log('Values equal?', oldConfig2.authType === newConfig2.authType);