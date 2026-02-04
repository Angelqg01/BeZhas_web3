# MongoDB initialization script
# This script runs when the container is first created

# Create application user with read/write permissions
db = db.getSiblingDB('bezhas_web3');

db.createUser({
  user: process.env.MONGODB_USER,
  pwd: process.env.MONGODB_PASSWORD,
  roles: [
    {
      role: 'readWrite',
      db: 'bezhas_web3'
    }
  ]
});

# Create initial collections (optional)
db.createCollection('users');
db.createCollection('transactions');
db.createCollection('contracts');

print('MongoDB initialized successfully for BeZhas Web3');
