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
        Schema::create('reservation_lessons', function (Blueprint $table) {
    $table->id();

    $table->foreignId('reservation_id')
          ->constrained()
          ->cascadeOnDelete();

    $table->date('lesson_date');

    $table->enum('status', [
        'gepland',
        'geannuleerd',
        'afgerond'
    ])->default('gepland');

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservation_lessons');
    }
};
