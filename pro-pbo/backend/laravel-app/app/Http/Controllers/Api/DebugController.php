<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DebugController extends Controller
{
    public function checkAuth(Request $request)
    {
        \Log::info('Debug auth request received');
        
        // Check if user is authenticated using Sanctum
        $user = $request->user();
        
        \Log::info('Authenticated user: ' . ($user ? $user->id : 'none'));
        
        if ($user) {
            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ]);
        } else {
            return response()->json([
                'authenticated' => false,
                'message' => 'User not authenticated'
            ]);
        }
    }
}