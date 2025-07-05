const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'team-members.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory exists
const ensureDataFile = async () => {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    try {
      await fs.access(DATA_FILE);
    } catch {
      // File doesn't exist, create with default data
      const defaultData = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice.johnson@company.com',
          phone: '+1-555-0201',
          region: 'Downtown',
          status: 'active',
          currentLocation: 'Tech District',
          totalSales: 374850,
          dealsCount: 12,
          lastActivity: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob.smith@company.com',
          phone: '+1-555-0202',
          region: 'Suburbs',
          status: 'active',
          currentLocation: 'Retail Park',
          totalSales: 266560,
          dealsCount: 8,
          lastActivity: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Charlie Brown',
          email: 'charlie.brown@company.com',
          phone: '+1-555-0203',
          region: 'Industrial',
          status: 'inactive',
          currentLocation: 'Office',
          totalSales: 233240,
          dealsCount: 7,
          lastActivity: '2024-01-14T09:15:00Z',
        },
      ];
      await fs.writeFile(DATA_FILE, JSON.stringify(defaultData, null, 2));
    }
  } catch (error) {
    console.error('Error setting up data file:', error);
  }
};

// Read data from file
const readData = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return [];
  }
};

// Write data to file
const writeData = async (data) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data file:', error);
    throw error;
  }
};

// API Routes
app.get('/api/team-members', async (req, res) => {
  try {
    const members = await readData();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

app.post('/api/team-members', async (req, res) => {
  try {
    const members = await readData();
    const newMember = {
      ...req.body,
      id: Date.now().toString(),
      lastActivity: new Date().toISOString()
    };
    members.unshift(newMember);
    await writeData(members);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

app.put('/api/team-members/:id', async (req, res) => {
  try {
    const members = await readData();
    const index = members.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    const updatedMember = {
      ...members[index],
      ...req.body,
      lastActivity: new Date().toISOString()
    };
    
    members[index] = updatedMember;
    await writeData(members);
    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

app.patch('/api/team-members/:id/status', async (req, res) => {
  try {
    const members = await readData();
    const index = members.findIndex(m => m.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    const updatedMember = {
      ...members[index],
      status: req.body.status,
      lastActivity: new Date().toISOString()
    };
    
    members[index] = updatedMember;
    await writeData(members);
    res.json(updatedMember);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update team member status' });
  }
});

app.delete('/api/team-members/:id', async (req, res) => {
  try {
    const members = await readData();
    const filtered = members.filter(m => m.id !== req.params.id);
    
    if (filtered.length === members.length) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    
    await writeData(filtered);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// Start server
const startServer = async () => {
  await ensureDataFile();
  
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer().catch(console.error);
