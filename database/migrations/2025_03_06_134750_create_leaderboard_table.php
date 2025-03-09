<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('leaderboard', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade'); // ✅ السماح بـ NULL
        $table->string('name');
        $table->integer('score')->default(0);
        $table->integer('wins')->default(0);
        $table->integer('losses')->default(0);
        $table->timestamp('last_match_time')->nullable();
        $table->integer('crystals')->default(0);
        $table->timestamps();
    });
    
}

};
