// This script will run when MongoDB initializes
db = db.getSiblingDB('ssm-test');

// Create a test user with known credentials
db.createCollection('users');

// Create a hashed password for the test user (using a simple mechanism for testing)
// In a real application, you'd use bcrypt or similar
const testUser = {
  name: 'Test User',
  username: 'test@example.com', // Use username field which is actually an email
  password: 'admin', // Plain text in seed file for simplicity
  role: 'admin',
  avatar: '/avatars/squirrel.svg',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Insert the test user
db.users.insertOne(testUser);

// Create an index on username for faster lookups
db.users.createIndex({ username: 1 }, { unique: true });

// Create empty collections for other data
db.createCollection('devices');
db.createCollection('containers');
db.createCollection('playbooks');

// Print confirmation
print('MongoDB test database initialized with test user');