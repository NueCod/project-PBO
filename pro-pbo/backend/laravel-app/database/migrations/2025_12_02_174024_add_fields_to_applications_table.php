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
        Schema::table('applications', function (Blueprint $table) {
            $table->text('cover_letter')->nullable(); // Surat lamaran
            $table->string('portfolio_url')->nullable(); // URL portfolio
            $table->string('availability')->nullable(); // Ketersediaan
            $table->string('expected_duration')->nullable(); // Durasi harapan
            $table->text('additional_info')->nullable(); // Informasi tambahan
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'cover_letter',
                'portfolio_url',
                'availability',
                'expected_duration',
                'additional_info'
            ]);
        });
    }
};
