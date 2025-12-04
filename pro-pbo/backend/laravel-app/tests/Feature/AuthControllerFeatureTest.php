<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthControllerFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'student',
            'full_name' => 'Test User'
        ]);

        $response->assertStatus(201);
    }

    public function test_user_can_login(): void
    {
        // First register a user
        $this->postJson('/api/register', [
            'email' => 'login@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'student',
            'full_name' => 'Login User'
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'login@example.com',
            'password' => 'password'
        ]);

        $response->assertStatus(200);
    }

    public function test_unauthorized_logout(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401); // Should fail without authentication
    }
}