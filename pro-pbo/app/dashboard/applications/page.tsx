'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../lib/authContext';
import { setInterviewSchedule, updateApplicationStatus } from '../../services/internshipService';

type ApplicationStatus = 'Applied' | 'Reviewed' | 'Interview' | 'Accepted' | 'Rejected';
type Application = {
  id: string; // Changed to string to match API
  job_id: string;
  job_title: string;
  student_id: string;
  student_name: string;
  student_email: string;
  applied_date: string;
  status: ApplicationStatus;
  feedback_note?: string;
  location?: string;
  job_type?: string;
  description?: string;
  studentUniversity?: string;
  studentMajor?: string;
  studentSkills?: string[];
  requirements?: string[];
  cover_letter?: string;
  portfolio_url?: string;
  availability?: string;
  expected_duration?: string;
  additional_info?: string;
  statusDate: string;
  notes?: string;
  studentBio?: string; // Added for student bio
  company?: string;
  position?: string;
  deadline?: string;
  interview_date?: string;
  interview_time?: string;
  interview_method?: string;
  interview_location?: string;
  interview_notes?: string;
  attendance_confirmed?: boolean;
  attendance_confirmed_at?: string;
  attendance_confirmation_method?: string;
  resume_id?: string; // ID of the resume document used in this application
  resume_name?: string; // Name of the resume document
  resume_type?: string; // Type of the resume document
  resume_size?: string; // Size of the resume document
  resume_url?: string; // URL to download the resume document
};

const CompanyApplicationsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicantProfile, setShowApplicantProfile] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<{id: string, status: ApplicationStatus} | null>(null);
  const [showInterviewScheduleModal, setShowInterviewScheduleModal] = useState(false);
  const [localApplicationOverrides, setLocalApplicationOverrides] = useState<Record<string, Partial<Application>>>({});
  const [interviewScheduledApplications, setInterviewScheduledApplications] = useState<Set<string>>(new Set());
  const [interviewSchedule, setInterviewSchedule] = useState({
    date: '',
    time: '',
    method: 'online', // 'online' or 'offline'
    location: '',
    notes: ''
  });

  // Ensure interviewSchedule always has proper default values
  useEffect(() => {
    setInterviewSchedule(prev => ({
      ...prev,
      date: prev.date || '',
      time: prev.time || '',
      method: prev.method || 'online',
      location: prev.location || '',
      notes: prev.notes || ''
    }));
  }, []);

  const { user, token } = useAuth(); // Get the user and token from authentication context

  // Fetch company profile
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (!token) {
        console.warn('No token available, cannot fetch company profile');
        return;
      }

      console.log('Fetching company profile with token:', token);
      try {
        const profile = await import('../../services/internshipService').then(mod => mod.getCompanyProfile);
        const companyData = await profile(token);
        console.log('Fetched company profile data:', companyData);
        setCompanyProfile(companyData);
      } catch (error) {
        console.error('Error fetching company profile:', error);
        // Use fallback if profile fetch fails
      }
    };

    if (token) {
      fetchCompanyProfile();
    }
  }, [token]);

  useEffect(() => {
    // Check system preference for dark mode
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Update the class on the document element
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Toggle sidebar on mobile
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        } else {
          setSidebarOpen(true);
        }
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Fetch company applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      // Only proceed if we have a valid token
      if (!token || token.trim() === '') {
        console.warn('No authentication token available, skipping fetch');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/company/applications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `HTTP error ${response.status}` }));
          throw new Error(`Failed to fetch applications: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
        }

        const result = await response.json();

        if (result.success && result.data) {
          // Map the API response to the format expected by the UI
          const serverApplications = result.data.map((app: any) => ({
            id: app.id,
            job_id: app.job_id,
            job_title: app.job_title || app.title,
            student_id: app.student_id,
            student_name: app.student_name || app.studentName,
            student_email: app.student_email || app.studentEmail,
            applied_date: app.applied_date || app.appliedDate,
            status: app.status || 'Applied',
            feedback_note: app.feedback_note,
            location: app.location,
            job_type: app.job_type,
            description: app.description,
            studentUniversity: app.studentUniversity || '',
            studentMajor: app.studentMajor || '',
            studentSkills: app.studentSkills || [],
            requirements: app.requirements || [],
            cover_letter: app.cover_letter,
            portfolio_url: app.portfolio_url,
            availability: app.availability,
            expected_duration: app.expected_duration,
            additional_info: app.additional_info,
            statusDate: app.statusDate || app.updated_at || app.applied_date || app.appliedDate,
            company: app.company,
            position: app.position,
            deadline: app.deadline,
            interview_date: app.interview_date || null,
            interview_time: app.interview_time || null,
            interview_method: app.interview_method || null,
            interview_location: app.interview_location || null,
            interview_notes: app.interview_notes || null,
            attendance_confirmed: app.attendance_confirmed || false,
            attendance_confirmed_at: app.attendance_confirmed_at || null,
            attendance_confirmation_method: app.attendance_confirmation_method || null,
            resume_id: app.resume_id,
            resume_name: app.resume_name || (app.resume?.title ? app.resume.title : null),
            resume_type: app.resume_type || (app.resume?.file_type ? app.resume.file_type : null),
            resume_size: app.resume_size || (app.resume?.size ? app.resume.size : null),
            resume_url: app.resume_url || (app.resume?.file_url ? app.resume.file_url : null),
          }));

          // Apply local overrides to server data
          setApplications(prev => {
            return serverApplications.map(serverApp => {
              // Check if there's a local override for this application
              const localOverride = localApplicationOverrides[serverApp.id];
              if (localOverride) {
                // Apply the local override to the server data
                return { ...serverApp, ...localOverride };
              }
              // For applications without local overrides, use server data
              return serverApp;
            });
          });
        } else {
          console.error('Failed to fetch applications:', result.message || 'Unknown error');
          setApplications([]);
        }
      } catch (error) {
        console.error('Error fetching company applications:', error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]); // Dependency on token so it re-fetches when token changes

  // Filter applications based on status and search term
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesSearch =
      (app.student_name || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.student_email || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.position || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.company || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.description || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.studentUniversity || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.studentMajor || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.studentSkills || []).some((skill) => typeof skill === 'string' && skill.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Function to get status color classes
  const getStatusColor = (status: ApplicationStatus) => {
    switch(status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'Accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'Rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Function to get the display status for UI - simplified for direct accept/reject workflow
  const getDisplayStatus = (appStatus: ApplicationStatus) => {
    // For the simplified workflow, we just return the application status as is
    return appStatus;
  };

  // Function to get status action text for simplified workflow
  const getStatusAction = (status: ApplicationStatus, hasInterviewScheduled?: boolean, appId?: string) => {
    switch(status) {
      case 'Applied':
        return 'Review';
      case 'Reviewed':
        return 'Review';
      case 'Interview':
        return 'Review';
      case 'Accepted':
        return 'Contact';
      case 'Rejected':
        return 'Detail';
      default:
        return 'Action';
    }
  };

  const handleViewProfile = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setShowApplicantProfile(true);
  };

  // Function to handle status change - simplified to just open review modal
  const handleStatusChange = (id: string, currentStatus: ApplicationStatus, hasInterviewScheduled?: boolean) => {
    // Show review modal for the application
    setSelectedApplication({ id, status: currentStatus });
    setShowReviewModal(true);
  };

  // Helper function to get next status
  const getNextStatus = (currentStatus: ApplicationStatus): ApplicationStatus => {
    if (currentStatus === 'Applied') return 'Reviewed';
    if (currentStatus === 'Reviewed') return 'Interview';
    if (currentStatus === 'Interview') return 'Accepted';
    return 'Applied'; // For 'Accepted' or any other status, cycle back to Applied
  };

  // Function to handle modal decision
  const handleReviewDecision = (decision: 'interview' | 'reject') => {
    if (selectedApplication) {
      const { id, status } = selectedApplication;

      // If decision is to proceed to interview, show schedule modal
      if (decision === 'interview') {
        // Reset interview schedule form to default values before opening modal
        setInterviewSchedule(prev => ({
          date: prev.date || '',
          time: prev.time || '',
          method: prev.method || 'online',
          location: prev.location || '',
          notes: prev.notes || ''
        }));
        setShowReviewModal(false); // Close review modal
        setShowInterviewScheduleModal(true); // Show interview schedule modal
      } else {
        // Update status to Rejected
        setApplications(prev => prev.map(app =>
          app.id === id ? { ...app, status: 'Rejected', statusDate: new Date().toISOString().split('T')[0] } : app
        ));

        // Close the modal
        setShowReviewModal(false);
        setSelectedApplication(null);
      }
    }
  };

  // Function to handle interview scheduling via API
  const handleScheduleInterview = async () => {
    if (selectedApplication && token) {
      const { id } = selectedApplication;

      try {
        const result = await setInterviewSchedule(token, id, {
          interview_date: interviewSchedule.date,
          interview_time: interviewSchedule.time,
          interview_method: interviewSchedule.method,
          interview_location: interviewSchedule.method === 'offline' ? interviewSchedule.location : null,
          interview_notes: interviewSchedule.notes,
        });

        console.log('Interview schedule result:', result);

        // Create a new array with updated application to force re-render
        setApplications(prev => {
          const updatedApplications = prev.map(app =>
            app.id === id
              ? {
                  ...app,
                  status: 'Interview',
                  statusDate: new Date().toISOString().split('T')[0],
                  interview_date: result?.interview_date || interviewSchedule.date,
                  interview_time: result?.interview_time || interviewSchedule.time,
                  interview_method: result?.interview_method || interviewSchedule.method,
                  interview_location: result?.interview_location || (interviewSchedule.method === 'offline' ? interviewSchedule.location : null),
                  interview_notes: result?.interview_notes || interviewSchedule.notes,
                  attendance_confirmed: app.attendance_confirmed || false,
                  attendance_confirmed_at: app.attendance_confirmed_at || null,
                  attendance_confirmation_method: app.attendance_confirmation_method || null,
                }
              : app
          );

          // Return a completely new array to force React to detect changes
          return [...updatedApplications];
        });

        // Reset schedule form and close modal
        setInterviewSchedule(prev => ({
          date: prev.date || '',
          time: prev.time || '',
          method: prev.method || 'online',
          location: prev.location || '',
          notes: prev.notes || ''
        }));
        setShowInterviewScheduleModal(false);
        setSelectedApplication(null);

        // Store local override for this application to ensure it keeps the correct status and interview details
        setLocalApplicationOverrides(prev => ({
          ...prev,
          [id]: {
            status: 'Interview',
            statusDate: new Date().toISOString().split('T')[0],
            interview_date: result?.interview_date || interviewSchedule.date,
            interview_time: result?.interview_time || interviewSchedule.time,
            interview_method: result?.interview_method || interviewSchedule.method,
            interview_location: result?.interview_location || (interviewSchedule.method === 'offline' ? interviewSchedule.location : null),
            interview_notes: result?.interview_notes || interviewSchedule.notes,
            attendance_confirmed: false,
            attendance_confirmed_at: null,
            attendance_confirmation_method: null
          }
        }));

        // Mark this application as having an interview scheduled to ensure it always displays as 'Interview'
        setInterviewScheduledApplications(prev => {
          const newSet = new Set(prev);
          newSet.add(id);
          return newSet;
        });

        // Clear the local override after 30 seconds to allow for server updates (e.g. if student confirms attendance)
        setTimeout(() => {
          setLocalApplicationOverrides(prev => {
            const newOverrides = { ...prev };
            delete newOverrides[id];
            return newOverrides;
          });
        }, 30000);

        // Fetch fresh data to ensure consistency after scheduling
        if (token) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/company/applications`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                const freshApplications = result.data.map((app: any) => ({
                  id: app.id,
                  job_id: app.job_id,
                  job_title: app.job_title || app.title,
                  student_id: app.student_id,
                  student_name: app.student_name || app.studentName,
                  student_email: app.student_email || app.studentEmail,
                  applied_date: app.applied_date || app.appliedDate,
                  status: app.status || 'Applied',
                  feedback_note: app.feedback_note,
                  location: app.location,
                  job_type: app.job_type,
                  description: app.description,
                  studentUniversity: app.studentUniversity || '',
                  studentMajor: app.studentMajor || '',
                  studentSkills: app.studentSkills || [],
                  requirements: app.requirements || [],
                  cover_letter: app.cover_letter,
                  portfolio_url: app.portfolio_url,
                  availability: app.availability,
                  expected_duration: app.expected_duration,
                  additional_info: app.additional_info,
                  statusDate: app.statusDate || app.updated_at || app.applied_date || app.appliedDate,
                  company: app.company,
                  position: app.position,
                  deadline: app.deadline,
                  interview_date: app.interview_date || null,
                  interview_time: app.interview_time || null,
                  interview_method: app.interview_method || null,
                  interview_location: app.interview_location || null,
                  interview_notes: app.interview_notes || null,
                  attendance_confirmed: app.attendance_confirmed || false,
                  attendance_confirmed_at: app.attendance_confirmed_at || null,
                  attendance_confirmation_method: app.attendance_confirmation_method || null,
                }));

                // Apply local overrides to the fresh data
                const applicationsWithOverrides = freshApplications.map(app => {
                  const localOverride = localApplicationOverrides[app.id];
                  if (localOverride) {
                    return { ...app, ...localOverride };
                  }
                  return app;
                });

                setApplications(applicationsWithOverrides);
              }
            }
          } catch (error) {
            console.error('Error fetching fresh applications after scheduling:', error);
          }
        }
      } catch (error) {
        console.error('Error scheduling interview:', error);
        alert('Gagal menjadwalkan wawancara. Silakan coba lagi.');
      }
    }
  };

  // Function to handle accept/reject application after interview
  const handleAcceptRejectApplication = async (id: string, decision: 'accept' | 'reject') => {
    const newStatus = decision === 'accept' ? 'Accepted' : 'Rejected';

    if (token) {
      try {
        // Update the status on the backend
        const updatedApplication = await updateApplicationStatus(
          token,
          id,
          newStatus.toLowerCase(),  // Backend expects lowercase status
          decision === 'reject' ? 'Aplikasi ditolak' : 'Aplikasi diterima'
        );

        // Update local state to reflect the change
        setApplications(prev => prev.map(app =>
          app.id === id ? {
            ...app,
            status: newStatus,
            statusDate: new Date().toISOString().split('T')[0],
            feedback_note: updatedApplication?.feedback_note || app.feedback_note
          } : app
        ));

        // Store local override for this application to ensure it keeps the correct status
        setLocalApplicationOverrides(prev => ({
          ...prev,
          [id]: {
            status: newStatus,
            statusDate: new Date().toISOString().split('T')[0],
            feedback_note: updatedApplication?.feedback_note || ''
          }
        }));

        // If accepting the application, we should remove it from scheduled interviews set
        if (newStatus === 'Accepted') {
          setInterviewScheduledApplications(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }

        // If rejecting the application, we should remove it from scheduled interviews set
        if (newStatus === 'Rejected') {
          setInterviewScheduledApplications(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
        }

        // Clear the local override after 30 seconds to allow for server updates
        setTimeout(() => {
          setLocalApplicationOverrides(prev => {
            const newOverrides = { ...prev };
            delete newOverrides[id];
            return newOverrides;
          });
        }, 30000);

        // Fetch fresh data to ensure consistency after accept/reject
        if (token) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/company/applications`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                const freshApplications = result.data.map((app: any) => ({
                  id: app.id,
                  job_id: app.job_id,
                  job_title: app.job_title || app.title,
                  student_id: app.student_id,
                  student_name: app.student_name || app.studentName,
                  student_email: app.student_email || app.studentEmail,
                  applied_date: app.applied_date || app.appliedDate,
                  status: app.status || 'Applied',
                  feedback_note: app.feedback_note,
                  location: app.location,
                  job_type: app.job_type,
                  description: app.description,
                  studentUniversity: app.studentUniversity || '',
                  studentMajor: app.studentMajor || '',
                  studentSkills: app.studentSkills || [],
                  requirements: app.requirements || [],
                  cover_letter: app.cover_letter,
                  portfolio_url: app.portfolio_url,
                  availability: app.availability,
                  expected_duration: app.expected_duration,
                  additional_info: app.additional_info,
                  statusDate: app.statusDate || app.updated_at || app.applied_date || app.appliedDate,
                  company: app.company,
                  position: app.position,
                  deadline: app.deadline,
                  interview_date: app.interview_date || null,
                  interview_time: app.interview_time || null,
                  interview_method: app.interview_method || null,
                  interview_location: app.interview_location || null,
                  interview_notes: app.interview_notes || null,
                  attendance_confirmed: app.attendance_confirmed || false,
                  attendance_confirmed_at: app.attendance_confirmed_at || null,
                  attendance_confirmation_method: app.attendance_confirmation_method || null,
                }));

                // Apply local overrides to the fresh data
                const applicationsWithOverrides = freshApplications.map(app => {
                  const localOverride = localApplicationOverrides[app.id];
                  if (localOverride) {
                    return { ...app, ...localOverride };
                  }
                  return app;
                });

                setApplications(applicationsWithOverrides);
              }
            }
          } catch (error) {
            console.error('Error fetching fresh applications after accept/reject:', error);
          }
        }

        // Close modal if open
        // No need to close modals here since they're handled separately
      } catch (error) {
        console.error(`Error ${decision === 'accept' ? 'accepting' : 'rejecting'} application:`, error);
        alert(`Gagal ${decision === 'accept' ? 'menerima' : 'menolak'} aplikasi. Silakan coba lagi.`);

        // Still update local state as fallback
        setApplications(prev => prev.map(app =>
          app.id === id ? {
            ...app,
            status: newStatus,
            statusDate: new Date().toISOString().split('T')[0]
          } : app
        ));
      }
    } else {
      // Fallback if no token, just update local state
      setApplications(prev => prev.map(app =>
        app.id === id ? {
          ...app,
          status: newStatus,
          statusDate: new Date().toISOString().split('T')[0]
        } : app
      ));
    }
  };

  // Function to handle schedule change
  const handleScheduleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInterviewSchedule(prev => ({
      ...prev,
      [name]: value || ''  // Ensure value is never undefined
    }));
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm z-50 border-b ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-[#e5e7eb]'}`}>
        <div className="max-w-[1200px] mx-auto px-[40px] py-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden mr-4"
              >
                <svg className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-[#0f0f0f]'}`}>Lamaran Masuk</div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} flex items-center justify-center`}>
                  <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                    {companyProfile?.name
                      ? companyProfile.name.charAt(0).toUpperCase()
                      : user?.email?.charAt(0).toUpperCase() || 'C'}
                  </span>
                </div>
                <span className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                  {companyProfile?.name || user?.email?.split('@')[0] || 'Perusahaan'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
          <div className="hidden md:block">
            <Sidebar darkMode={darkMode} />
          </div>
        )}

        {/* Mobile sidebar overlay */}
        {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
          <div
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768 && (
          <div className="fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] md:hidden">
            <Sidebar darkMode={darkMode} />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'md:ml-64' : ''} p-6 pt-12`}>
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Lamaran Masuk</h1>
              <div className={`mt-2 md:mt-0 px-4 py-2 rounded-lg ${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'} text-sm`}>
                {filteredApplications.length} lamaran diterima
              </div>
            </div>

            {/* Filters and Search */}
            <div className={`rounded-xl p-6 shadow mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setStatusFilter('All')}
                    className={`px-4 py-2 rounded-lg ${statusFilter === 'All' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    Semua
                  </button>
                  <button
                    onClick={() => setStatusFilter('Applied')}
                    className={`px-4 py-2 rounded-lg ${statusFilter === 'Applied' ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    Baru
                  </button>
                  <button
                    onClick={() => setStatusFilter('Accepted')}
                    className={`px-4 py-2 rounded-lg ${statusFilter === 'Accepted' ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    Diterima
                  </button>
                  <button
                    onClick={() => setStatusFilter('Rejected')}
                    className={`px-4 py-2 rounded-lg ${statusFilter === 'Rejected' ? (darkMode ? 'bg-red-600 text-white' : 'bg-red-500 text-white') : (darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')}`}
                  >
                    Ditolak
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari pelamar, posisi, atau universitas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full md:w-64 px-4 py-2 pl-10 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Menemukan <span className="font-semibold">{loading ? '...' : filteredApplications.length}</span> lamaran masuk
              </p>
            </div>

            {/* Applications List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f59e0b]"></div>
                </div>
              ) : filteredApplications.length > 0 ? (
                filteredApplications.map(app => (
                  <div
                    key={app.id}
                    className={`rounded-xl p-6 shadow ${darkMode ? 'bg-gray-800' : 'bg-white'} border-l-4 ${
                      getDisplayStatus(app.status) === 'Applied' ? 'border-blue-500' :
                      getDisplayStatus(app.status) === 'Accepted' ? 'border-green-500' : 'border-red-500'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{app.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium mt-1 md:mt-0 ${getStatusColor(getDisplayStatus(app.status))}`}>
                              {getDisplayStatus(app.status)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className={`font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {app.student_name} • {app.student_email}
                            </p>
                            <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {app.studentUniversity} • {app.studentMajor}
                            </p>
                          </div>

                          <div className={`text-sm p-3 rounded-lg mt-2 md:mt-0 ${
                            app.status === 'Applied'
                              ? `${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`
                              : app.status === 'Reviewed'
                                ? `${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`
                                : getDisplayStatus(app.status) === 'Interview'
                                  ? `${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`
                                  : app.status === 'Accepted'
                                    ? `${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`
                                    : `${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`
                          }`}>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <span className="font-medium">Dilamar:</span> {app.appliedDate} •
                              <span className="font-medium"> Status:</span> {app.statusDate}
                            </p>
                            {app.attendance_confirmed && (
                              <p className={`mt-1 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                                <span className="font-medium">Kehadiran:</span> Dikonfirmasi
                              </p>
                            )}
                          </div>
                        </div>

                        <p className={`mt-3 mb-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{app.description}</p>

                        <div className="mb-3">
                          <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keahlian Mahasiswa:</h4>
                          <div className="flex flex-wrap gap-2">
                            {app.studentSkills.map((skill, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'}`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {app.requirements.map((req, index) => (
                            <span
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}
                            >
                              {req}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Posisi</p>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.position}</p>
                          </div>
                          <div>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tanggal Lamar</p>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.appliedDate}</p>
                          </div>
                          <div>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Batas Waktu</p>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.deadline}</p>
                          </div>
                          <div>
                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Status Terakhir</p>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.statusDate}</p>
                          </div>
                        </div>
                      </div>

                      <div className="ml-0 md:ml-4 mt-4 md:mt-0 flex flex-col space-y-2">
                                                <div className="flex flex-wrap gap-2 items-center">
                          {/* Show Accept/Reject buttons only for applications that are not yet accepted or rejected */}
                          {getDisplayStatus(app.status) !== 'Accepted' && getDisplayStatus(app.status) !== 'Rejected' ? (
                            <>
                              <button
                                onClick={() => handleAcceptRejectApplication(app.id, 'accept')}
                                className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                              >
                                Terima
                              </button>
                              <button
                                onClick={() => handleAcceptRejectApplication(app.id, 'reject')}
                                className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
                              >
                                Tolak
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleViewProfile(app)}
                              className={`px-4 py-2 rounded-lg text-sm ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                              Lihat Detail
                            </button>
                          )}

                          {/* Menu tombol untuk aksi tambahan - dirapikan */}
                          <div className="relative group">
                            <button
                              className={`px-3 py-2 rounded-lg text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} flex items-center`}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </button>
                            <div className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10`}>
                              <div className="py-1">
                                {app.portfolio_url && (
                                  <a
                                    href={app.portfolio_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                  >
                                    🔗 Lihat Portfolio
                                  </a>
                                )}
                                {app.cover_letter && (
                                  <button
                                    onClick={() => alert(`Cover Letter:\n${app.cover_letter}`)}
                                    className={`w-full text-left block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                  >
                                    📧 Lihat Surat Lamaran
                                  </button>
                                )}
                                {getDisplayStatus(app.status) !== 'Accepted' && getDisplayStatus(app.status) !== 'Rejected' && (
                                  <button
                                    onClick={async () => {
                                      if (app.id) { // Check if application ID exists
                                        // Open the resume in a new tab using authenticated request
                                        if (token) {
                                          try {
                                            // Create a temporary link with the authenticated request
                                            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/applications/${app.id}/resume`, {
                                              headers: {
                                                'Authorization': `Bearer ${token}`,
                                              },
                                            });

                                            if (response.ok) {
                                              const blob = await response.blob();
                                              const url = window.URL.createObjectURL(blob);
                                              window.open(url, '_blank');
                                              window.URL.revokeObjectURL(url);
                                            } else {
                                              // Try to get error message from response
                                              let errorMsg = 'Gagal membuka dokumen. Silakan coba lagi.';
                                              try {
                                                const errorData = await response.json();
                                                if (errorData.message) {
                                                  if (errorData.message.includes('not found') || errorData.message.includes('unavailable')) {
                                                    errorMsg = 'Dokumen tidak tersedia - mungkin sudah dihapus oleh pelamar.';
                                                  } else {
                                                    errorMsg = `Gagal membuka dokumen: ${errorData.message}`;
                                                  }
                                                }
                                              } catch (e) {
                                                // If response is not JSON, use status text
                                                errorMsg = `Gagal membuka dokumen (${response.status}): ${response.statusText}`;
                                              }
                                              alert(errorMsg);
                                            }
                                          } catch (error) {
                                            console.error('Error fetching document:', error);
                                            alert('Terjadi kesalahan saat mengambil dokumen. Silakan coba lagi.');
                                          }
                                        } else {
                                          alert('Silakan login terlebih dahulu untuk melihat dokumen');
                                        }
                                      } else {
                                        alert('ID aplikasi tidak ditemukan untuk dokumen ini');
                                      }
                                    }}
                                    className={`w-full text-left block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} ${(app.id ? '' : 'opacity-50 cursor-not-allowed')}`}
                                  >
                                    📄 Lihat Dokumen
                                  </button>
                                )}
                                <button
                                  onClick={() => alert(`Hubungi kandidat:\nEmail: ${app.student_email}\nNama: ${app.student_name}`)}
                                  className={`w-full text-left block px-4 py-2 text-sm ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                                >
                                  📞 Contact
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`rounded-xl p-12 text-center ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
                  <svg className={`w-16 h-16 mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className={`mt-4 text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tidak ada lamaran ditemukan</h3>
                  <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tidak ada lamaran yang cocok dengan filter Anda. Coba istilah pencarian atau filter yang berbeda.
                  </p>
                </div>
              )}
            </div>

            {/* Applicant Profile Popup */}
            {showApplicantProfile && selectedApplicant && (
              <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className={`rounded-xl p-6 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Profil Pelamar</h2>
                    <button
                      onClick={() => setShowApplicantProfile(false)}
                      className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
                    >
                      <svg className={`w-5 h-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="md:col-span-1">
                      <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex flex-col items-center">
                          <div className={`w-20 h-20 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center mb-3`}>
                            <span className={`text-2xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {selectedApplicant.student_name.charAt(0)}
                            </span>
                          </div>
                          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedApplicant.student_name}</h3>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedApplicant.studentMajor}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedApplicant.studentUniversity}</p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Deskripsi</h4>
                        <p>{selectedApplicant.studentBio || 'Tidak ada deskripsi tersedia.'}</p>
                      </div>

                      <div className="mb-4">
                        <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keahlian</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedApplicant.studentSkills.map((skill, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Interview Attendance Confirmation Info */}
                      {selectedApplicant.attendance_confirmed && (
                        <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-green-900/30 border border-green-800' : 'bg-green-100 border border-green-200'}`}>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Konfirmasi Kehadiran Wawancara</h4>
                          <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                            Status: <span className="font-semibold">Sudah Dikonfirmasi Hadir</span>
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                            Tanggal Konfirmasi: {selectedApplicant.attendance_confirmed_at ? new Date(selectedApplicant.attendance_confirmed_at).toLocaleString('id-ID') : 'Tidak diketahui'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                            Metode: {selectedApplicant.attendance_confirmation_method || 'Sistem'}
                          </p>
                        </div>
                      )}

                      {/* Resume Document Info */}
                      {selectedApplicant.resume_name && (
                        <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                          <h4 className={`font-semibold mb-3 ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>Dokumen Lamaran</h4>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                <span className="font-medium">Nama:</span> {selectedApplicant.resume_name}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="font-medium">Jenis:</span> {selectedApplicant.resume_type || 'Dokumen'}
                              </p>
                              {selectedApplicant.resume_size && (
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                  <span className="font-medium">Ukuran:</span> {selectedApplicant.resume_size}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                if (selectedApplicant.id) {
                                  // Open the resume in a new tab using authenticated request
                                  if (token) {
                                    try {
                                      // Create a temporary link with the authenticated request
                                      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'}/applications/${selectedApplicant.id}/resume`, {
                                        headers: {
                                          'Authorization': `Bearer ${token}`,
                                        },
                                      });

                                      if (response.ok) {
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        window.open(url, '_blank');
                                        window.URL.revokeObjectURL(url);
                                      } else {
                                        // Try to get error message from response
                                        let errorMsg = 'Gagal membuka dokumen. Silakan coba lagi.';
                                        try {
                                          const errorData = await response.json();
                                          if (errorData.message) {
                                            if (errorData.message.includes('not found') || errorData.message.includes('unavailable')) {
                                              errorMsg = 'Dokumen tidak tersedia - mungkin sudah dihapus oleh pelamar.';
                                            } else {
                                              errorMsg = `Gagal membuka dokumen: ${errorData.message}`;
                                            }
                                          }
                                        } catch (e) {
                                          // If response is not JSON, use status text
                                          errorMsg = `Gagal membuka dokumen (${response.status}): ${response.statusText}`;
                                        }
                                        alert(errorMsg);
                                      }
                                    } catch (error) {
                                      console.error('Error fetching document:', error);
                                      alert('Terjadi kesalahan saat mengambil dokumen. Silakan coba lagi.');
                                    }
                                  } else {
                                    alert('Silakan login terlebih dahulu untuk melihat dokumen');
                                  }
                                } else {
                                  alert('ID aplikasi tidak ditemukan untuk dokumen ini');
                                }
                              }}
                              className={`px-3 py-1 rounded text-sm ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                              Lihat Dokumen
                            </button>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              <span className="font-medium">Deskripsi:</span> Dokumen utama yang digunakan dalam aplikasi ini
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</h4>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedApplicant.student_email}</p>
                        </div>
                        <div>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Posisi Dilamar</h4>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{selectedApplicant.position}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowApplicantProfile(false)}
                      className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Interview Schedule Modal */}
      {showInterviewScheduleModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Jadwal Wawancara</h2>
              <button
                onClick={() => {
                  setShowInterviewScheduleModal(false);
                  setSelectedApplication(null);
                  setInterviewSchedule(prev => ({
                    date: prev.date || '',
                    time: prev.time || '',
                    method: prev.method || 'online',
                    location: prev.location || '',
                    notes: prev.notes || ''
                  }));
                }}
                className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedApplication && (
              <>
                {(() => {
                  const app = applications.find(a => a.id === selectedApplication.id);
                  return app ? (
                    <div className="space-y-6">
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{app.student_name}</h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{app.position}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{app.student_email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Interview Attendance Confirmation Info */}
                      {app.attendance_confirmed && (
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-green-900/30 border border-green-800' : 'bg-green-100 border border-green-200'}`}>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-green-400' : 'text-green-700'}`}>Konfirmasi Kehadiran Wawancara</h4>
                          <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                            Status: <span className="font-semibold">Sudah Dikonfirmasi Hadir</span>
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                            Tanggal Konfirmasi: {app.attendance_confirmed_at ? new Date(app.attendance_confirmed_at).toLocaleString('id-ID') : 'Tidak diketahui'}
                          </p>
                          <p className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>
                            Metode: {app.attendance_confirmation_method || 'Sistem'}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tanggal Wawancara</label>
                          <input
                            type="date"
                            name="date"
                            value={interviewSchedule.date || ''}
                            onChange={handleScheduleChange}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Waktu Wawancara</label>
                          <input
                            type="time"
                            name="time"
                            value={interviewSchedule.time || ''}
                            onChange={handleScheduleChange}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            required
                          />
                        </div>

                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Metode Wawancara</label>
                          <select
                            name="method"
                            value={interviewSchedule.method || 'online'}
                            onChange={handleScheduleChange}
                            className={`w-full px-4 py-2 rounded-lg border ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="online">Online (Video Conference)</option>
                            <option value="offline">Offline (Datang ke Kantor)</option>
                          </select>
                        </div>

                        {interviewSchedule.method === 'offline' && (
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lokasi Wawancara</label>
                            <input
                              type="text"
                              name="location"
                              value={interviewSchedule.location || ''}
                              onChange={handleScheduleChange}
                              placeholder="Alamat lengkap kantor"
                              className={`w-full px-4 py-2 rounded-lg border ${
                                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Catatan Tambahan</label>
                        <textarea
                          name="notes"
                          value={interviewSchedule.notes || ''}
                          onChange={handleScheduleChange}
                          placeholder="Catatan tambahan untuk pelamar..."
                          rows={3}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        ></textarea>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button
                          onClick={() => {
                            setShowInterviewScheduleModal(false);
                            setSelectedApplication(null);
                            setInterviewSchedule(prev => ({
                              date: prev.date || '',
                              time: prev.time || '',
                              method: prev.method || 'online',
                              location: prev.location || '',
                              notes: prev.notes || ''
                            }));
                          }}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            darkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                          }`}
                        >
                          Batal
                        </button>
                        <button
                          onClick={handleScheduleInterview}
                          disabled={!interviewSchedule.date || !interviewSchedule.time}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            (!interviewSchedule.date || !interviewSchedule.time)
                              ? `${darkMode ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'} text-gray-500`
                              : `${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`
                          }`}
                        >
                          Jadwalkan Wawancara
                        </button>
                      </div>
                    </div>
                  ) : null;
                })()}
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-6 shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Review Lamaran</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedApplication(null);
                }}
                className={`p-2 rounded-full ${darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedApplication && (
              <>
                {(() => {
                  const app = applications.find(a => a.id === selectedApplication.id);
                  return app ? (
                    <div className="space-y-6">
                      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{app.student_name}</h3>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{app.position}</p>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{app.student_email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
                              Download CV
                            </button>
                            {app.portfolio_url && (
                              <a
                                href={app.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-yellow-500 hover:bg-yellow-600'} text-white`}
                              >
                                Portofolio
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {app.cover_letter && (
                        <div>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Surat Lamaran</h4>
                          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.cover_letter}</p>
                          </div>
                        </div>
                      )}

                      {app.additional_info && (
                        <div>
                          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Catatan Tambahan</h4>
                          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{app.additional_info}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Keahlian</h4>
                        <div className="flex flex-wrap gap-2">
                          {app.studentSkills?.map((skill, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm ${darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'}`}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4">
                        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Apakah kandidat ini akan dilanjutkan ke tahap wawancara atau tidak?
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => handleReviewDecision('interview')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                              darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            Lanjut ke Wawancara
                          </button>
                          <button
                            onClick={() => handleReviewDecision('reject')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                              darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                            }`}
                          >
                            Tidak Lanjut
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyApplicationsPage;