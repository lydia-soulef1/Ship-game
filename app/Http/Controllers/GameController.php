<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Leaderboard;



class GameController extends Controller
{

    public function updateScore(Request $request)
{
    $validated = $request->validate([
        'score' => 'required|integer',
        'wins' => 'required|integer',
        'losses' => 'required|integer',
        'crystals' => 'required|integer',
    ]);

    $user = Auth::user();
    $guestName = "guest_" . rand(1000, 9999);

    if (!$user) {
        Leaderboard::create([
            'user_id' => null, // الضيف ليس لديه معرف مستخدم
            'name' => $guestName, // ✅ تأكد من عدم تركه فارغًا
            'score' => $validated['score'],
            'wins' => $validated['wins'],
            'losses' => $validated['losses'],
            'crystals' => $validated['crystals'],
            'last_match_time' => now(),
        ]);

        return response()->json(['success' => true, 'message' => "Guest score added to leaderboard"]);
    }

    // ✅ للمستخدم المسجل
    Leaderboard::create([
        'user_id' => $user->id,
        'name' => $user->name ?? $guestName, // ✅ التأكد من وجود الاسم دائمًا
        'score' => $validated['score'],
        'wins' => $validated['wins'],
        'losses' => $validated['losses'],
        'crystals' => $validated['crystals'],
        'last_match_time' => now(),
    ]);

    return response()->json(['success' => true, 'message' => 'Score added to leaderboard']);
}

    public function leaderboard()
    {
        $leaderboard = Leaderboard::orderBy('score', 'desc')->take(10)->get();
        return view('welcome', compact('leaderboard'));
    }

    public function filterLeaderboard(Request $request)
    {
        $period = $request->query('period', 'global');

        $query = Leaderboard::orderBy('score', 'desc');

        if ($period === 'daily') {
            $query->whereDate('last_match_time', today());
        } elseif ($period === 'weekly') {
            $query->whereBetween('last_match_time', [now()->startOfWeek(), now()->endOfWeek()]);
        }

        return response()->json($query->take(10)->get());
    }
}
