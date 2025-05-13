/**
 * Initialization script for test data
 * This script will be copied to the server and run on startup in test mode
 */
// @ts-nocheck
/* eslint-disable */
// This file is written as JavaScript with TypeScript annotations

const { Logger } = require('@nestjs/common');
const crypto = require('crypto');

async function initTestData(mongo) {
  const logger = new Logger('InitTestData');
  
  try {
    // Check if users exist
    const usersCollection = mongo.collection('users');
    const usersCount = await usersCollection.countDocuments();
    
    if (usersCount === 0) {
      logger.log('No users found. Creating test user...');
      
      // Create a test user with hashed password
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto
        .pbkdf2Sync('admin', salt, 10000, 64, 'sha512')
        .toString('hex');
      
      // Create both formats to ensure compatibility
      const testUser1 = {
        name: 'Test User',
        username: 'test@example.com',
        email: 'test@example.com', // Include both username and email
        password: `${salt}:${hash}`,  // Store password in format salt:hash
        role: 'admin',
        avatar: '/avatars/squirrel.svg',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Try to insert the user (ignoring duplicate errors)
      try {
        await usersCollection.insertOne(testUser1);
        logger.log('Test user created successfully (format 1)');
      } catch (error) {
        if (error.code === 11000) {
          logger.log('User already exists (duplicate key)');
        } else {
          // If it's not a duplicate key error, log it
          logger.error('Error creating test user (format 1):', error);
          
          // Try alternate format
          const testUser2 = {
            name: 'Test User 2',
            email: 'test2@example.com', 
            password: `${salt}:${hash}`,  // Store password in format salt:hash
            role: 'admin',
            avatar: '/avatars/squirrel.svg',
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          try {
            await usersCollection.insertOne(testUser2);
            logger.log('Test user created successfully (format 2)');
          } catch (userError) {
            logger.error('Error creating test user (format 2):', userError);
          }
        }
      }
    } else {
      logger.log(`Users already exist (${usersCount} found)`);
    }
    
    // Initialize empty collections for other test data if needed
    const collections = [
      'devices',
      'containers',
      'playbooks',
      'automations'
    ];
    
    for (const collection of collections) {
      const exists = await mongo.listCollections({ name: collection }).hasNext();
      if (!exists) {
        logger.log(`Creating ${collection} collection...`);
        await mongo.createCollection(collection);
      }
    }
    
    // Add a test device if none exist
    const devicesCollection = mongo.collection('devices');
    const devicesCount = await devicesCollection.countDocuments();
    
    if (devicesCount === 0) {
      logger.log('No devices found. Creating test device...');
      
      const testDevice = {
        name: 'Test Device',
        hostname: 'test-device',
        ipAddress: '192.168.1.100',
        description: 'Created by test initialization',
        type: 'server',
        connectionType: 'ssh',
        sshDetails: {
          username: 'testuser',
          password: 'testpassword', // For testing only
          port: 22
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      try {
        await devicesCollection.insertOne(testDevice);
        logger.log('Test device created successfully');
      } catch (error) {
        logger.error('Error creating test device:', error);
      }
    }
    
    logger.log('Test data initialization complete');
    return true;
  } catch (error) {
    logger.error('Error initializing test data:', error);
    return false;
  }
}

module.exports = { initTestData };