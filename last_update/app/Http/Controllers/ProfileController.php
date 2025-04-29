<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function showProfile()
    {
        $user = Auth::user();

        // فك تشفير عدد المباريات من جدول `users`
        $matchesPlayed = json_decode($user->leaderboard->matches_played, true) ?? ['vsOnline' => 0, 'vsComputer' => 0];

        $achievementsCount = $user->leaderboard->achievements_count ?? 0;
        $tresor = $leaderboard->tresor ?? 0;

        return view('profile', compact('user', 'matchesPlayed', 'achievementsCount', 'tresor'));
    }
}
