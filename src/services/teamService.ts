import axios from 'axios';

const API_URL = 'http://localhost:5000/api/team-members';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  status: 'active' | 'inactive';
  currentLocation: string;
  totalSales: number;
  dealsCount: number;
  lastActivity: string;
}

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Fetch the team members with authentication
    const response = await axios.get(API_URL, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in getTeamMembers:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
    }
    throw error;
  }
};

export const searchTeamMembers = async (query: string): Promise<{ id: string; name: string; email: string }[]> => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Search team members with authentication
    const response = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching team members:', error);
    throw error;
  }
};

export const addTeamMember = async (member: Omit<TeamMember, 'id' | 'lastActivity'>): Promise<TeamMember> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(API_URL, member, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding team member:', error);
    throw error;
  }
};

export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put(`${API_URL}/${id}`, updates, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating team member:', error);
    throw error;
  }
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    await axios.delete(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Error deleting team member:', error);
    throw error;
  }
};

export const toggleTeamMemberStatus = async (id: string, currentStatus: 'active' | 'inactive'): Promise<TeamMember> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.patch(`${API_URL}/${id}/status`, { 
      status: currentStatus === 'active' ? 'inactive' : 'active' 
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling team member status:', error);
    throw error;
  }
};
