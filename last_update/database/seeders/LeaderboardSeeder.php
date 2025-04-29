<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;


class LeaderboardSeeder extends Seeder
{
    public function run()
    {
        DB::table('leaderboard')->insert(
            DB::table('users')->select('id as user_id', 'name', 'score', 'wins', 'loses')
                ->get()->map(function ($user) {
                    return [
                        'gold' => 200, // قيمة البداية
                        'kraken' => 0, // قيمة افتراضية
                        'achievements_count' => 0,
                        'matches_played' => json_encode([
                            'vsOnline' => $user->matches_played['vsOnline'] ?? 0,
                            'vsComputer' => $user->matches_played['vsComputer'] ?? 0,
                        ]),
                    ];
                })->toArray()
        );
    }
}
