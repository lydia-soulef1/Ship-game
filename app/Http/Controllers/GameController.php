<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Leaderboard;
use Illuminate\Support\Facades\Cache;



class GameController extends Controller
{

    public function updateScore(Request $request)
    {
        $validated = $request->validate([
            'score' => 'required|integer',
            'wins' => 'required|integer',
            'losses' => 'required|integer',
            'crystals' => 'required|integer',
            'match_type' => 'required|string|in:vsOnline,vsComputer',
        ]);
    
        $user = Auth::user();
        $guestName = "guest_" . rand(1000, 9999);
    
        if (!$user) {
            // 🔍 البحث عن سجل الضيف
            $leaderboardEntry = Leaderboard::where('user_id', null)
                ->where('name', $guestName)
                ->first();
    
            if ($leaderboardEntry) {
                $leaderboardEntry->increment('score', $validated['score']);
                $leaderboardEntry->increment('wins', $validated['wins']);
                $leaderboardEntry->increment('losses', $validated['losses']);
                $leaderboardEntry->increment('crystals', $validated['crystals']);
                $leaderboardEntry->update(['last_match_time' => now()]);
    
                return response()->json(['success' => true, 'message' => "Guest score updated in leaderboard"]);
            } else {
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
            $leaderboardEntry->increment('score', $validated['score']);
            $leaderboardEntry->increment('wins', $validated['wins']);
            $leaderboardEntry->increment('losses', $validated['losses']);
            $leaderboardEntry->increment('crystals', $validated['crystals']);
            $leaderboardEntry->update(['last_match_time' => now()]);
        } else {
            Leaderboard::create([
                'user_id' => $user->id,
                'name' => $user->name ?? $guestName,
                'score' => $validated['score'],
                'wins' => $validated['wins'],
                'losses' => $validated['losses'],
                'crystals' => $validated['crystals'],
                'last_match_time' => now(),
            ]);
        }
    
        // ✅ تحديث عدد المباريات
        $matchesPlayed = json_decode($user->matches_played, true) ?? ['vsOnline' => 0, 'vsComputer' => 0];
    
        if (!isset($matchesPlayed[$validated['match_type']])) {
            $matchesPlayed[$validated['match_type']] = 0;
        }
    
        $matchesPlayed[$validated['match_type']] += 1;
    
        $user->update([
            'matches_played' => json_encode($matchesPlayed),
        ]);
    
        return response()->json([
            'success' => true,
            'message' => 'Match played count updated successfully',
            'matches_played' => $matchesPlayed,
        ]);
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
    

    public function createRoom()
    {
        $roomCode = strtoupper(substr(md5(uniqid()), 0, 6)); // كود عشوائي للغرفة
        Cache::put("room_{$roomCode}", ['players' => [], 'moves' => []], now()->addHours(1)); // حفظ البيانات في الكاش لمدة ساعة

        return response()->json(['success' => true, 'roomCode' => $roomCode]);
    }
    public function joinRoom(Request $request)
    {
        $roomCode = $request->room_code;
        $room = Cache::get("room_{$roomCode}");

        if (!$room) {
            return response()->json(['success' => false, 'message' => '❌ الغرفة غير موجودة']);
        }

        if (count($room['players']) >= 2) {
            return response()->json(['success' => false, 'message' => '❌ الغرفة ممتلئة']);
        }

        $room['players'][] = "player_" . (count($room['players']) + 1);
        Cache::put("room_{$roomCode}", $room, now()->addHours(1));

        return response()->json(['success' => true, 'message' => '🎮 انضممت إلى الغرفة']);
    }

    public function getMatchesPlayed()
{
    $user = Auth::user();
    
    if (!$user) {
        return response()->json(['success' => false, 'message' => 'Guests cannot see match statistics.']);
    }

    $matchesPlayed = json_decode($user->matches_played, true);
    
    return response()->json([
        'success' => true,
        'matches_played' => $matchesPlayed,
    ]);
}

}
