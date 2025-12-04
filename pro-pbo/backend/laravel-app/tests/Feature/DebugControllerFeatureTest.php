<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebugControllerFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_debug_auth_endpoint_requires_auth(): void
    {
        $response = $this->getJson('/api/debug/auth');

        // This should return 401 as the endpoint requires authentication
        $response->assertStatus(401);
    }
}