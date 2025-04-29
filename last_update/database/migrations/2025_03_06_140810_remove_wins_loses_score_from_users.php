<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['wins', 'loses', 'score']);
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->integer('wins')->default(0);
            $table->integer('loses')->default(0);
            $table->integer('score')->default(0);
        });
    }
};

