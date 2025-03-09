<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leaderboard extends Model
{
    use HasFactory;

    protected $table = 'leaderboard'; // تأكد من اسم الجدول
    protected $fillable = [
        'user_id',
        'name', // ✅ تأكد من أن هذا الحقل موجود
        'score',
        'wins',
        'losses',
        'crystals',
        'last_match_time',
    ];
    

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
