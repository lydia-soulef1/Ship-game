<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

Route::get('/', function () {
    return view('welcome');
})->name('welcome');;

require __DIR__.'/auth.php';


Route::get('/play', function () {
    return view('game');
});

Route::get('/profile', function () {
    if (Auth::check()) {
        return view('profile');
    }
    return redirect('/login'); // توجيه المستخدم إلى صفحة تسجيل الدخول إذا لم يكن مسجلًا
})->name('profile');

Route::get('/register', function () {
    return view('auth.register'); // تأكد أن لديك `resources/views/auth/register.blade.php`
})->name('register.form');


Route::post('/register', [RegisteredUserController::class, 'store'])->name('register');


Route::post('/login', [AuthenticatedSessionController::class, 'store'])->name('login');
Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

use App\Http\Controllers\GameController;

Route::get('/', [GameController::class, 'leaderboard'])->name('welcome');
Route::get('/leaderboard/filter', [GameController::class, 'filterLeaderboard']);
Route::post('/update-score', [GameController::class, 'updateScore']);

// Matchmaking Routes
Route::middleware('auth')->group(function () {
    // Handle game session initialization
    Route::post('/initialize-game', [GameController::class, 'initializeGameSession'])
        ->name('game.initialize');
    
    // View for online play
    Route::get('/playOnline', [GameController::class, 'playOnline'])
        ->name('playOnline');
    
    // Store match data with enhanced validation
    Route::post('/store-match-data', function (Request $request) {
        $validated = $request->validate([
            'match_id' => [
                'required',
                'string',
                'regex:/^match_[a-zA-Z0-9-]+$/'
            ],
            'player_number' => [
                'required',
                'numeric',
                'in:1,2',
                function ($attribute, $value, $fail) use ($request) {
                    // Ensure player number isn't already taken
                    $match = Cache::get('match_'.$request->match_id);
                    if ($match && in_array($value, $match['players'])) {
                        $fail('This player position is already taken.');
                    }
                }
            ],
            'opponent_id' => 'required|string' // Changed to string for Socket.IO compatibility
        ]);
        
        // Store match data with expiration
        $matchData = [
            'match_id' => $validated['match_id'],
            'player_number' => (int)$validated['player_number'],
            'opponent_id' => $validated['opponent_id'],
            'user_id' => auth()->id(),
            'socket_id' => $request->header('X-Socket-ID'), // From client
            'created_at' => now()
        ];
        
        session(['current_match' => $matchData]);
        
        // Cache match data for Socket.IO access
        Cache::put(
            'match_'.$validated['match_id'],
            [
                'players' => [
                    $validated['player_number'] => [
                        'user_id' => auth()->id(),
                        'socket_id' => $request->header('X-Socket-ID')
                    ]
                ],
                'status' => 'waiting'
            ],
            now()->addHours(1)
        );
        
        return response()->json([
            'status' => 'success',
            'match_data' => $matchData
        ]);
    })->name('match.store');
    
    // Match cleanup route
    Route::post('/cleanup-match/{matchId}', function ($matchId) {
        Cache::forget('match_'.$matchId);
        session()->forget('current_match');
        return response()->json(['status' => 'cleaned']);
    })->name('match.cleanup');
});

Route::get('/dashboard', function () {
    return view('dashboard'); // تأكد أنك أنشأت ملف resources/views/dashboard.blade.php
})->name('dashboard');


Route::post('/create-room', function () {
    $roomCode = strtoupper(substr(md5(uniqid()), 0, 6)); 
    Cache::put("room_$roomCode", ['player1' => null, 'player2' => null], now()->addMinutes(30)); 
    return response()->json(['roomCode' => $roomCode]);
});

Route::post('/join-room', function (Request $request) {
    $roomCode = $request->input('roomCode');
    $roomData = Cache::get("room_$roomCode");

    if (!$roomData) return response()->json(['error' => 'Room not found'], 404);

    if (!$roomData['player1']) {
        $roomData['player1'] = session()->getId();
    } elseif (!$roomData['player2']) {
        $roomData['player2'] = session()->getId();
    } else {
        return response()->json(['error' => 'Room is full'], 400);
    }

    Cache::put("room_$roomCode", $roomData, now()->addMinutes(30));
    return response()->json(['success' => true]);
});

Route::get('/game-status', function (Request $request) {
    $roomCode = $request->query('roomCode');
    $roomData = Cache::get("room_$roomCode");

    if (!$roomData) return response()->json(['status' => 'Room not found']);

    if ($roomData['player1'] && $roomData['player2']) {
        return response()->json(['status' => 'Game Started!']);
    }

    return response()->json(['status' => 'Waiting for players...']);
});

// Route in web.php
Route::post('/initialize-game-session', [GameController::class, 'initializeGameSession']);


Route::get('/matches-played', [GameController::class, 'getMatchesPlayed'])->middleware('auth');

use App\Http\Controllers\ProfileController;

Route::get('/profile', [ProfileController::class, 'showProfile'])->middleware('auth')->name('profile');

Route::post('/update-kraken', [GameController::class, 'updateKraken'])->name('update.kraken');
