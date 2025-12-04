<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentProfileControllerFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthorized_access_to_student_profile_show(): void
    {
        $response = $this->getJson('/api/profile/student');

        $response->assertStatus(401);
    }

    public function test_unauthorized_access_to_student_profile_update(): void
    {
        $response = $this->putJson('/api/profile/student', []);

        $response->assertStatus(401);
    }
}