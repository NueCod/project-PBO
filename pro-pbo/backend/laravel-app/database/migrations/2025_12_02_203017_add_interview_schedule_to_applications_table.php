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
            $table->date('interview_date')->nullable(); // Tanggal wawancara
            $table->time('interview_time')->nullable(); // Waktu wawancara
            $table->string('interview_method')->nullable(); // Metode wawancara (online/offline)
            $table->string('interview_location')->nullable(); // Lokasi wawancara (jika offline)
            $table->text('interview_notes')->nullable(); // Catatan wawancara
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'interview_date',
                'interview_time',
                'interview_method',
                'interview_location',
                'interview_notes'
            ]);
        });
    }
};
