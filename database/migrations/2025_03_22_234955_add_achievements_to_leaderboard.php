<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::table('leaderboard', function (Blueprint $table) {
        $table->integer('achievements_count')->default(0);
    });
}

public function down()
{
    Schema::table('leaderboard', function (Blueprint $table) {
        $table->dropColumn('achievements_count');
    });
}

};
