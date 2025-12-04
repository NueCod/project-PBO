<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * Get all documents for the authenticated student.
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
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
                    'success' => true,
                    'data' => [],
                    'message' => 'No documents found'
                ]);
            }

            // Get documents for this student
            $documents = $studentProfile->documents()
                ->orderBy('created_at', 'desc')
                ->get();

            // Format the documents for the frontend
            $formattedDocuments = $documents->map(function ($document) {
                return [
                    'id' => $document->id,
                    'name' => $document->title,
                    'type' => $this->getDocumentType($document->file_type),
                    'size' => $this->formatFileSize($document->file_url),
                    'uploadDate' => $document->created_at->format('Y-m-d'),
                    'description' => $document->title, // Using title as description for now
                    'downloadUrl' => url('storage/' . $document->file_url),
                    'viewUrl' => url('storage/' . $document->file_url),  // Public URL for viewing in new tab
                    'fileUrl' => $document->file_url,
                    'fileType' => $document->file_type
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedDocuments,
                'count' => $formattedDocuments->count()
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch documents: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch documents: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created document in storage.
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

            // Log before validation
            \Log::info('Starting document upload validation for user: ' . $user->id);

            // Validate the request
            try {
                $request->validate([
                    'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240', // 10MB max
                    'title' => 'nullable|string|max:100',
                    'type' => 'nullable|in:resume,cover_letter,transcript,certificate,portfolio,other'
                ]);
            } catch (\Exception $e) {
                \Log::error('Validation failed: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed: ' . $e->getMessage()
                ], 422);
            }

            \Log::info('Validation passed, proceeding with file upload');

            // Get the student profile
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

            // Handle file upload - Very simple approach
            \Log::info('Starting file processing');

            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $fileType = $file->getClientOriginalExtension();

            \Log::info('File info - Name: ' . $originalName . ', Type: ' . $fileType . ', Size: ' . ($file->getSize() / 1024) . ' KB');

            // Generate a unique name for the file
            $fileName = time() . '_' . Str::uuid() . '.' . $fileType;
            $folderPath = 'documents/' . $user->id;
            $filePath = $folderPath . '/' . $fileName;

            \Log::info('Generated file path: ' . $filePath);

            // Create the full path for physical file storage
            $fullPath = storage_path('app/public/' . $filePath);
            $fullDirPath = dirname($fullPath);

            // Ensure the directory exists using standard PHP
            if (!file_exists($fullDirPath)) {
                mkdir($fullDirPath, 0755, true);
                \Log::info('Created directory using PHP mkdir: ' . $fullDirPath);
            }

            // Move the uploaded file to the target location
            $file->move($fullDirPath, basename($filePath));
            \Log::info('File moved to: ' . $fullPath);

            // Verify that the file was stored successfully using file system check
            $exists = file_exists($fullPath);
            \Log::info('Physical file existence check for ' . $fullPath . ': ' . ($exists ? 'EXISTS' : 'NOT FOUND'));

            if (!$exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to store file at expected location: ' . $filePath
                ], 500);
            }

            // Create document record
            $document = new Document();
            $document->id = Str::uuid();
            $document->student_id = $studentProfile->id;
            $document->title = $request->title ?? $originalName;
            $document->file_url = $filePath; // Store relative path from public disk
            $document->file_type = $fileType;
            $document->save();

            \Log::info('Document record created with ID: ' . $document->id . ' and file: ' . $filePath);

            return response()->json([
                'success' => true,
                'message' => 'Document uploaded successfully',
                'data' => [
                    'id' => $document->id,
                    'name' => $document->title,
                    'type' => $this->getDocumentType($document->file_type),
                    'size' => $this->formatFileSize($document->file_url),
                    'uploadDate' => $document->created_at->format('Y-m-d'),
                    'description' => $document->title,
                    'downloadUrl' => url('storage/' . $document->file_url),
                    'viewUrl' => url('storage/' . $document->file_url),  // Public URL for viewing in new tab
                    'fileUrl' => $document->file_url,
                    'fileType' => $document->file_type
                ]
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Failed to upload document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified document.
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

            // Find the document that belongs to this student
            $document = $studentProfile->documents()
                ->where('id', $id)
                ->first();

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $document->id,
                    'name' => $document->title,
                    'type' => $this->getDocumentType($document->file_type),
                    'size' => $this->formatFileSize($document->file_url),
                    'uploadDate' => $document->created_at->format('Y-m-d'),
                    'description' => $document->title,
                    'downloadUrl' => url('storage/' . $document->file_url),
                    'viewUrl' => url('storage/' . $document->file_url),  // Public URL for viewing in new tab
                    'fileUrl' => $document->file_url,
                    'fileType' => $document->file_type
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Serve a document file for viewing/downloading.
     *
     * @param string $id
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\JsonResponse
     */
    public function serve(string $id)
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 401);
            }

            // Get the student profile for students, or find if document belongs to any student for other users
            $studentProfile = $user->studentProfile;

            // Find the document
            $document = null;
            if ($studentProfile) {
                // Student accessing their own document
                $document = $studentProfile->documents()->where('id', $id)->first();
            } else {
                // For now, only allow students to access documents
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied'
                ], 403);
            }

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }

            // Log document file path for debugging
            \Log::info('Attempting to serve document - Path: ' . $document->file_url . ' for document ID: ' . $id);

            // Check if file exists in the public storage disk
            $fileExists = \Storage::disk('public')->exists($document->file_url);
            \Log::info('File existence result: ' . ($fileExists ? 'FOUND' : 'NOT FOUND') . ' for path: ' . $document->file_url);

            if (!$fileExists) {
                // Additional check: physical file path
                $physicalPath = storage_path('app/public/' . $document->file_url);
                $physicalExists = file_exists($physicalPath);
                \Log::info('Physical file existence: ' . ($physicalExists ? 'FOUND' : 'NOT FOUND') . ' at: ' . $physicalPath);

                return response()->json([
                    'success' => false,
                    'message' => 'File not found on disk'
                ], 404);
            }

            // Stream the file content directly from the public disk
            $fileContents = \Storage::disk('public')->get($document->file_url);
            $mimeType = \Storage::disk('public')->mimeType($document->file_url) ?: 'application/octet-stream';
            \Log::info('Successfully retrieved file contents for document ID: ' . $id . ' with MIME type: ' . $mimeType);

            // Create a response with the file content
            $response = response($fileContents);
            $response->header('Content-Type', $mimeType);
            $response->header('Content-Disposition', 'inline; filename="' . basename($document->file_url) . '"');

            return $response;

        } catch (\Exception $e) {
            \Log::error('Failed to serve document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to serve document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified document in storage.
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

            // Find the document that belongs to this student
            $document = $studentProfile->documents()
                ->where('id', $id)
                ->first();

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }

            // Validate the request
            $request->validate([
                'title' => 'nullable|string|max:100',
            ]);

            // Update document fields
            if ($request->has('title')) {
                $document->title = $request->title;
            }

            $document->save();

            return response()->json([
                'success' => true,
                'message' => 'Document updated successfully',
                'data' => [
                    'id' => $document->id,
                    'name' => $document->title,
                    'type' => $this->getDocumentType($document->file_type),
                    'size' => $this->formatFileSize($document->file_url),
                    'uploadDate' => $document->created_at->format('Y-m-d'),
                    'description' => $document->title,
                    'downloadUrl' => url('storage/' . $document->file_url),
                    'viewUrl' => url('storage/' . $document->file_url),  // Public URL for viewing in new tab
                    'fileUrl' => $document->file_url,
                    'fileType' => $document->file_type
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to update document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified document from storage.
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

            // Find the document that belongs to this student
            $document = $studentProfile->documents()
                ->where('id', $id)
                ->first();

            if (!$document) {
                return response()->json([
                    'success' => false,
                    'message' => 'Document not found'
                ], 404);
            }

            // Delete the physical file from public disk
            if (Storage::disk('public')->exists($document->file_url)) {
                Storage::disk('public')->delete($document->file_url);
            }

            // Delete the document record
            $document->delete();

            return response()->json([
                'success' => true,
                'message' => 'Document deleted successfully'
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to delete document: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete document: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get document type based on file extension.
     *
     * @param string $fileType
     * @return string
     */
    private function getDocumentType(string $fileType): string
    {
        $fileType = strtolower($fileType);
        switch ($fileType) {
            case 'pdf':
                return 'Resume'; // Default to Resume for PDF files
            case 'doc':
            case 'docx':
                return 'Resume'; // Default to Resume for Word files
            case 'jpg':
            case 'jpeg':
            case 'png':
                return 'Portfolio'; // Default to Portfolio for image files
            default:
                return 'Other';
        }
    }

    /**
     * Format file size for display.
     *
     * @param string $fileUrl
     * @return string
     */
    private function formatFileSize(string $fileUrl): string
    {
        if (Storage::disk('public')->exists($fileUrl)) {
            $sizeInBytes = Storage::disk('public')->size($fileUrl);
            $sizeInMB = $sizeInBytes / (1024 * 1024);
            return number_format($sizeInMB, 2) . ' MB';
        }
        return 'Unknown';
    }
}