<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

// Example of a proper unit test for a service class rather than a controller
// This is the recommended approach for business logic testing

class JobServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_example_service_method(): void
    {
        $this->assertTrue(true);
    }
}