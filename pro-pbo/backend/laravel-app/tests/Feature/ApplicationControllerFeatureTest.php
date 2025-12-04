<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApplicationControllerFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthorized_access_to_applications_index(): void
    {
        $response = $this->getJson('/api/applications');

        $response->assertStatus(401);
    }

    public function test_unauthorized_access_to_submit_application(): void
    {
        $response = $this->postJson('/api/applications', []);

        $response->assertStatus(401);
    }

    public function test_unauthorized_access_to_application_show(): void
    {
        $response = $this->getJson('/api/applications/1');

        $response->assertStatus(401);
    }

    public function test_unauthorized_access_to_application_update(): void
    {
        $response = $this->putJson('/api/applications/1', []);

        $response->assertStatus(401);
    }

    public function test_unauthorized_access_to_application_delete(): void
    {
        $response = $this->deleteJson('/api/applications/1');

        $response->assertStatus(401);
    }

    public function test_company_unauthorized_access_to_company_applications(): void
    {
        $response = $this->getJson('/api/applications/company');

        $response->assertStatus(401);
    }
}