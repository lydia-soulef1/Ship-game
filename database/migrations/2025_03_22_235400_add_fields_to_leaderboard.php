<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
 
        public function up()
        {
            Schema::table('leaderboard', function (Blueprint $table) {
                $table->json('matches_played')->default(json_encode(['vsOnline' => 0, 'vsComputer' => 0]));
                $table->integer('gold')->default(200);
                $table->integer('kraken')->default(0);
            });
        }
    
        public function down()
        {
            Schema::table('leaderboard', function (Blueprint $table) {
                $table->dropColumn(['matches_played', 'gold', 'kraken']);
            });
        }
    
    
};
