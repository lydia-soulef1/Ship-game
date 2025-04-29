<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leaderboard extends Model
{
    use HasFactory;

    protected $table = 'leaderboard'; // تأكد من اسم الجدول
    protected $fillable = [
        'user_id', 'name', 'score', 'wins', 'losses',
        'last_match_time', 'tresor', 'gold', 'kraken',
        'achievements_count', 'matches_played'
    ];
    

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
