<?php

namespace App\Http\Controllers\Api\Profile;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class CompanyProfileController extends Controller
{
    /**
     * Get the authenticated company user's profile.
     *
     * @return JsonResponse
     */
    public function show(): JsonResponse
    {
        $user = Auth::user();

        // Pastikan user terotentikasi
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Pastikan user adalah company
        if ($user->role !== 'company') {
            return response()->json([
                'message' => 'Access denied. Only companies can access this resource.'
            ], 403);
        }

        // Ambil profile company terkait
        $profile = $user->companyProfile;

        // Jika profile belum ada, buat profil kosong
        if (!$profile) {
            $profile = $user->companyProfile()->create([
                'id' => \Illuminate\Support\Str::uuid(),
                'company_name' => $user->email, // Gunakan email sebagai default nama perusahaan
                'description' => '',
                'industry' => '',
                'location' => '',
                'contact_email' => $user->email, // Gunakan email user sebagai default
                'contact_phone' => '',
                'website' => '',
                'logo_url' => '',
            ]);
        }

        // Format data sesuai dengan frontend
        $profileData = [
            'id' => $user->id,
            'name' => $profile->company_name,
            'email' => $user->email,
            'description' => $profile->description ?? '',
            'industry' => $profile->industry ?? '',
            'location' => $profile->address ?? '',
            'contactEmail' => $profile->contact_email ?? $user->email,
            'contactPhone' => $profile->contact_phone ?? '',
            'website' => $profile->website_url ?? '',
            'logo' => $profile->logo_url ?? '',
        ];

        return response()->json($profileData);
    }

    /**
     * Update the authenticated company user's profile.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Pastikan user terotentikasi
        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Pastikan user adalah company
        if ($user->role !== 'company') {
            return response()->json([
                'message' => 'Access denied. Only companies can access this resource.'
            ], 403);
        }

        // Validasi input
        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|unique:users,email,' . $user->id,
            'description' => 'nullable|string',
            'industry' => 'nullable|string|max:255',
            'location' => 'nullable|string|max:255',
            'contactEmail' => 'nullable|email',
            'contactPhone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'logo' => 'nullable|string', // Ini mungkin URL base64 encoded image
        ]);

        // Ambil atau buat profile company
        $profile = $user->companyProfile;
        if (!$profile) {
            $profile = $user->companyProfile()->create([
                'id' => \Illuminate\Support\Str::uuid(),
                'user_id' => $user->id,
                'company_name' => $user->email,
                'description' => '',
                'industry' => '',
                'website_url' => '',
                'address' => '',
                'logo_url' => '',
                'contact_email' => $user->email, // Use the user's email as default
                'contact_phone' => '',
            ]);
        }

        // Siapkan data untuk diupdate
        $updateData = [
            'company_name' => $request->name ?? $profile->company_name,
        ];

        if ($request->has('description')) {
            $updateData['description'] = $request->description;
        }
        if ($request->has('industry')) {
            $updateData['industry'] = $request->industry;
        }
        // Note: The frontend sends 'location' but the database column is 'address'
        if ($request->has('location')) {
            $updateData['address'] = $request->location;
        }
        // Note: The frontend sends 'contactEmail' but the database column is 'contact_email'
        if ($request->has('contactEmail')) {
            $updateData['contact_email'] = $request->contactEmail;
        }
        // Note: The frontend sends 'contactPhone' and the database column is 'contact_phone'
        if ($request->has('contactPhone')) {
            $updateData['contact_phone'] = $request->contactPhone;
        }
        // Note: The frontend sends 'website' but the database column is 'website_url'
        if ($request->has('website')) {
            $updateData['website_url'] = $request->website;
        }
        if ($request->has('logo')) {
            $updateData['logo_url'] = $request->logo;
        }

        // Update data profil
        $profile->update($updateData);

        // Jika email diubah, update di tabel users juga
        if ($request->has('email') && $request->email !== $user->email) {
            $user->update(['email' => $request->email]);
        }

        // Format data untuk response
        $profileData = [
            'id' => $user->id,
            'name' => $profile->company_name,
            'email' => $user->email,
            'description' => $profile->description ?? '',
            'industry' => $profile->industry ?? '',
            'location' => $profile->address ?? '',
            'contactEmail' => $profile->contact_email ?? $user->email,
            'contactPhone' => $profile->contact_phone ?? '',
            'website' => $profile->website_url ?? '',
            'logo' => $profile->logo_url ?? '',
        ];

        return response()->json([
            'message' => 'Company profile updated successfully',
            'profile' => $profileData
        ]);
    }
}