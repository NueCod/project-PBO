<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobControllerFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_jobs(): void
    {
        $response = $this->getJson('/api/jobs');

        $response->assertStatus(200);
    }

    public function test_unauthorized_access_to_company_jobs(): void
    {
        $response = $this->getJson('/api/jobs/company');

        $response->assertStatus(401);
    }
}