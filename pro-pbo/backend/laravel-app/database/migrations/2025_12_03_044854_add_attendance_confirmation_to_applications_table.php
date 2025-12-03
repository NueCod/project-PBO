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
            $table->boolean('attendance_confirmed')->default(false); // Apakah mahasiswa mengkonfirmasi kehadiran
            $table->timestamp('attendance_confirmed_at')->nullable(); // Kapan konfirmasi dilakukan
            $table->string('attendance_confirmation_method')->nullable(); // Metode konfirmasi (via email, via sistem, dll)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn([
                'attendance_confirmed',
                'attendance_confirmed_at',
                'attendance_confirmation_method'
            ]);
        });
    }
};
