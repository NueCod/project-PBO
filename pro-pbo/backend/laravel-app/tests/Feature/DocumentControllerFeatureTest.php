<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DocumentControllerFeatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthorized_access_to_documents(): void
    {
        $response = $this->getJson('/api/documents');

        $response->assertStatus(401);
    }

    public function test_unauthorized_document_upload(): void
    {
        $response = $this->postJson('/api/documents', []);

        $response->assertStatus(401);
    }
}