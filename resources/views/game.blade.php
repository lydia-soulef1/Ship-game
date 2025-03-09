@extends('layout.layout')


@section('content')

<h1>Battleship Game 🎯</h1>
<div class="info">
    <p id="player-ships-left">Player Ships Left: 4</p>
    <p id="computer-ships-left">Computer Ships Left: 4</p>
</div>



<div class="game-container">
    <div>
        <h2>Computer</h2>
        <div id="player-grid" class="grid-container"></div>
    </div>
    <div>
        <h2>Player</h2>
        <div id="computer-grid" class="grid-container"></div>
    </div>
</div>

<div class="mt-3">
    <button id="retry" class="btn btn-danger">Restart Game</button>
    <a href="/">
        <button class="btn btn-info">Home</button>
    </a>
</div>


@endsection