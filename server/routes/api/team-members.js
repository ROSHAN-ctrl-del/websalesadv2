import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Fallback team members data when MongoDB is not available
const fallbackTeamMembers = [
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
    lastActivity: '2025-07-03T11:55:19.750Z'
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
    lastActivity: '2025-07-03T11:55:19.754Z'
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
    lastActivity: '2024-01-14T09:15:00Z'
  }
];

// GET /api/team-members - Get all team members (sales persons)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // For now, always use fallback data since MongoDB is not connected
    console.log('Using fallback data for team members');
    res.json(fallbackTeamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// GET /api/team-members/search - Search team members for autocomplete
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = (q as string)?.toLowerCase() || '';
    
    // Filter team members based on search term
    const filteredMembers = fallbackTeamMembers.filter(member => 
      member.name.toLowerCase().includes(searchTerm) ||
      member.email.toLowerCase().includes(searchTerm)
    );
    
    // Return only name and id for autocomplete
    const suggestions = filteredMembers.map(member => ({
      id: member.id,
      name: member.name,
      email: member.email
    }));
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error searching team members:', error);
    res.status(500).json({ error: 'Failed to search team members' });
  }
});

// POST /api/team-members - Add new team member
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Try to use MongoDB if available
    try {
      const SalesPerson = (await import('../../models/SalesPerson.js')).default;
      const newMember = new SalesPerson(req.body);
      const savedMember = await newMember.save();
      res.status(201).json(savedMember);
    } catch (mongoError) {
      // Fallback to static data if MongoDB is not available
      console.log('Using fallback data for adding team member');
      const newMember = {
        ...req.body,
        id: Date.now().toString(),
        lastActivity: new Date().toISOString()
      };
      fallbackTeamMembers.unshift(newMember);
      res.status(201).json(newMember);
    }
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

// PUT /api/team-members/:id - Update team member
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Try to use MongoDB if available
    try {
      const SalesPerson = (await import('../../models/SalesPerson.js')).default;
      const updatedMember = await SalesPerson.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedMember) return res.status(404).json({ error: 'Team member not found' });
      res.json(updatedMember);
    } catch (mongoError) {
      // Fallback to static data if MongoDB is not available
      console.log('Using fallback data for updating team member');
      const index = fallbackTeamMembers.findIndex(m => m.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Team member not found' });
      
      const updatedMember = {
        ...fallbackTeamMembers[index],
        ...req.body,
        lastActivity: new Date().toISOString()
      };
      fallbackTeamMembers[index] = updatedMember;
      res.json(updatedMember);
    }
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// DELETE /api/team-members/:id - Delete team member
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Try to use MongoDB if available
    try {
      const SalesPerson = (await import('../../models/SalesPerson.js')).default;
      const deletedMember = await SalesPerson.findByIdAndDelete(req.params.id);
      if (!deletedMember) return res.status(404).json({ error: 'Team member not found' });
      res.status(204).send();
    } catch (mongoError) {
      // Fallback to static data if MongoDB is not available
      console.log('Using fallback data for deleting team member');
      const index = fallbackTeamMembers.findIndex(m => m.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Team member not found' });
      
      fallbackTeamMembers.splice(index, 1);
      res.status(204).send();
    }
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

// PATCH /api/team-members/:id/status - Toggle team member status
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    // Try to use MongoDB if available
    try {
      const SalesPerson = (await import('../../models/SalesPerson.js')).default;
      const updatedMember = await SalesPerson.findByIdAndUpdate(
        req.params.id, 
        { status: req.body.status }, 
        { new: true }
      );
      if (!updatedMember) return res.status(404).json({ error: 'Team member not found' });
      res.json(updatedMember);
    } catch (mongoError) {
      // Fallback to static data if MongoDB is not available
      console.log('Using fallback data for toggling team member status');
      const index = fallbackTeamMembers.findIndex(m => m.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Team member not found' });
      
      const updatedMember = {
        ...fallbackTeamMembers[index],
        status: req.body.status,
        lastActivity: new Date().toISOString()
      };
      fallbackTeamMembers[index] = updatedMember;
      res.json(updatedMember);
    }
  } catch (error) {
    console.error('Error toggling team member status:', error);
    res.status(500).json({ error: 'Failed to update team member status' });
  }
});

export default router;
