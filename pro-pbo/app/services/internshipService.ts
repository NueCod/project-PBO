// app/services/internshipService.ts

// Ambil URL API dari environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'; // Pastikan ini sesuai

// Fetch all internships for students to browse
export const getAllInternships = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Get internships failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result.data || []; // Extract data from response, return empty array if null
  } catch (error) {
    console.error('Error fetching internships:', error);
    throw error;
  }
};

// Create a new internship (for companies)
export const createInternship = async (token: string, internshipData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(internshipData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Create internship failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result.data; // Return the created job data
  } catch (error) {
    console.error('Error creating internship:', error);
    throw error;
  }
};

// Get internships posted by the authenticated company
export const getCompanyInternships = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/company`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      // Check if it's the specific "Job not found" error
      if (response.status === 404 && errorData.message && errorData.message.includes('Job not found')) {
        // Return empty array instead of throwing error for "no jobs found" case
        console.log('No company jobs found (404), returning empty array');
        return [];
      } else {
        throw new Error(`Get company internships failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
      }
    }

    const result = await response.json();
    console.log('Raw API response for company internships:', result); // Debug log
    return result.data || []; // Extract data from response, return empty array if null
  } catch (error) {
    console.error('Error fetching company internships:', error);
    throw error;
  }
};

// Get specific internship by ID
export const getInternshipById = async (id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Get internship failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result.data; // Return the job data
  } catch (error) {
    console.error('Error fetching internship by ID:', error);
    throw error;
  }
};

// Update an existing internship
export const updateInternship = async (token: string, id: string, internshipData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(internshipData),
    });

    console.log(`Making PUT request to: ${API_BASE_URL}/jobs/${id} with data:`, internshipData); // Debug log

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      console.error('Full error response for update internship:', errorData); // Debug log
      throw new Error(`Update internship failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Update internship response:', result); // Debug log
    return result.data; // Return the updated job data
  } catch (error) {
    console.error('Error updating internship:', error);
    throw error;
  }
};

// Delete an internship
export const deleteInternship = async (token: string, id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Delete internship failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result; // Return response message
  } catch (error) {
    console.error('Error deleting internship:', error);
    throw error;
  }
};

// Close an internship (deactivate it)
export const closeInternship = async (token: string, id: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/jobs/${encodeURIComponent(id)}/close`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Close internship failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result; // Return response message
  } catch (error) {
    console.error('Error closing internship:', error);
    throw error;
  }
};