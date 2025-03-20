<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
})->name('welcome');;

require __DIR__.'/auth.php';

Route::get('/play', function () {
    return view('game');
});

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
