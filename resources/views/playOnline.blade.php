@extends('layout.layout')

@section('content')
<div class="container mt-5 text-center">
    <h1>Battleship Online 🎯</h1>
    <div class="info d-flex justify-content-center gap-4">
        <p id="player-ships-left">Player Ships Left: 4</p>
        <p id="opponent-ships-left">Opponent Ships Left: 4</p>
    </div>
</div>

<div class="game-container d-flex justify-content-center flex-wrap gap-5 mt-4">
    <div>
        <h2>Player</h2>
        <div id="player-grid" class="grid-container"></div>
    </div>
    <div>
        <h2>Opponent</h2>
        <div id="opponent-grid" class="grid-container"></div>
    </div>
</div>

<div class="mt-3 text-center">
    <button id="retry" class="btn btn-danger">Restart Game</button>
    <a href="/">
        <button class="btn btn-info">Home</button>
    </a>
</div>
@vite(['resources/js/room.js'])


@endsection
