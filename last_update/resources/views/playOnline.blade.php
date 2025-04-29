@extends('layout.layout')

@section('content')
<div class="container">
    <h1>Battleship Game</h1>

    <!-- @if(session()->has('current_match')) -->
    <div id="game-container">
        <p>Room ID: <strong>{{ session('current_match.room_id') }}</strong></p>
        <p>You are: <strong>Player {{ session('current_match.player_number') }}</strong></p>

        <div class="row mt-4">
            <div class="col-md-6">
                <h3>Your Board</h3>
                <div id="player-grid" class="grid-container"></div>
            </div>
            <div class="col-md-6">
                <h3>Opponent's Board</h3>
                <div id="opponent-grid" class="grid-container"></div>
            </div>
        </div>
    </div>

    <div id="chat-container">
        <div id="chat-box" style="height: 200px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;"></div>

        <form id="chat-form">
            <input type="text" id="chat-input" placeholder="Type a message..." autocomplete="off" class="form-control mb-2" />
            <button type="submit" class="btn btn-primary">Send</button>
        </form>
    </div>


    <!-- @else
    <div class="alert alert-danger">
        No active game session found. <a href="{{ route('welcome') }}">Return home</a>
    </div>
    @endif -->
</div>

@vite(['resources/js/room.js'])


@endsection