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
            'tresor' => 'required|integer',
        ]);

        $user = Auth::user();
        $guestName = "guest_" . rand(1000, 9999);

        // إذا كان المستخدم ضيفًا
        if (!$user) {
            $leaderboardEntry = Leaderboard::where('user_id', null)
                ->where('name', $guestName)
                ->first();

            if ($leaderboardEntry) {
                $leaderboardEntry->increment('score', $validated['score']);
                $leaderboardEntry->increment('wins', $validated['wins']);
                $leaderboardEntry->increment('losses', $validated['losses']);
                $leaderboardEntry->increment('tresor', $validated['tresor']);
                $leaderboardEntry->update(['last_match_time' => now()]);
            } else {
                $leaderboardEntry = Leaderboard::create([
                    'user_id' => null,
                    'name' => $guestName,
                    'score' => $validated['score'],
                    'wins' => $validated['wins'],
                    'losses' => $validated['losses'],
                    'tresor' => $validated['tresor'],
                    'matches_played' => json_encode(['vsOnline' => 0, 'vsComputer' => 0]),
                    'last_match_time' => now(),
                ]);
            }

            // ✅ تعريف `$matchesPlayed` حتى لو لم يكن هناك `match_type`
            $matchesPlayed = json_decode($leaderboardEntry->matches_played, true) ?? ['vsOnline' => 0, 'vsComputer' => 0];

            if ($request->has('match_type')) {
                $matchesPlayed[$request->match_type] = ($matchesPlayed[$request->match_type] ?? 0) + 1;
                $leaderboardEntry->update(['matches_played' => json_encode($matchesPlayed)]);
            }

            return response()->json([
                'success' => true,
                'message' => "Guest score updated successfully",
            ]);
        }

        // 🔍 البحث عن سجل المستخدم
        $leaderboardEntry = Leaderboard::where('user_id', $user->id)->first();

        if ($leaderboardEntry) {
            $leaderboardEntry->increment('score', $validated['score']);
            $leaderboardEntry->increment('wins', $validated['wins']);
            $leaderboardEntry->increment('losses', $validated['losses']);
            $leaderboardEntry->increment('tresor', $validated['tresor']);
            $leaderboardEntry->update(['last_match_time' => now()]);
        } else {
            $leaderboardEntry = Leaderboard::create([
                'user_id' => $user->id,
                'name' => $user->name ?? $guestName,
                'score' => $validated['score'],
                'wins' => $validated['wins'],
                'losses' => $validated['losses'],
                'tresor' => $validated['tresor'],
                'matches_played' => json_encode(['vsOnline' => 0, 'vsComputer' => 0]),
                'last_match_time' => now(),
            ]);
        }

        // ✅ تعريف `$matchesPlayed` قبل استخدامه
        $matchesPlayed = json_decode($leaderboardEntry->matches_played, true) ?? ['vsOnline' => 0, 'vsComputer' => 0];

        if ($request->has('match_type')) {
            $matchesPlayed[$request->match_type] = ($matchesPlayed[$request->match_type] ?? 0) + 1;
            $leaderboardEntry->update(['matches_played' => json_encode($matchesPlayed)]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Score updated successfully',
        ]);
    }

    public function updateKraken(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not authenticated.']);
        }

        $leaderboard = $user->leaderboard;
        $leaderboard->increment('kraken', $request->increment);

        return response()->json([
            'success' => true,
            'newKrakenCount' => $leaderboard->kraken
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
