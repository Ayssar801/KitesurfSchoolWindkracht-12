<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservation_lessons', function (Blueprint $table) {
            $table->time('start_time')->default('09:00:00')->after('daypart');
        });
    }

    public function down(): void
    {
        Schema::table('reservation_lessons', function (Blueprint $table) {
            $table->dropColumn('start_time');
        });
    }
};
