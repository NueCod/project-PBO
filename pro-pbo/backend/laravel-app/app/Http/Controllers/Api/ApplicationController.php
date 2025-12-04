<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Job;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ApplicationController extends Controller
{
    /**
     * Get applications submitted by the authenticated student.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            // Get authenticated user
            $user = Auth::user();

            if (!$user || $user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            // Get the student profile
            $studentProfile = $user->studentProfile;

            // If no student profile exists, return empty list
            if (!$studentProfile) {
                \Log::warning("No student profile found for user: {$user->id}");
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No applications found'
                ]);
            }

            // Get applications with job details
            $applications = $studentProfile->applications()
                ->with(['job', 'job.companyProfile', 'resume'])
                ->get();

            // Format the applications for the frontend
            $formattedApplications = $applications->map(function ($application) {
                $job = $application->job;
                $companyProfile = $job->companyProfile;

                return [
                    'id' => $application->id,
                    'job_id' => $job->id,
                    'title' => $job->title,
                    'company' => $companyProfile ? $companyProfile->company_name : 'Unknown Company',
                    'position' => $job->title,
                    'appliedDate' => is_string($application->created_at) ? $application->created_at : $application->created_at->format('Y-m-d'),
                    'status' => ucfirst($application->status), // Convert 'applied' to 'Applied'
                    'deadline' => $job->closing_date ? (is_string($job->closing_date) ? $job->closing_date : $job->closing_date->format('Y-m-d')) : '',
                    'description' => $job->description ?? '',
                    'requirements' => json_decode($job->requirements ?? '{}', true)['majors'] ?? [],
                    'statusDate' => is_string($application->updated_at) ? $application->updated_at : $application->updated_at->format('Y-m-d'),
                    'feedback_note' => $application->feedback_note ?? '',
                    'cover_letter' => $application->cover_letter ?? '',
                    'portfolio_url' => $application->portfolio_url ?? '',
                    'availability' => $application->availability ?? '',
                    'expected_duration' => $application->expected_duration ?? '',
                    'additional_info' => $application->additional_info ?? '',
                    'interview_date' => $application->interview_date,
                    'interview_time' => $application->interview_time,
                    'interview_method' => $application->interview_method,
                    'interview_location' => $application->interview_location,
                    'interview_notes' => $application->interview_notes,
                    'attendance_confirmed' => $application->attendance_confirmed,
                    'attendance_confirmed_at' => $application->attendance_confirmed_at,
                    'attendance_confirmation_method' => $application->attendance_confirmation_method,
                    'resume_id' => $application->resume_id,
                    'resume_name' => $application->resume ? $application->resume->title : ($application->resume_id ? 'Resume Dokumen Tidak Ditemukan' : null),
                    'resume_type' => $application->resume ? $application->resume->file_type : null,
                    'resume_url' => $application->resume ? url('storage/' . $application->resume->file_url) : null
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedApplications,
                'count' => $formattedApplications->count()
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch student applications: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch applications: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit a new application for a job.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            $studentProfile = $user->studentProfile;

            if (!$studentProfile) {
                // Create a default student profile if it doesn't exist
                $studentProfile = $user->studentProfile()->create([
                    'id' => Str::uuid(),
                    'user_id' => $user->id,
                    'full_name' => $user->email,
                    'university' => '',
                    'major' => '',
                    'gpa' => 0.0,
                    'graduation_year' => null,
                    'status' => 'undergraduate',
                    'bio' => '',
                    'phone_number' => '',
                    'linkedin_url' => '',
                    'skills' => '[]',
                    'interests' => '[]',
                    'experience' => '[]',
                    'education' => '[]',
                    'portfolio' => '',
                    'avatar' => '',
                    'location' => '',
                    'resume' => ''
                ]);
            }

            $validatedData = $request->validate([
                'job_id' => 'required|exists:jobs,id',
                'cover_letter' => 'required|string',
                'portfolio_url' => 'nullable|string',
                'availability' => 'nullable|string',
                'expected_duration' => 'nullable|string',
                'additional_info' => 'nullable|string',
            ]);

            // Handle resume_id separately to avoid validation error if the ID is not valid
            $resumeId = $request->resume_id;
            if ($resumeId !== null && $resumeId !== '') {
                // Check if the resume_id exists in the documents table
                $resumeExists = \App\Models\Document::where('id', $resumeId)->exists();
                if (!$resumeExists) {
                    // If resume_id is provided but doesn't exist, set it to null
                    $validatedData['resume_id'] = null;
                } else {
                    $validatedData['resume_id'] = $resumeId;
                }
            } else {
                $validatedData['resume_id'] = null;
            }

            // Check if the job exists
            $job = Job::find($request->job_id);
            if (!$job) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job not found'
                ], 404);
            }

            // Check if the student has already applied for this job
            $existingApplication = Application::where([
                'job_id' => $request->job_id,
                'student_id' => $studentProfile->id
            ])->first();

            if ($existingApplication) {
                return response()->json([
                    'success' => false,
                    'message' => 'You have already applied for this job'
                ], 400);
            }

            // Create the application
            $application = new Application();
            $application->id = Str::uuid();
            $application->job_id = $validatedData['job_id'];
            $application->student_id = $studentProfile->id;
            $application->resume_id = $validatedData['resume_id'];
            $application->cover_letter = $validatedData['cover_letter'];
            $application->portfolio_url = $validatedData['portfolio_url'];
            $application->availability = $validatedData['availability'];
            $application->expected_duration = $validatedData['expected_duration'];
            $application->additional_info = $validatedData['additional_info'];
            $application->status = 'applied'; // Default status
            $application->save();

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully',
                'data' => $application
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Failed to submit application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified application.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            // Get the student profile
            $studentProfile = $user->studentProfile;

            if (!$studentProfile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            // Find the application that belongs to this student
            $application = Application::where('id', $id)
                ->where('student_id', $studentProfile->id)
                ->with(['job', 'job.companyProfile', 'resume'])
                ->first();

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found'
                ], 404);
            }

            // Format the application data
            $job = $application->job;
            $companyProfile = $job->companyProfile;

            $formattedApplication = [
                'id' => $application->id,
                'job_id' => $job->id,
                'title' => $job->title,
                'company' => $companyProfile ? $companyProfile->company_name : 'Unknown Company',
                'position' => $job->title,
                'appliedDate' => is_string($application->created_at) ? $application->created_at : $application->created_at->format('Y-m-d'),
                'status' => ucfirst($application->status),
                'deadline' => $job->closing_date ? (is_string($job->closing_date) ? $job->closing_date : $job->closing_date->format('Y-m-d')) : '',
                'description' => $job->description ?? '',
                'requirements' => json_decode($job->requirements ?? '{}', true)['majors'] ?? [],
                'statusDate' => is_string($application->updated_at) ? $application->updated_at : $application->updated_at->format('Y-m-d'),
                'feedback_note' => $application->feedback_note ?? '',
                'cover_letter' => $application->cover_letter ?? '',
                'portfolio_url' => $application->portfolio_url ?? '',
                'availability' => $application->availability ?? '',
                'expected_duration' => $application->expected_duration ?? '',
                'additional_info' => $application->additional_info ?? '',
                'resume_id' => $application->resume_id,
                'resume_name' => $application->resume ? $application->resume->title : ($application->resume_id ? 'Resume Dokumen Tidak Ditemukan' : null),
                'resume_type' => $application->resume ? $application->resume->file_type : null,
                'resume_url' => $application->resume ? url('storage/' . $application->resume->file_url) : null
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedApplication
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch application: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified application (for student to withdraw application, for example).
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            // Get the student profile
            $studentProfile = $user->studentProfile;

            if (!$studentProfile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            // Find the application that belongs to this student
            $application = Application::where('id', $id)
                ->where('student_id', $studentProfile->id)
                ->first();

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found'
                ], 404);
            }

            // For now, we allow withdrawal of applications (status change to 'withdrawn')
            $status = $request->status;
            if ($status === 'withdrawn') {
                $application->status = $status;
                $application->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Application updated successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to update application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update application: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified application (delete).
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            // Get the student profile
            $studentProfile = $user->studentProfile;

            if (!$studentProfile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            // Find the application that belongs to this student
            $application = Application::where('id', $id)
                ->where('student_id', $studentProfile->id)
                ->first();

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found'
                ], 404);
            }

            // Delete the application
            $application->delete();

            return response()->json([
                'success' => true,
                'message' => 'Application withdrawn successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to delete application: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete application: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get applications for jobs posted by the authenticated company.
     *
     * @return JsonResponse
     */
    public function getCompanyApplications(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'company') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            // Get the company profile
            $companyProfile = $user->companyProfile;

            if (!$companyProfile) {
                \Log::warning("No company profile found for user: {$user->id}");
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No applications found'
                ]);
            }

            // Get jobs posted by this company
            $companyJobs = $companyProfile->jobs()->pluck('id');

            // Get applications for those jobs
            $applications = Application::whereIn('job_id', $companyJobs)
                ->with(['studentProfile.user', 'job', 'resume']) // Include student, job, and resume info
                ->get();

            // Log the count of applications being returned for debugging
            \Log::info('Returning ' . $applications->count() . ' applications for company');

            // Format the applications for the frontend
            $formattedApplications = $applications->map(function ($application) {
                $studentProfile = $application->studentProfile;
                $job = $application->job;
                $student = $studentProfile->user; // Get the student user account

                // Log specific application data if it has interview scheduled
                if ($application->interview_date) {
                    \Log::info('Application with interview: ' . $application->id . ' status: ' . $application->status . ' date: ' . $application->interview_date);
                }

                return [
                    'id' => $application->id,
                    'job_id' => $job->id,
                    'job_title' => $job->title,
                    'student_id' => $studentProfile->id,
                    'student_name' => $studentProfile->full_name ?? $student->email,
                    'student_email' => $student->email,
                    'applied_date' => is_string($application->created_at) ? $application->created_at : $application->created_at->format('Y-m-d'),
                    'status' => ucfirst($application->status), // Convert 'applied' to 'Applied'
                    'feedback_note' => $application->feedback_note ?? '',
                    'location' => $job->location ?? '',
                    'job_type' => $job->job_type ?? '',
                    'description' => $job->description ?? '',
                    'cover_letter' => $application->cover_letter ?? '',
                    'portfolio_url' => $application->portfolio_url ?? '',
                    'availability' => $application->availability ?? '',
                    'expected_duration' => $application->expected_duration ?? '',
                    'additional_info' => $application->additional_info ?? '',
                    'interview_date' => $application->interview_date,
                    'interview_time' => $application->interview_time,
                    'interview_method' => $application->interview_method,
                    'interview_location' => $application->interview_location,
                    'interview_notes' => $application->interview_notes,
                    'attendance_confirmed' => $application->attendance_confirmed,
                    'attendance_confirmed_at' => $application->attendance_confirmed_at,
                    'attendance_confirmation_method' => $application->attendance_confirmation_method,
                    'resume_id' => $application->resume_id,
                    'resume_name' => $application->resume ? $application->resume->title : ($application->resume_id ? 'Resume Dokumen Tidak Ditemukan' : null),
                    'resume_type' => $application->resume ? $application->resume->file_type : null,
                    'resume_url' => $application->resume ? url('storage/' . $application->resume->file_url) : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedApplications,
                'count' => $formattedApplications->count()
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch company applications: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch applications: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Set interview schedule for an application.
     *
     * @param string $id
     * @param Request $request
     * @return JsonResponse
     */
    public function setInterviewSchedule(string $id, Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'company') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            // Get the company profile
            $companyProfile = $user->companyProfile;

            if (!$companyProfile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company profile not found'
                ], 404);
            }

            // Find the application
            $application = Application::with('job.companyProfile')->find($id);

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found'
                ], 404);
            }

            // Check if the job associated with this application belongs to the authenticated company
            if ($application->job->companyProfile->id !== $companyProfile->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to set interview schedule for this application'
                ], 403);
            }

            // Validate request data
            $request->validate([
                'interview_date' => 'required|date',
                'interview_time' => 'required|date_format:H:i',
                'interview_method' => 'required|in:online,offline',
                'interview_location' => 'nullable|string',
                'interview_notes' => 'nullable|string',
            ]);

            \DB::transaction(function () use ($request, $application, $id) {
                // Update interview schedule fields individually to ensure all changes are saved to the database
                $application->interview_date = $request->interview_date;
                $application->interview_time = $request->interview_time;
                $application->interview_method = $request->interview_method;
                $application->interview_location = $request->interview_location ?? null;
                $application->interview_notes = $request->interview_notes ?? null;
                $application->status = 'interview'; // Update status to 'interview' to indicate that an interview has been scheduled

                // Log the values before saving for debugging
                \Log::info('Setting interview schedule for application: ' . $id . ' with data: ' . json_encode([
                    'interview_date' => $request->interview_date,
                    'interview_time' => $request->interview_time,
                    'interview_method' => $request->interview_method,
                    'interview_location' => $request->interview_location,
                    'interview_notes' => $request->interview_notes,
                    'status' => 'interview'
                ]));

                // Explicitly save the changes to database
                $application->save();

                // Log the saved values for verification
                \Log::info('Saved application data: ' . json_encode([
                    'id' => $application->id,
                    'status' => $application->status,
                    'interview_date' => $application->interview_date,
                    'interview_time' => $application->interview_time,
                    'interview_method' => $application->interview_method
                ]));
            });

            // Refresh the application instance to make sure we have latest data
            $application->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Interview schedule set successfully',
                'data' => $application
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Failed to set interview schedule: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to set interview schedule: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Confirm attendance for an interview.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function confirmAttendance(string $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'student') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            // Get the student profile
            $studentProfile = $user->studentProfile;

            if (!$studentProfile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found'
                ], 404);
            }

            // Find the application that belongs to this student
            $application = $studentProfile->applications()
                ->where('id', $id)
                ->first();

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found or does not belong to you'
                ], 404);
            }

            // Check if the application has an interview scheduled
            if (!$application->interview_date) {
                return response()->json([
                    'success' => false,
                    'message' => 'No interview scheduled for this application'
                ], 400);
            }

            // Update attendance confirmation
            $application->update([
                'attendance_confirmed' => true,
                'attendance_confirmed_at' => now(),
                'attendance_confirmation_method' => 'system' // Konfirmasi dilakukan melalui sistem
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Attendance confirmed successfully',
                'data' => [
                    'attendance_confirmed' => $application->attendance_confirmed,
                    'attendance_confirmed_at' => $application->attendance_confirmed_at,
                    'attendance_confirmation_method' => $application->attendance_confirmation_method
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Failed to confirm attendance: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm attendance: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update application status (accept/reject).
     *
     * @param string $id
     * @return JsonResponse
     */
    public function updateStatus(string $id, Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'company') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            // Get the company profile
            $companyProfile = $user->companyProfile;

            if (!$companyProfile) {
                return response()->json([
                    'success' => false,
                    'message' => 'Company profile not found'
                ], 404);
            }

            // Find the application
            $application = Application::with('job.companyProfile')->find($id);

            if (!$application) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found'
                ], 404);
            }

            // Check if the job associated with this application belongs to the authenticated company
            if ($application->job->companyProfile->id !== $companyProfile->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update status for this application'
                ], 403);
            }

            // Validate request data
            $request->validate([
                'status' => 'required|in:applied,reviewed,interview,accepted,rejected',
                'feedback_note' => 'nullable|string'
            ]);

            \DB::transaction(function () use ($request, $application) {
                // Update application status and feedback note individually to ensure changes are saved to database
                $application->status = $request->status;
                $application->feedback_note = $request->feedback_note ?? $application->feedback_note;
                $application->save();

                // Log the update for debugging
                \Log::info('Updated application status: ' . $application->id . ' to status: ' . $application->status);
            });

            // Refresh to get latest data
            $application->refresh();

            return response()->json([
                'success' => true,
                'message' => 'Application status updated successfully',
                'data' => $application
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Failed to update application status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update application status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Serve the resume document for an application
     *
     * @param string $id Application ID
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
     */
    public function serveApplicationResume(string $id)
    {
        try {
            // Log incoming request
            \Log::info('Serve application resume request - Application ID: ' . $id);

            $user = Auth::user();

            if (!$user) {
                \Log::warning('Unauthorized access attempt to serve resume');
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            $application = null;

            if ($user->role === 'company') {
                \Log::info('Company user attempting to access resume - User ID: ' . $user->id);

                // Company accessing application from their posted jobs
                $companyProfile = $user->companyProfile;
                if (!$companyProfile) {
                    \Log::warning('Company profile not found for user: ' . $user->id);
                    return response()->json([
                        'success' => false,
                        'message' => 'Company profile not found'
                    ], 404);
                }

                // Get jobs posted by this company
                $companyJobs = $companyProfile->jobs()->pluck('id');
                \Log::info('Company has ' . $companyJobs->count() . ' jobs posted');

                // Find the application for one of their jobs
                $application = Application::whereIn('job_id', $companyJobs)
                    ->where('id', $id)
                    ->with('resume') // Load the resume relationship
                    ->first();
            } elseif ($user->role === 'student') {
                \Log::info('Student user attempting to access resume - User ID: ' . $user->id);

                // Student accessing their own application
                $studentProfile = $user->studentProfile;
                if (!$studentProfile) {
                    \Log::warning('Student profile not found for user: ' . $user->id);
                    return response()->json([
                        'success' => false,
                        'message' => 'Student profile not found'
                    ], 404);
                }

                $application = Application::where('student_id', $studentProfile->id)
                    ->where('id', $id)
                    ->with('resume') // Load the resume relationship
                    ->first();
            } else {
                \Log::warning('Invalid role attempting to access resume: ' . $user->role);
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied'
                ], 403);
            }

            if (!$application) {
                \Log::warning('Application not found or access denied - ID: ' . $id);
                return response()->json([
                    'success' => false,
                    'message' => 'Application not found or access denied'
                ], 404);
            }

            // Check if application has a resume
            if (!$application->resume) {
                \Log::warning('Resume not found for application ID: ' . $id);
                return response()->json([
                    'success' => false,
                    'message' => 'Resume not found for this application'
                ], 404);
            }

            // Log the resume file details
            \Log::info('Resume file found - Path: ' . $application->resume->file_url . ', Type: ' . ($application->resume->file_type ?? 'unknown'));

            // Debug: Log the resume details
            \Log::info('Resume details - ID: ' . $application->resume->id . ', Path: ' . $application->resume->file_url . ', Type: ' . $application->resume->file_type);

            // Check if file exists in the public storage disk
            $fileExists = \Storage::disk('public')->exists($application->resume->file_url);

            if (!$fileExists) {
                \Log::warning('File does not exist in public disk at path: ' . $application->resume->file_url . ' for application ID: ' . $id);

                // Get list of actual files in the document location to debug
                $expectedDir = dirname($application->resume->file_url);
                if ($expectedDir && \Storage::disk('public')->exists($expectedDir)) {
                    $filesInDir = \Storage::disk('public')->files($expectedDir);
                    \Log::info('Files in expected directory "' . $expectedDir . '": ' . implode(', ', $filesInDir));
                } else {
                    \Log::warning('Expected directory "' . $expectedDir . '" does not exist in public disk');
                }

                // Update the application record to clear the resume_id pointing to missing file
                $application->resume_id = null;
                $application->save();

                return response()->json([
                    'success' => false,
                    'message' => 'Resume file has been removed or is unavailable'
                ], 404);
            }

            // Stream the file content directly from the public disk
            try {
                $fileContents = \Storage::disk('public')->get($application->resume->file_url);
                $mimeType = \Storage::disk('public')->mimeType($application->resume->file_url) ?: 'application/octet-stream';

                // Create a response with the file content
                $response = response($fileContents);
                $response->header('Content-Type', $mimeType);
                $response->header('Content-Disposition', 'inline; filename="' . basename($application->resume->file_url) . '"');

                return $response;
            } catch (\Exception $e) {
                \Log::error('Error reading file content: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Error reading file content: ' . $e->getMessage()
                ], 500);
            }

        } catch (\Exception $e) {
            \Log::error('Failed to serve application resume: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to serve resume: ' . $e->getMessage()
            ], 500);
        }
    }
}