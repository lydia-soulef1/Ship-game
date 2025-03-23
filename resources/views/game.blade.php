@extends('layout.layout')


@section('content')

<!-- ✅ Bootstrap Modal for treasure found -->
<div class="modal fade" id="treasureModal" tabindex="-1" aria-labelledby="treasureModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content text-center"> <!-- Center align everything -->
            <div class="modal-header">
                <h5 class="modal-title text-dark fw-bold w-100">🎉 You Found the Treasure! 🎉</h5>
            </div>
            <div class="modal-body">
                <p class="text-dark">You earned <strong>25 points</strong> and <strong>1 Kraken</strong>!</p>
            </div>
            <div class="modal-footer justify-content-center"> <!-- Center the button -->
                <button type="button" class="btn btn-success px-4" data-bs-dismiss="modal" id="collectTreasure">Collect</button>
            </div>
        </div>
    </div>
</div>




<div class="container mt-5">
    <h1>Battleship Game 🎯</h1>
    <div class="info">
        <p id="player-ships-left">Player Ships Left: 4</p>
        <p id="computer-ships-left">Computer Ships Left: 4</p>
    </div>
</div>


<div class="game-container">
    <!-- Ship Selection UI -->
    <div id="ship-selection" class="card p-3 text-center">
        <h5 class="text-dark fw-bold">Select & Place Ships</h5>
        <div id="ship-options" class="d-flex flex-wrap gap-2 justify-content-center"></div>
        <button id="flip-button" class="btn btn-primary mt-2">Flip</button>
        <button id="random-btn" class="btn btn-danger mt-2">Random</button>
        <button id="start-game-button" class="btn btn-success mt-2">Start Game</button>
    </div>

    <!-- Player's Grid -->
    <div id="player-section">
        <h2>Player</h2>
        <div id="player-grid" class="grid-container"></div>
    </div>

    <!-- Computer's Grid (Hidden Until Game Starts) -->
    <div id="computer-section" style="display: none;">
        <h2>Computer</h2>
        <div id="computer-grid" class="grid-container"></div>
    </div>
</div>




<div class="mt-3">
    <button id="retry" class="btn btn-danger">Restart Game</button>
    <a href="/">
        <button class="btn btn-info">Home</button>
    </a>
</div>

<script>
    document.getElementById("collectTreasure").addEventListener("click", function() {
        fetch("{{ route('update.kraken') }}", {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": "{{ csrf_token() }}",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    increment: 1
                }) // Add 1 Kraken
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById("kraken-count").textContent = data.newKrakenCount;
                }
            })
            .catch(error => console.error("Error:", error));
    });
</script>

@vite(['resources/js/ship.js'])

@endsection