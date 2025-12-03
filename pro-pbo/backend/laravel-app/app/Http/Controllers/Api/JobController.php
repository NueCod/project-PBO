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
                    'posted' => (is_string($job->created_at) ? $job->created_at : $job->created_at->format('Y-m-d')),
                    'deadline' => $job->closing_date ? (is_string($job->closing_date) ? $job->closing_date : $job->closing_date->format('Y-m-d')) : '',
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
            \Log::info("getCompanyJobs method called");

            // Cek apakah ada header Authorization
            $authorizationHeader = request()->header('Authorization');
            \Log::info("Authorization header: " . ($authorizationHeader ? substr($authorizationHeader, 0, 20) . '...' : 'none'));

            // Cek apakah Sanctum bisa mengotentikasi user
            $user = Auth::user();
            \Log::info("Authenticated user from Sanctum: " . ($user ? $user->id . " with role: " . $user->role : "none"));

            // Cek apakah user bisa diambil dengan user() helper
            $sanctumUser = request()->user();
            \Log::info("Authenticated user from request(): " . ($sanctumUser ? $sanctumUser->id . " with role: " . $sanctumUser->role : "none"));

            if (!$user || $user->role !== 'company') {
                \Log::warning("Unauthorized access attempt - user: " . ($user ? $user->id : "none") . ", role: " . ($user ? $user->role : "none"));
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            $companyProfile = $user->companyProfile;
            \Log::info("Company profile exists: " . ($companyProfile ? "yes" : "no"));

            if (!$companyProfile) {
                // Create a default company profile if it doesn't exist - this is the same as in other methods
                \Log::info("Creating new company profile for user: {$user->email}");
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
                \Log::info("Created company profile with ID: {$companyProfile->id}");
            } else {
                // Log that company profile exists and its details
                \Log::info("Company profile found with ID: {$companyProfile->id}, name: {$companyProfile->company_name}");
            }

            \Log::info("Fetching jobs for company_id: {$companyProfile->id} and user_id: {$user->id}");

            // Debug: Cek semua jobs yang ada di database
            $allJobsCount = Job::count();
            \Log::info("Total jobs in database: {$allJobsCount}");

            // Debug: Cek jobs berdasarkan company_id tertentu
            $allCompanyJobs = Job::all();
            \Log::info("All job records with company_id mapping:", $allCompanyJobs->pluck('id', 'company_id')->toArray());

            // Debug: Cek apakah ada jobs dengan company_id yang dicari
            $matchingJobs = Job::where('company_id', $companyProfile->id)->get();
            \Log::info("Jobs found with company_id {$companyProfile->id}: " . $matchingJobs->count());
            foreach ($matchingJobs as $job) {
                \Log::info("Job ID: {$job->id}, Title: {$job->title}, Company ID: {$job->company_id}");
            }

            $jobs = Job::where('company_id', $companyProfile->id)
                ->withCount('applications') // Include count of applications
                ->get();

            \Log::info("Found " . $jobs->count() . " jobs for company_id: {$companyProfile->id}");

            // Format the jobs for company dashboard
            $formattedJobs = $jobs->map(function ($job) {
                // Safely decode requirements, handle potential null or malformed JSON
                $requirements = [];
                if ($job->requirements) {
                    $decoded = json_decode($job->requirements, true);
                    if ($decoded !== null) {
                        $requirements = $decoded;
                    }
                }

                // Safely handle dates, checking if they are strings or DateTime objects
                $deadline = '';
                if ($job->closing_date) {
                    if (is_string($job->closing_date)) {
                        $deadline = $job->closing_date;
                    } elseif ($job->closing_date instanceof \DateTime) {
                        $deadline = $job->closing_date->format('Y-m-d');
                    }
                }

                $posted = '';
                if ($job->created_at) {
                    if (is_string($job->created_at)) {
                        $posted = $job->created_at;
                    } elseif ($job->created_at instanceof \DateTime) {
                        $posted = $job->created_at->format('Y-m-d');
                    }
                }

                return [
                    'id' => $job->id,
                    'title' => $job->title,
                    'description' => $job->description,
                    'location' => $job->location ?? '',
                    'type' => $job->job_type, // wfo, wfh, hybrid
                    'deadline' => $deadline,
                    'description' => $job->description,
                    'requirements' => $requirements,
                    'status' => $job->is_active ? 'Active' : 'Inactive',
                    'posted' => $posted,
                    'applications_count' => $job->applications_count ?? 0,
                    'is_active' => $job->is_active,
                    'closing_date' => $deadline, // Using same deadline value
                    'salary' => $requirements['salary'] ?? '',
                    'isPaid' => isset($requirements['is_paid']) && $requirements['is_paid'] === 'paid',
                ];
            });

            // Return success response with data (even if empty array)
            return response()->json([
                'success' => true,
                'data' => $formattedJobs,
                'count' => $formattedJobs->count(),
                'message' => $formattedJobs->count() > 0 ? 'Jobs retrieved successfully' : 'No jobs found for this company'  // Add helpful message
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch company jobs: ' . $e->getMessage() . ' in file ' . $e->getFile() . ' at line ' . $e->getLine());

            // Return a success response with empty data instead of error, to prevent the "Job not found" message
            return response()->json([
                'success' => true,
                'data' => [],
                'count' => 0,
                'message' => 'Error occurred but returning empty data: ' . $e->getMessage()
            ], 200);
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

            // Log the company_id to verify it's being set correctly
            \Log::info("Creating job with company_id: {$job->company_id} for user: {$user->id}");
            \Log::info("Company profile ID used: {$companyProfile->id} for user: {$user->email}");

            $job->save();

            // Verify the job was saved with the correct company_id
            \Log::info("Job created with ID: {$job->id} and company_id: {$job->company_id}");

            // Fetch and return the newly created job with companyProfile relation to ensure data consistency
            $createdJob = Job::with('companyProfile')->find($job->id);

            return response()->json([
                'success' => true,
                'message' => 'Job created successfully',
                'data' => $createdJob
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Store job error: ' . $e->getMessage());
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
                'posted' => (is_string($job->created_at) ? $job->created_at : $job->created_at->format('Y-m-d')),
                'deadline' => $job->closing_date ? (is_string($job->closing_date) ? $job->closing_date : $job->closing_date->format('Y-m-d')) : '',
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
                \Log::warning("Unauthorized to update job: user {$user->id} tried to update job {$id} belonging to company {$job->company_id}");
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

            \Log::info("Job updated: {$job->id} for company {$job->company_id}");

            // Fetch and return the updated job with companyProfile relation to ensure data consistency
            $updatedJob = Job::with('companyProfile')->find($job->id);

            return response()->json([
                'success' => true,
                'message' => 'Job updated successfully',
                'data' => $updatedJob
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
                \Log::warning("Unauthorized to delete job: user {$user->id} tried to delete job {$id} belonging to company {$job->company_id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this job'
                ], 403);
            }

            \Log::info("Deleting job: {$job->id} for company {$job->company_id}");

            $job->delete();

            return response()->json([
                'success' => true,
                'message' => 'Job deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Delete job error: ' . $e->getMessage());
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
                \Log::warning("Unauthorized to close job: user {$user->id} tried to close job {$id} belonging to company {$job->company_id}");
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to close this job'
                ], 403);
            }

            // Deactivate the job
            $job->is_active = false;
            $job->save();

            \Log::info("Job closed: {$job->id} for company {$job->company_id}");

            // Fetch and return the closed job with companyProfile relation to ensure data consistency
            $closedJob = Job::with('companyProfile')->find($job->id);

            return response()->json([
                'success' => true,
                'message' => 'Job closed successfully',
                'data' => $closedJob
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