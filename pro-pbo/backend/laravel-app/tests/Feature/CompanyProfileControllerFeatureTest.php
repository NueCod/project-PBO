<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompanyProfileControllerFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthorized_access_to_company_profile_show(): void
    {
        $response = $this->getJson('/api/profile/company');

        $response->assertStatus(401);
    }

    public function test_unauthorized_access_to_company_profile_update(): void
    {
        $response = $this->putJson('/api/profile/company', []);

        $response->assertStatus(401);
    }
}