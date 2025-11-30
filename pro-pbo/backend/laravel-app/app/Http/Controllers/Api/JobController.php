<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use App\Models\CompanyProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class JobController extends Controller
{
    /**
     * Get all active jobs (internships) for students to browse.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        try {
            // Retrieve all active jobs that haven't expired
            $now = now();
            $jobs = Job::where('is_active', true)
                ->where(function($query) use ($now) {
                    $query->whereNull('closing_date')
                         ->orWhere('closing_date', '>', $now);
                })
                ->with('companyProfile') // Use eager loading instead of lazy loading
                ->get();

            // Count all jobs before any filtering
            $totalJobs = $jobs->count();

            // Format the jobs to match frontend expectations
            $formattedJobs = $jobs->map(function ($job) use ($now) {
                $requirements = json_decode($job->requirements, true) ?: [];

                // Determine if job is expired or closed
                $isExpired = $job->closing_date && $job->closing_date <= $now;
                $isActive = $job->is_active;

                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'company' => $job->companyProfile ? $job->companyProfile->company_name : 'Unknown Company',
                    'location' => $job->location ?? '',
                    'type' => $job->job_type ?? '', // wfo, wfh, hybrid
                    'duration' => $requirements['duration'] ?? '',
                    'posted' => $job->created_at->format('Y-m-d'),
                    'deadline' => $job->closing_date ? $job->closing_date->format('Y-m-d') : '',
                    'description' => $job->description ?? '',
                    'requirements' => $requirements['majors'] ?? [],
                    'status' => $isExpired ? 'Closed' : 'Open',
                    'tags' => $requirements['skills'] ?? [],
                    'paid' => $requirements['is_paid'] ?? 'unpaid',
                    'minSemester' => $requirements['min_semester'] ?? 1,
                    'salary' => $requirements['salary'] ?? '',
                    'isPaid' => $requirements['is_paid'] === 'paid',
                    'salaryAmount' => $requirements['salary'] ?? ''
                ];
            });

            // Only return jobs that are still open
            $openJobs = $formattedJobs->filter(function($job) {
                return $job['status'] === 'Open';
            })->values(); // Re-index the collection

            \Log::info("Fetching jobs: Total found: {$totalJobs}, Open after filtering: {$openJobs->count()}");

            return response()->json([
                'success' => true,
                'data' => $openJobs,
                'total_available' => $totalJobs,
                'total_open' => $openJobs->count()
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch jobs: ' . $e->getMessage() . ' on line ' . $e->getLine());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch jobs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get jobs posted by the authenticated company.
     *
     * @return JsonResponse
     */
    public function getCompanyJobs(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'company') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            $companyProfile = $user->companyProfile;

            if (!$companyProfile) {
                // Create a default company profile if it doesn't exist
                $companyProfile = $user->companyProfile()->create([
                    'id' => Str::uuid(),
                    'company_name' => $user->email, // Use email as default company name
                    'description' => '',
                    'industry' => '',
                    'website_url' => '',
                    'address' => '',
                    'contact_email' => $user->email,
                    'contact_phone' => '',
                    'logo_url' => '',
                ]);
            }

            $jobs = Job::where('company_id', $companyProfile->id)
                ->withCount('applications') // Include count of applications
                ->get();

            // Format the jobs for company dashboard
            $formattedJobs = $jobs->map(function ($job) {
                $requirements = json_decode($job->requirements, true) ?: [];

                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'description' => $job->description,
                    'location' => $job->location ?? '',
                    'type' => $job->job_type, // wfo, wfh, hybrid
                    'deadline' => $job->closing_date ? $job->closing_date->format('Y-m-d') : '',
                    'description' => $job->description,
                    'requirements' => $requirements,
                    'status' => $job->is_active ? 'Active' : 'Inactive',
                    'posted' => $job->created_at->format('Y-m-d'),
                    'applications_count' => $job->applications_count ?? 0,
                    'is_active' => $job->is_active,
                    'closing_date' => $job->closing_date ? $job->closing_date->format('Y-m-d') : '',
                    'salary' => $requirements['salary'] ?? '',
                    'isPaid' => $requirements['is_paid'] === 'paid',
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedJobs
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch company jobs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch company jobs: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created job in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'company') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            $companyProfile = $user->companyProfile;

            if (!$companyProfile) {
                // Create a default company profile if it doesn't exist (consistent with getCompanyJobs)
                $companyProfile = $user->companyProfile()->create([
                    'id' => Str::uuid(),
                    'company_name' => $user->email, // Use email as default company name
                    'description' => '',
                    'industry' => '',
                    'website_url' => '',
                    'address' => '',
                    'contact_email' => $user->email,
                    'contact_phone' => '',
                    'logo_url' => '',
                ]);
            }

            $request->validate([
                'title' => 'required|string|max:150',
                'description' => 'required|string',
                'duration' => 'required|string',
                'location' => 'required|string|max:100',
                'jobType' => 'required|in:wfo,wfh,hybrid',
                'closingDate' => 'required|date|after:today',
                'isPaid' => 'required|boolean',
                'salary' => 'nullable|string',
                'requirements' => 'required|array',
                'requirements.majors' => 'array',
                'requirements.skills' => 'array',
                'requirements.gpa' => 'nullable|string',
                'requirements.other' => 'nullable|string',
                'requirements.minSemester' => 'nullable|string'
            ]);

            $job = new Job();
            $job->id = Str::uuid();
            $job->company_id = $companyProfile->id;
            $job->title = $request->title;
            $job->description = $request->description;
            $job->job_type = $request->jobType;
            $job->location = $request->location;
            $job->closing_date = $request->closingDate;

            // Prepare requirements data
            $requirements = [
                'majors' => $request->requirements['majors'] ?? [],
                'skills' => $request->requirements['skills'] ?? [],
                'gpa' => $request->requirements['gpa'] ?? '',
                'other' => $request->requirements['other'] ?? '',
                'min_semester' => $request->requirements['minSemester'] ?? '1',
                'duration' => $request->duration ?? '',
                'is_paid' => $request->isPaid ? 'paid' : 'unpaid',
                'salary' => $request->salary ?? ''
            ];

            $job->requirements = json_encode($requirements);
            $job->is_active = true; // Ensure the job is active when created
            $job->save();

            return response()->json([
                'success' => true,
                'message' => 'Job created successfully',
                'data' => $job
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create job: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified job.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function show(string $id): JsonResponse
    {
        try {
            $job = Job::with('companyProfile')->find($id);

            if (!$job) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job not found'
                ], 404);
            }

            $requirements = json_decode($job->requirements, true) ?: [];

            $formattedJob = [
                'id' => $job->id,
                'title' => $job->title,
                'company' => $job->companyProfile->company_name ?? 'Unknown Company',
                'location' => $job->location ?? '',
                'type' => $job->job_type, // wfo, wfh, hybrid
                'duration' => $requirements['duration'] ?? '',
                'posted' => $job->created_at->format('Y-m-d'),
                'deadline' => $job->closing_date ? $job->closing_date->format('Y-m-d') : '',
                'description' => $job->description,
                'requirements' => $requirements['majors'] ?? [],
                'status' => $job->closing_date < now() ? 'Closed' : 'Open',
                'tags' => $requirements['skills'] ?? [],
                'paid' => $requirements['is_paid'] ?? 'unpaid',
                'minSemester' => $requirements['min_semester'] ?? 1,
                'salary' => $requirements['salary'] ?? '',
                'isPaid' => $requirements['is_paid'] === 'paid',
                'salaryAmount' => $requirements['salary'] ?? ''
            ];

            return response()->json([
                'success' => true,
                'data' => $formattedJob
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch job: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified job in storage.
     *
     * @param Request $request
     * @param string $id
     * @return JsonResponse
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'company') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            $job = Job::find($id);

            if (!$job) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job not found'
                ], 404);
            }

            // Check if the job belongs to the authenticated company
            $companyProfile = $user->companyProfile;

            // If company profile doesn't exist, create one (for consistency with store method)
            if (!$companyProfile) {
                $companyProfile = $user->companyProfile()->create([
                    'id' => Str::uuid(),
                    'company_name' => $user->email, // Use email as default company name
                    'description' => '',
                    'industry' => '',
                    'website_url' => '',
                    'address' => '',
                    'contact_email' => $user->email,
                    'contact_phone' => '',
                    'logo_url' => '',
                ]);
            }

            if ($job->company_id !== $companyProfile->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this job'
                ], 403);
            }

            // Validate input fields
            $validated = $request->validate([
                'title' => 'sometimes|required|string|max:150',
                'description' => 'sometimes|required|string',
                'duration' => 'sometimes|required|string',
                'location' => 'sometimes|required|string|max:100',
                'jobType' => 'sometimes|required|in:wfo,wfh,hybrid',
                'closingDate' => 'sometimes|required|date|after:today',
                'isPaid' => 'sometimes|required|boolean',
                'is_active' => 'sometimes|required|boolean',
                'salary' => 'nullable|string',
                'requirements' => 'sometimes|required|array',
                'requirements.majors' => 'array',
                'requirements.skills' => 'array',
                'requirements.gpa' => 'nullable|string',
                'requirements.other' => 'nullable|string',
                'requirements.minSemester' => 'nullable|string'
            ]);

            // Update fields if they are provided in the request
            if ($request->has('title')) {
                $job->title = $request->title;
            }
            if ($request->has('description')) {
                $job->description = $request->description;
            }
            if ($request->has('jobType')) {
                $job->job_type = $request->jobType;
            }
            if ($request->has('location')) {
                $job->location = $request->location;
            }
            if ($request->has('closingDate')) {
                $job->closing_date = $request->closingDate;
            }
            if ($request->has('is_active')) {
                $job->is_active = $request->is_active;
            }

            // Handle requirements if provided
            if ($request->has('requirements')) {
                $requirements = [
                    'majors' => $request->requirements['majors'] ?? [],
                    'skills' => $request->requirements['skills'] ?? [],
                    'gpa' => $request->requirements['gpa'] ?? '',
                    'other' => $request->requirements['other'] ?? '',
                    'min_semester' => $request->requirements['minSemester'] ?? '1',
                    'duration' => $request->requirements['duration'] ?? '',
                    'is_paid' => $request->requirements['isPaid'] ?? ($request->isPaid ? 'paid' : 'unpaid'),
                    'salary' => $request->requirements['salary'] ?? ($request->salary ?? '')
                ];

                $job->requirements = json_encode($requirements);
            }

            $job->save();

            return response()->json([
                'success' => true,
                'message' => 'Job updated successfully',
                'data' => $job
            ]);

        } catch (\Exception $e) {
            \Log::error('Update job error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update job: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified job from storage.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'company') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            $job = Job::find($id);

            if (!$job) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job not found'
                ], 404);
            }

            // Check if the job belongs to the authenticated company
            $companyProfile = $user->companyProfile;

            // If company profile doesn't exist, create one (for consistency with other methods)
            if (!$companyProfile) {
                $companyProfile = $user->companyProfile()->create([
                    'id' => Str::uuid(),
                    'company_name' => $user->email, // Use email as default company name
                    'description' => '',
                    'industry' => '',
                    'website_url' => '',
                    'address' => '',
                    'contact_email' => $user->email,
                    'contact_phone' => '',
                    'logo_url' => '',
                ]);
            }

            if ($job->company_id !== $companyProfile->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this job'
                ], 403);
            }

            $job->delete();

            return response()->json([
                'success' => true,
                'message' => 'Job deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete job: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Close/deactivate the specified job.
     *
     * @param string $id
     * @return JsonResponse
     */
    public function closeJob(string $id): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user || $user->role !== 'company') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            $job = Job::find($id);

            if (!$job) {
                return response()->json([
                    'success' => false,
                    'message' => 'Job not found'
                ], 404);
            }

            // Check if the job belongs to the authenticated company
            $companyProfile = $user->companyProfile;

            // If company profile doesn't exist, create one (for consistency with other methods)
            if (!$companyProfile) {
                $companyProfile = $user->companyProfile()->create([
                    'id' => Str::uuid(),
                    'company_name' => $user->email, // Use email as default company name
                    'description' => '',
                    'industry' => '',
                    'website_url' => '',
                    'address' => '',
                    'contact_email' => $user->email,
                    'contact_phone' => '',
                    'logo_url' => '',
                ]);
            }

            if ($job->company_id !== $companyProfile->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to close this job'
                ], 403);
            }

            // Deactivate the job
            $job->is_active = false;
            $job->save();

            return response()->json([
                'success' => true,
                'message' => 'Job closed successfully',
                'data' => $job
            ]);

        } catch (\Exception $e) {
            \Log::error('Close job error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to close job: ' . $e->getMessage()
            ], 500);
        }
    }
}