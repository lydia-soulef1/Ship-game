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
            // 🔍 البحث عن سجل الضيف
            $leaderboardEntry = Leaderboard::where('user_id', null)
                ->where('name', $guestName)
                ->first();
    
            if ($leaderboardEntry) {
                // ✅ تحديث القيم بإضافة الجديد إلى السابق
                $leaderboardEntry->increment('score', $validated['score']);
                $leaderboardEntry->increment('wins', $validated['wins']);
                $leaderboardEntry->increment('losses', $validated['losses']);
                $leaderboardEntry->increment('crystals', $validated['crystals']);
                $leaderboardEntry->update(['last_match_time' => now()]);
    
                return response()->json(['success' => true, 'message' => "Guest score updated in leaderboard"]);
            } else {
                // 🆕 إنشاء سجل جديد للضيف
                Leaderboard::create([
                    'user_id' => null,
                    'name' => $guestName,
                    'score' => $validated['score'],
                    'wins' => $validated['wins'],
                    'losses' => $validated['losses'],
                    'crystals' => $validated['crystals'],
                    'last_match_time' => now(),
                ]);
    
                return response()->json(['success' => true, 'message' => "Guest score added to leaderboard"]);
            }
        }
    
        // 🔍 البحث عن سجل المستخدم
        $leaderboardEntry = Leaderboard::where('user_id', $user->id)->first();
    
        if ($leaderboardEntry) {
            // ✅ تحديث القيم بإضافة الجديد إلى السابق
            $leaderboardEntry->increment('score', $validated['score']);
            $leaderboardEntry->increment('wins', $validated['wins']);
            $leaderboardEntry->increment('losses', $validated['losses']);
            $leaderboardEntry->increment('crystals', $validated['crystals']);
            $leaderboardEntry->update(['last_match_time' => now()]);
    
            return response()->json(['success' => true, 'message' => 'Score updated in leaderboard']);
        }
    
        // 🆕 إنشاء سجل جديد إذا لم يكن المستخدم لديه سجل سابق
        Leaderboard::create([
            'user_id' => $user->id,
            'name' => $user->name ?? $guestName,
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
