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
    console.error('Error fetching internships: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};

// Create a new internship (for companies)
export const createInternship = async (token: string, internshipData: any) => {
  try {
    console.log('Creating internship with token:', token ? 'present' : 'missing'); // Debug log

    // Check if token exists before making request
    if (!token) {
      console.error('No token provided for createInternship');
      throw new Error('No authentication token provided');
    }

    console.log('Internship data being sent:', internshipData); // Debug log

    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(internshipData),
    });

    console.log('Create response status:', response.status); // Debug log
    console.log('Create response ok:', response.ok); // Debug log

    if (!response.ok) {
      // Try to get the error response as text first, then try JSON
      let errorData;
      let rawText = '';
      try {
        rawText = await response.text(); // Get as text first
        console.log('Raw error response text:', rawText); // Debug log

        // Check if rawText is empty or just whitespace before parsing
        if (rawText.trim() === '') {
          // If response body is empty, create a default error object
          errorData = { message: `HTTP error ${response.status}`, raw_response: 'Empty response body' };
        } else {
          try {
            errorData = JSON.parse(rawText); // Then try to parse as JSON
          } catch (jsonParseError) {
            // If JSON parsing fails, return the raw text as part of the error object
            console.warn('Failed to parse error response as JSON:', jsonParseError);
            errorData = {
              message: `HTTP error ${response.status}`,
              raw_response: rawText,
              parse_error: 'Failed to parse error response as JSON'
            };
          }
        }
      } catch (responseError) {
        // If getting text response fails, return as text or an object with status
        console.error('Failed to read response text:', responseError);
        errorData = {
          message: `HTTP error ${response.status}`,
          raw_response: 'Failed to read response text',
          read_error: responseError instanceof Error ? responseError.message : String(responseError)
        };
      }

      // Log detailed error response data to help identify the problem
      console.error('Detailed create error response data: Object received with ' + (typeof errorData === 'object' && errorData !== null ? Object.keys(errorData).length + ' keys' : 'non-object')); // More informative log

      // Handle unauthenticated error specifically
      if (response.status === 401) {
        // Check if the errorData has unauthenticated message or unauthorized access
        const isUnauthorized = (
          (typeof errorData === 'object' && errorData.message && typeof errorData.message === 'string' &&
            (errorData.message.includes('Unauthenticated') || errorData.message.includes('Unauthorized access'))) ||
          (typeof errorData === 'string' && (errorData.includes('Unauthenticated') || errorData.includes('Unauthorized access')))
        );

        if (isUnauthorized) {
          console.log('Unauthorized request for internship creation');
        }
      }

      // Special handling for empty error response object
      if (typeof errorData === 'object' && errorData !== null && Object.keys(errorData).length === 0) {
        console.warn('Empty error object received for create internship');
        errorData = { message: `HTTP error ${response.status}`, raw_response: 'Empty error response' };
      }

      throw new Error(`Create internship failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    // If response is OK, parse and return the data
    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse successful response as JSON: ' + (jsonError instanceof Error ? jsonError.message : 'Unknown error'));
      throw new Error('Failed to parse response data from server');
    }

    console.log('Create API response: Object with ' + (typeof result === 'object' && result !== null ? Object.keys(result).length + ' keys' : 'non-object')); // Debug log
    return result.data; // Return the created job data
  } catch (error) {
    console.error('Error creating internship: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};

// Get internships posted by the authenticated company
export const getCompanyInternships = async (token: string) => {
  try {
    console.log('Fetching company internships with token:', token ? 'present' : 'missing'); // Debug log

    // Check if token exists before making request
    if (!token) {
      console.error('No token provided for getCompanyInternships');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/jobs/company`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status); // Debug log
    console.log('Response ok:', response.ok); // Debug log

    if (!response.ok) {
      // Try to get the error response as text first, then try JSON
      let errorData;
      let rawText = '';
      try {
        rawText = await response.text(); // Get as text first
        console.log('Raw error response text:', rawText); // Debug log

        // Check if rawText is empty or just whitespace before parsing
        if (rawText.trim() === '') {
          // If response body is empty, create a default error object
          errorData = { message: `HTTP error ${response.status}`, raw_response: 'Empty response body' };
        } else {
          try {
            errorData = JSON.parse(rawText); // Then try to parse as JSON
          } catch (jsonParseError) {
            // If JSON parsing fails, return the raw text as part of the error object
            console.warn('Failed to parse error response as JSON:', jsonParseError);
            errorData = {
              message: `HTTP error ${response.status}`,
              raw_response: rawText,
              parse_error: 'Failed to parse error response as JSON'
            };
          }
        }
      } catch (responseError) {
        // If getting text response fails, return as text or an object with status
        console.error('Failed to read response text:', responseError);
        errorData = {
          message: `HTTP error ${response.status}`,
          raw_response: 'Failed to read response text',
          read_error: responseError instanceof Error ? responseError.message : String(responseError)
        };
      }

      // Log detailed error response data to help identify the problem
      // Use only the safest logging to prevent console errors completely
      // Avoid logging objects directly to console which can cause error console
      if (typeof errorData === 'object' && errorData !== null) {
        const keys = Object.keys(errorData);
        if (keys.length === 0) {
          // For empty objects, use minimal safe logging
          console.error('Error: Empty object response');
        } else {
          // For non-empty objects, just log the count safely
          console.error('Error: Object response received with ' + keys.length + ' keys');
        }
      } else {
        // For non-object data, use safe logging
        console.error('Error: Non-object response');
      }

      // Handle unauthenticated error specifically - this should come first
      if (response.status === 401) {
        // Check if the errorData has unauthenticated message
        const isUnauthenticated = (
          (typeof errorData === 'object' && errorData.message && typeof errorData.message === 'string' && errorData.message.includes('Unauthenticated')) ||
          (typeof errorData === 'object' && typeof errorData.error === 'string' && errorData.error.includes('Unauthenticated')) ||
          (typeof errorData === 'string' && errorData.includes('Unauthenticated'))
        );

        if (isUnauthenticated) {
          console.log('Unauthenticated request, returning empty array');
          // Log this specific case as it may indicate lost authentication
          console.warn('User authentication has likely expired or is invalid for company jobs endpoint');
          return [];
        } else {
          // Even if status is 401 but no unauthenticated message, return empty array to prevent issues
          console.log('Authentication error without proper message, returning empty array');
          console.warn('Authentication failed for company jobs endpoint');
          return [];
        }
      }

      // Check if it's the specific "Job not found" error (both in status and message)
      const hasJobNotFound = (
        (typeof errorData === 'object' && errorData.message && typeof errorData.message === 'string' && errorData.message.includes('Job not found')) ||
        (typeof errorData === 'string' && errorData.includes('Job not found'))
      );

      if ((response.status === 404 || hasJobNotFound) && hasJobNotFound) {
        // Return empty array instead of throwing error for "no jobs found" case
        console.log('No company jobs found, returning empty array');
        return [];
      }

      // Special handling for empty error response object
      if (typeof errorData === 'object' && errorData !== null && Object.keys(errorData).length === 0) {
        console.warn('Empty error object received, returning empty array');
        return [];
      }

      // Handle other errors
      throw new Error(`Get company internships failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    // If response is OK, parse and return the data
    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse successful response as JSON: ' + (jsonError instanceof Error ? jsonError.message : 'Unknown error'));
      // Return empty array if successful response but can't parse as JSON
      return [];
    }

    // Log response data safely to avoid potential console errors
    if (result && typeof result === 'object') {
      // Use safe logging without printing the object directly to prevent console errors
      console.log('Raw API response for company internships: Object received with keys count: ' + (typeof result === 'object' && result !== null ? Object.keys(result).length : 0)); // Debug log
      console.log('Number of jobs returned:', result.data?.length || 0); // Debug log
    } else {
      console.log('Raw API response for company internships: Non-object response received');
    }

    // Check if the API returned success: false with "Job not found" message (even with 200 status)
    if (result.success === false && result.message && typeof result.message === 'string' && result.message.includes('Job not found')) {
      console.log('API returned "Job not found" in response body, returning empty array');
      return [];
    }

    return result.data || []; // Extract data from response, return empty array if null
  } catch (error) {
    console.error('Error fetching company internships:', error);
    // Return empty array in case of any errors to prevent breaking the UI
    return [];
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
      console.error('Full error response for update internship: Object with ' + (typeof errorData === 'object' && errorData !== null ? Object.keys(errorData).length + ' keys' : 'non-object')); // Debug log
      throw new Error(`Update internship failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Update internship response: Object with ' + (typeof result === 'object' && result !== null ? Object.keys(result).length + ' keys' : 'non-object')); // Debug log
    return result.data; // Return the updated job data
  } catch (error) {
    console.error('Error updating internship: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    console.error('Error deleting internship: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
    console.error('Error closing internship: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};

// Get applications submitted by the authenticated student
export const getStudentApplications = async (token: string) => {
  try {
    console.log('Fetching student applications with token:', token ? 'present' : 'missing'); // Debug log
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status for student applications:', response.status); // Debug log
    console.log('Response ok for student applications:', response.ok); // Debug log

    if (!response.ok) {
      // Try to get the error response as text first, then try JSON
      let errorData;
      let rawText = '';
      try {
        rawText = await response.text(); // Get as text first

        // Check if rawText is empty or just whitespace before parsing
        if (rawText.trim() === '') {
          // If response body is empty, create a default error object
          errorData = { message: `HTTP error ${response.status}`, raw_response: 'Empty response body' };
        } else {
          errorData = JSON.parse(rawText); // Then try to parse as JSON
        }
      } catch (parseError) {
        // If parsing fails, return as text or an object with status
        errorData = { message: `HTTP error ${response.status}`, raw_response: rawText || `HTTP error ${response.status}` };
      }

      // Log error response data, but avoid logging empty objects
      if (errorData && Object.keys(errorData).length > 0) {
        console.error('Error response data for student applications: Object with ' + (typeof errorData === 'object' && errorData !== null ? Object.keys(errorData).length + ' keys' : 'non-object')); // Debug log
      } else {
        console.error('Error response data for student applications: Empty response or parsing failed');
      }

      // Handle unauthenticated error specifically
      if (response.status === 401 &&
          (typeof errorData === 'object' && errorData.message && typeof errorData.message === 'string' && errorData.message.includes('Unauthenticated'))) {
        // Return empty array for unauthenticated case to prevent infinite loading
        console.log('Unauthenticated request for student applications, returning empty array');
        return [];
      }

      throw new Error(`Get student applications failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Raw API response for student applications:', result); // Debug log
    console.log('Number of applications returned:', result.data?.length || 0); // Debug log

    return result.data || []; // Extract data from response, return empty array if null
  } catch (error) {
    console.error('Error fetching student applications: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};

// Submit a new application for a job
export const submitApplication = async (token: string, applicationData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      console.error('Submit application error response:', errorData); // Debug log
      throw new Error(`Submit application failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Submit application response:', result); // Debug log
    return result.data; // Return the created application data
  } catch (error) {
    console.error('Error submitting application: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};

// Confirm attendance for an interview
export const confirmAttendance = async (token: string, applicationId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${encodeURIComponent(applicationId)}/confirm-attendance`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
    });

    console.log(`Making PATCH request to confirm attendance for application ${applicationId}`); // Debug log

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      console.error('Confirm attendance error response:', errorData); // Debug log
      throw new Error(`Confirm attendance failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Confirm attendance response:', result); // Debug log
    return result.data; // Return the updated application data
  } catch (error) {
    console.error('Error confirming attendance: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};

// Update application status (accept/reject)
export const updateApplicationStatus = async (token: string, applicationId: string, status: string, feedbackNote?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${encodeURIComponent(applicationId)}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: status.toLowerCase(), // Laravel expects lowercase status
        feedback_note: feedbackNote
      }),
    });

    console.log(`Making PATCH request to update application ${applicationId} status to ${status}`); // Debug log

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      console.error('Update application status error response:', errorData); // Debug log
      throw new Error(`Update application status failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Update application status response:', result); // Debug log
    return result.data; // Return the updated application data
  } catch (error) {
    console.error('Error updating application status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};

// Set interview schedule for an application
export const setInterviewSchedule = async (token: string, applicationId: string, scheduleData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${encodeURIComponent(applicationId)}/schedule-interview`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData),
    });

    console.log(`Making PATCH request to schedule interview for application ${applicationId}`); // Debug log

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      console.error('Schedule interview error response:', errorData); // Debug log
      throw new Error(`Schedule interview failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('Schedule interview response:', result); // Debug log
    // Ensure result.data exists and is an object before returning
    if (!result || !result.data) {
      console.error('Invalid response format from schedule interview API:', result);
      throw new Error('Invalid response format from server');
    }
    return result.data; // Return the updated application data
  } catch (error) {
    console.error('Error scheduling interview: ' + (error instanceof Error ? error.message : 'Unknown error'));
    throw error;
  }
};