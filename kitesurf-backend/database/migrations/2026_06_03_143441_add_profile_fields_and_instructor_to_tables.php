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
        Schema::table('users', function (Blueprint $table) {
            $table->string('address')->nullable()->after('is_active');
            $table->string('city')->nullable()->after('address');
            $table->date('birth_date')->nullable()->after('city');
            $table->string('phone')->nullable()->after('birth_date');
            $table->string('bsn')->nullable()->after('phone');
        });

        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignId('instructor_id')
                  ->nullable()
                  ->after('location_id')
                  ->constrained('users')
                  ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['instructor_id']);
            $table->dropColumn('instructor_id');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['address', 'city', 'birth_date', 'phone', 'bsn']);
        });
    }
};
