<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Leaderboard;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;



class GameController extends Controller
{

    public function updateScore(Request $request)
    {
        $validated = $request->validate([
            'score' => 'required|integer',
            'wins' => 'required|integer',
            'losses' => 'required|integer',
            'tresor' => 'required|integer',
            'match_type' => 'sometimes|string'
        ]);

        $user = Auth::user();
        $isGuest = !$user;

        // Generate consistent guest identifier for Socket.IO
        $guestId = $isGuest ? 'guest_' . session()->getId() : null;

        $leaderboardData = [
            'score' => $validated['score'],
            'wins' => $validated['wins'],
            'losses' => $validated['losses'],
            'tresor' => $validated['tresor'],
            'last_match_time' => now(),
            'matches_played' => json_encode([
                'vsOnline' => 0,
                'vsComputer' => 0
            ])
        ];

        if ($isGuest) {
            $leaderboardEntry = Leaderboard::updateOrCreate(
                ['session_id' => session()->getId()],
                array_merge($leaderboardData, [
                    'name' => 'Guest_' . Str::random(4),
                    'session_id' => session()->getId()
                ])
            );
        } else {
            $leaderboardEntry = Leaderboard::updateOrCreate(
                ['user_id' => $user->id],
                array_merge($leaderboardData, [
                    'user_id' => $user->id,
                    'name' => $user->name
                ])
            );
        }

        // Update match type if provided
        if ($request->has('match_type')) {
            $matchesPlayed = json_decode($leaderboardEntry->matches_played, true) ?? [];
            $matchesPlayed[$request->match_type] = ($matchesPlayed[$request->match_type] ?? 0) + 1;
            $leaderboardEntry->update(['matches_played' => json_encode($matchesPlayed)]);
        }

        // Store user identifier for Socket.IO
        if ($isGuest) {
            session(['socket_user_id' => $guestId]);
        } else {
            session(['socket_user_id' => 'user_' . $user->id]);
        }

        return response()->json([
            'success' => true,
            'socket_user_id' => session('socket_user_id'),
            'message' => $isGuest ? "Guest score updated" : "Score updated"
        ]);
    }

    public function initializeGameSession(Request $request)
{
    $user = Auth::user();
    $isGuest = !$user;
    $socketUserId = session(
        'socket_user_id',
        $isGuest ? 'guest_' . session()->getId() : 'user_' . ($user->id ?? Str::random(8))
    );

    session(['socket_user_id' => $socketUserId]);

    $score = 0;

    if (!$isGuest && $user->leaderboard) {
        $score = $user->leaderboard->score;
    } elseif ($isGuest) {
        $guest = Leaderboard::where('session_id', session()->getId())->first();
        $score = $guest?->score ?? 0;
    }

    return response()->json([
        'success' => true,
        'socket_user_id' => $socketUserId,
        'score' => $score,
        'is_guest' => $isGuest
    ]);
}


    public function createRoom(Request $request)
    {
        $socketUserId = session('socket_user_id');
        if (!$socketUserId) {
            return response()->json(['success' => false, 'message' => 'Session not initialized']);
        }

        $roomCode = strtoupper(Str::random(6));
        $roomData = [
            'host' => $socketUserId,
            'players' => [$socketUserId],
            'created_at' => now(),
            'match_id' => 'match_' . Str::uuid()
        ];

        Cache::put("room_{$roomCode}", $roomData, now()->addHours(1));

        return response()->json([
            'success' => true,
            'roomCode' => $roomCode,
            'match_id' => $roomData['match_id'],
            'player_number' => 1 // Host is always player 1
        ]);
    }

    public function joinRoom(Request $request)
    {
        $request->validate(['room_code' => 'required|string|size:6']);
        $socketUserId = session('socket_user_id');

        $roomCode = strtoupper($request->room_code);
        $room = Cache::get("room_{$roomCode}");

        if (!$room) {
            return response()->json(['success' => false, 'message' => 'Room not found']);
        }

        if (count($room['players']) >= 2) {
            return response()->json(['success' => false, 'message' => 'Room full']);
        }

        $room['players'][] = $socketUserId;
        Cache::put("room_{$roomCode}", $room, now()->addHours(1));

        return response()->json([
            'success' => true,
            'match_id' => $room['match_id'],
            'player_number' => 2,
            'opponent_id' => $room['host']
        ]);
    }

    public function playOnline(Request $request)
    {
        // التحقق من صحة الطلب
        $request->validate([
            'match' => 'required|string|regex:/^match_[a-zA-Z0-9-]+$/',
            'player' => 'required|in:1,2'
        ]);

        $matchId = 'match_' . time();

            $matchData = [
                'players' => [
                    '1' => 'player1SocketId', // استبدل بقيم حقيقية
                    '2' => 'player2SocketId',
                ],
                'created_at' => now(),
            ];

        // التحقق من وجود بيانات المباراة في الكاش
        Cache::put('match_' . $matchId, $matchData, now()->addMinutes(10));

        if (!$matchData) {
            // إذا لم تكن البيانات موجودة في الكاش، قم بإنشاء بيانات المباراة
        

            // تخزين بيانات المباراة في الكاش
            Cache::put('match_' . $matchId, $matchData, now()->addMinutes(10));

            // تحقق من البيانات المخزنة
            


            return redirect()->route('/')->withErrors([
                'game' => 'Match session expired or invalid'
            ]);
        }



        // التحقق من رقم اللاعب داخل بيانات المباراة
        if (!isset($matchData['players'][$request->player])) {
            return redirect()->back()->withErrors([
                'player' => 'Invalid player position'
            ]);
        }

        // حفظ بيانات المباراة في الـ session لعرضها في واجهة اللعبة
        session([
            'current_match' => [
                'room_id' => $request->match,
                'player_number' => (int)$request->player,
            ]
        ]);
      

        // عرض صفحة اللعبة
        return view('playOnline', [
            'gameId' => $request->match,
            'playerNumber' => (int)$request->player,
            'opponentId' => $this->getOpponentId($matchData, $request->player),
            'socketConfig' => [
                'server' => config('app.socket_server'),
                'userId' => auth()->id(),
                'matchId' => $request->match
            ]
        ]);
        
    }


    protected function getOpponentId($matchData, $currentPlayer)
    {
        return collect($matchData['players'])
            ->first(fn($player, $num) => $num != $currentPlayer)['user_id'] ?? null;
    }

    protected function validateMatchSession($matchId, $playerNumber)
    {
        // Implement your match validation logic here
        // Example: Check if match exists in cache/database
        return preg_match('/^match_/', $matchId) && in_array($playerNumber, [1, 2]);
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
