// app/lib/apiService.ts

// Ambil URL API dari environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'; // Pastikan ini sesuai

// --- Otentikasi ---
export interface User {
  id: string; // UUID
  email: string;
  role: 'student' | 'company' | 'admin';
  // tambahkan field lain sesuai kebutuhan
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirmation: string; // untuk validasi di backend
  role: 'student' | 'company' | 'admin';
  // tambahkan field lain yang diperlukan saat register, sesuai RegisterRequest
  full_name?: string; // contoh untuk student
  company_name?: string; // contoh untuk company
}

export const registerUser = async (userData: RegisterData): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Registration failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return result.user; // Asumsikan backend mengembalikan { user: {...} }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Login failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    return response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = async (token: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Jika logout gagal (misal token invalid), kita mungkin tetap ingin hapus token di frontend
      console.warn('Logout request failed, but clearing local token.', response.status, response.statusText);
    }
    // Jangan return response.json() karena logout biasanya hanya mengembalikan pesan sukses
  } catch (error) {
    console.error('Logout error:', error);
    // Tetap hapus token di frontend jika terjadi error jaringan
    throw error;
  }
};

// --- Profil Mahasiswa ---
export interface UpdateStudentProfileRequest {
  name?: string;
  email?: string;
  university?: string;
  major?: string;
  location?: string;
  skills?: string[];
  interests?: string[];
  experience?: string[];
  education?: string[];
  portfolio?: string;
  avatar?: string;
}

export const updateStudentProfile = async (
  token: string,
  profileData: UpdateStudentProfileRequest
): Promise<StudentProfile> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/student`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Update profile failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log('Raw API response for update profile:', responseData);

    // Jika respons berisi profile di dalam object, maka kita perlu mengaksesnya
    // Format respons dari controller: { message: "...", profile: {...} }
    if (responseData.profile) {
      return responseData.profile;
    }

    // Jika tidak, kembalikan langsung (untuk kasus jika format respons berubah)
    return responseData;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const getStudentProfile = async (token: string): Promise<StudentProfile> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/student`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Get profile failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log('Raw API response for get profile:', responseData);

    // Jika respons berisi profile di dalam object, maka kita perlu mengaksesnya
    // Misalnya: { profile: {...} } daripada langsung {...}
    if (responseData.profile) {
      return responseData.profile;
    }

    return responseData;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

// --- Profil Perusahaan ---
export interface UpdateCompanyProfileRequest {
  name?: string;
  description?: string;
  industry?: string;
  location?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  logo?: string;
}

export interface CompanyProfile {
  id?: string;
  name: string;
  description: string;
  industry: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  website: string;
  logo?: string;
}

export const updateCompanyProfile = async (
  token: string,
  profileData: UpdateCompanyProfileRequest
): Promise<CompanyProfile> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/company`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Update company profile failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log('Raw API response for update company profile:', responseData);

    // Jika respons berisi profile di dalam object, maka kita perlu mengaksesnya
    // Format respons dari controller: { message: "...", profile: {...} }
    if (responseData.profile) {
      return responseData.profile;
    }

    // Jika tidak, kembalikan langsung (untuk kasus jika format respons berubah)
    return responseData;
  } catch (error) {
    console.error('Update company profile error:', error);
    throw error;
  }
};

export const getCompanyProfile = async (token: string): Promise<CompanyProfile> => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/company`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, // Kirim token di header
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
      throw new Error(`Get company profile failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log('Raw API response for get company profile:', responseData);

    // Jika respons berisi profile di dalam object, maka kita perlu mengaksesnya
    // Misalnya: { profile: {...} } daripada langsung {...}
    if (responseData.profile) {
      return responseData.profile;
    }

    return responseData;
  } catch (error) {
    console.error('Get company profile error:', error);
    throw error;
  }
};