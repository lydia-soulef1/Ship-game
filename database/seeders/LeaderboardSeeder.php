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
                        'user_id' => $user->user_id,
                        'name' => $user->name,
                        'score' => $user->score,
                        'wins' => $user->wins,
                        'losses' => $user->loses,
                        'last_match_time' => now(),
                        'crystals' => 0,
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                })->toArray()
        );
    }
}

