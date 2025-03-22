<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('welcome');;

require __DIR__.'/auth.php';


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

Route::post('/update-score', [GameController::class, 'updateScore']);

Route::get('/', [GameController::class, 'leaderboard'])->name('welcome');
Route::get('/leaderboard/filter', [GameController::class, 'filterLeaderboard']);


Route::get('/playOnline', function () {
    return view('playOnline');
})->name('playOnline');

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

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



Route::get('/matches-played', [GameController::class, 'getMatchesPlayed'])->middleware('auth');
