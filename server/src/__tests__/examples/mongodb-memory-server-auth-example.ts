import { MongoMemoryServer, MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

// Example 1: Basic Authentication with MongoMemoryServer
async function basicAuthExample() {
  // Create server with auth enabled
  const mongoServer = await MongoMemoryServer.create({
    auth: {
      enable: true,
      customRootName: 'admin',      // Root username
      customRootPwd: 'adminpass',    // Root password
    },
  });

  // Connect as root to create users
  const uri = mongoServer.getUri();
  const adminClient = new MongoClient(uri, {
    auth: {
      username: 'admin',
      password: 'adminpass',
    },
    authSource: 'admin',
  });

  await adminClient.connect();
  
  // Create users in different databases
  await adminClient.db('myapp').command({
    createUser: 'appuser',
    pwd: 'apppass',
    roles: [
      { role: 'readWrite', db: 'myapp' },
      { role: 'readWrite', db: 'logs' },
    ],
  });

  await adminClient.close();

  // Now connect as the created user
  const userClient = new MongoClient(
    `mongodb://appuser:apppass@${uri.replace('mongodb://', '').split('/')[0]}/myapp?authSource=myapp`
  );
  await userClient.connect();
  
  // Use the connection...
  await userClient.close();
  await mongoServer.stop();
}

// Example 2: Using Replica Set for More Complex Auth Scenarios
async function replicaSetAuthExample() {
  // Replica set supports more auth features
  const mongoServer = await MongoMemoryReplSet.create({
    replSet: {
      count: 1,  // Single node replica set
      storageEngine: 'wiredTiger',
    },
    auth: {
      enable: true,
      customRootName: 'root',
      customRootPwd: 'rootpass',
    },
  });

  await mongoServer.waitUntilRunning();

  const uri = mongoServer.getUri();
  
  // Connect as root
  const adminClient = new MongoClient(`${uri}admin?authSource=admin`, {
    auth: { username: 'root', password: 'rootpass' },
  });
  
  await adminClient.connect();

  // Create users in different databases
  // User in 'admin' database
  await adminClient.db('admin').command({
    createUser: 'adminuser',
    pwd: 'adminpass',
    roles: [{ role: 'root', db: 'admin' }],
  });

  // User in custom database
  await adminClient.db('customdb').command({
    createUser: 'customuser',
    pwd: 'custompass',
    roles: [
      { role: 'readWrite', db: 'customdb' },
      { role: 'readWrite', db: 'anotherdb' },
    ],
  });

  await adminClient.close();
  
  // Test different auth scenarios
  // This works - user exists in customdb
  const customClient = new MongoClient(
    `${uri}customdb?authSource=customdb`,
    { auth: { username: 'customuser', password: 'custompass' } }
  );
  await customClient.connect();
  await customClient.close();

  // This fails - wrong authSource
  try {
    const wrongClient = new MongoClient(
      `${uri}customdb?authSource=admin`,
      { auth: { username: 'customuser', password: 'custompass' } }
    );
    await wrongClient.connect();
  } catch (error) {
    console.log('Expected error:', error.message); // Authentication failed
  }

  await mongoServer.stop();
}

// Example 3: Complete Test Setup with Both Auth and No-Auth
async function completeTestSetup() {
  // 1. Server WITHOUT authentication
  const noAuthServer = await MongoMemoryServer.create({
    instance: {
      auth: false,  // Explicitly disable auth
    },
  });

  // 2. Server WITH authentication
  const authServer = await MongoMemoryServer.create({
    auth: {
      enable: true,
      customRootName: 'root',
      customRootPwd: 'rootpass',
    },
  });

  // Setup users on auth server
  const authUri = authServer.getUri();
  const setupClient = new MongoClient(authUri, {
    auth: { username: 'root', password: 'rootpass' },
    authSource: 'admin',
  });
  
  await setupClient.connect();
  
  // Create user in specific database (simulating mash-ssm scenario)
  await setupClient.db('mash-ssm').command({
    createUser: 'mash-ssm',
    pwd: 'password',
    roles: [
      { role: 'readWrite', db: 'mash-ssm' },
      { role: 'readWrite', db: 'logs' },
    ],
  });
  
  await setupClient.close();

  // Test connections
  // No-auth connection
  const noAuthClient = new MongoClient(noAuthServer.getUri());
  await noAuthClient.connect();
  console.log('Connected without auth');
  await noAuthClient.close();

  // Auth connection with correct authSource
  const authClient = new MongoClient(
    `mongodb://mash-ssm:password@${authUri.replace('mongodb://', '').split('/')[0]}/mash-ssm?authSource=mash-ssm`
  );
  await authClient.connect();
  console.log('Connected with auth');
  await authClient.close();

  // Cleanup
  await noAuthServer.stop();
  await authServer.stop();
}

// Example 4: Configuration Options
const authOptions = {
  // Basic auth
  auth: {
    enable: true,
    customRootName: 'myroot',     // Default: 'mongodb-memory-server-root'
    customRootPwd: 'mypassword',   // Default: 'rootuser'
  },
  
  // Instance options
  instance: {
    port: 27018,                   // Custom port
    auth: true,                    // Alternative way to enable auth
  },
};

// Example 5: Creating Users with Different Roles
async function createUsersExample() {
  const server = await MongoMemoryServer.create({
    auth: { enable: true },
  });

  const adminClient = new MongoClient(server.getUri(), {
    auth: {
      username: 'mongodb-memory-server-root',  // Default root user
      password: 'rootuser',                    // Default root password
    },
    authSource: 'admin',
  });

  await adminClient.connect();

  // Different user creation patterns
  
  // 1. User with multiple database access
  await adminClient.db('admin').command({
    createUser: 'multiDbUser',
    pwd: 'password',
    roles: [
      { role: 'readWrite', db: 'db1' },
      { role: 'readWrite', db: 'db2' },
      { role: 'read', db: 'db3' },
    ],
  });

  // 2. User in specific database (auth source)
  await adminClient.db('myAuthDb').command({
    createUser: 'specificDbUser',
    pwd: 'password',
    roles: [
      { role: 'dbOwner', db: 'myAuthDb' },
    ],
  });

  // 3. Admin user
  await adminClient.db('admin').command({
    createUser: 'superadmin',
    pwd: 'superpass',
    roles: [
      { role: 'root', db: 'admin' },
    ],
  });

  await adminClient.close();
  await server.stop();
}

// Export examples
export {
  basicAuthExample,
  replicaSetAuthExample,
  completeTestSetup,
  createUsersExample,
};