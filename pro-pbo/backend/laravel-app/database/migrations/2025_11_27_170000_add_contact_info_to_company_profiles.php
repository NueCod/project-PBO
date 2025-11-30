<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            // Add missing columns for contact information
            if (!Schema::hasColumn('company_profiles', 'contact_email')) {
                $table->string('contact_email', 255)->nullable();
            }
            
            if (!Schema::hasColumn('company_profiles', 'contact_phone')) {
                $table->string('contact_phone', 25)->nullable(); // Using 25 for phone numbers
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn(['contact_email', 'contact_phone']);
        });
    }
};