<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->integer('gold')->default(200); // 🏆 يبدأ بـ 200 عند إنشاء المستخدم
    });
}

public function down()
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('gold');
    });
}

};
