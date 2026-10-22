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
        Schema::create('duo_participants', function (Blueprint $table) {
    $table->id();

    $table->foreignId('reservation_id')
          ->constrained()
          ->cascadeOnDelete();

    $table->string('name');
    $table->string('address');
    $table->string('city');
    $table->string('phone');

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('duo_participants');
    }
};
