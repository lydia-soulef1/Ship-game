<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['matches_played', 'gold', 'kraken']);
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('matches_played')->nullable(); // استرجاع العمود عند التراجع
            $table->integer('gold')->default(200); // استرجاع الذهب بالقيمة الابتدائية
            $table->integer('kraken')->default(0); // استرجاع الكراكن بالقيمة الافتراضية
        });
    }
};
