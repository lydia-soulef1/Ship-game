@extends('layout.layout')

@section('content')




<div class="container d-flex flex-column justify-content-center align-items-center vh-100 text-center">
    <i class="fas fa-ship fa-5x text-white mb-3"></i>
    <h1 class="display-4">🎮 Welcome to the Game</h1>
    <p class="lead">Get ready for an exciting experience!</p>
    <div class="mt-3">
        <div class="mt-3 d-flex justify-content-center gap-3">
            <div class="dropdown">
                <button class="btn btn-success btn-lg dropdown-toggle" type="button" id="playOptions" data-bs-toggle="dropdown" aria-expanded="false">
                    Play Now
                </button>
                <ul class="dropdown-menu" aria-labelledby="playOptions">
                    <li>
                        <a class="dropdown-item" href="/play">
                            Vs Computer
                        </a>
                    </li>
                    <li>
                        <a class="dropdown-item" href="#" onclick="alert('Coming Soon!'); return false;">
                            Vs Online
                        </a>
                    </li>

                    <!-- <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#onlineModal">Vs Online</a></li> -->
                </ul>
            </div>


            <button type="button" class="btn btn-info" data-bs-toggle="modal" data-bs-target="#leaderboardModal">
                🏆 Leaderboard
            </button>
        </div>
    </div>
</div>
<!-- Modal -->
<div class="modal fade" id="onlineModal" tabindex="-1" aria-labelledby="onlineModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="onlineModalLabel">Play Online</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
                <button id="createRoom" class="btn btn-success btn-lg w-100 mb-3">Create New Room</button>

                <hr>
                <input type="text" id="roomCode" class="form-control text-center" placeholder="Enter Room Code">
                <button class="btn btn-info mt-2" id="joinRoom">Join Room</button>
            </div>
        </div>
    </div>
</div>


<div class="modal fade" id="leaderboardModal" tabindex="-1" aria-labelledby="leaderboardModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="leaderboardModalLabel">🏆 Leaderboard</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label for="filterPeriod" class="form-label">Filter by Period:</label>
                    <select id="filterPeriod" class="form-select">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="global">Global</option>
                    </select>
                </div>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Player</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboardBody">
                        @foreach ($leaderboard as $index => $player)
                        <tr>
                            <td>{{ $index + 1 }}</td>
                            <td>{{ $player->name }}</td>
                            <td>{{ $player->score }}
                                <p style="font-size: 12px;">
                                    Wins:
                                    {{ $player->wins ?? 0 }}
                                    Losses:
                                    {{ $player->loses ?? 0 }}
                                </p>
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script>
    document.getElementById('filterPeriod').addEventListener('change', function() {
        let period = this.value;

        fetch(`/leaderboard/filter?period=${period}`)
            .then(response => response.json())
            .then(data => {
                let tbody = document.getElementById('leaderboardBody');
                tbody.innerHTML = ''; // تفريغ الجدول قبل التحديث

                data.forEach((player, index) => {
                    let row = `<tr>
                            <td>${index + 1}</td>
                            <td>${player.name}</td>
                            <td>${player.score}
                                <p style="font-size: 12px;">
                                    Wins: ${player.wins ?? 0} Losses: ${player.loses ?? 0}
                                </p>
                            </td>
                        </tr>`;
                    tbody.innerHTML += row;
                });
            })
            .catch(error => console.error('Error fetching leaderboard:', error));
    });
</script>

<script>
    document.getElementById("createRoom").addEventListener("click", function() {
        let roomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // إنشاء كود عشوائي
        localStorage.setItem("roomCode", roomCode); // حفظ الكود مؤقتًا
        window.location.href = "/playOnline?room=" + roomCode; // توجيه اللاعب إلى الغرفة
    });

    document.getElementById("joinRoom").addEventListener("click", function() {
        let roomCode = prompt("Enter Room Code:");
        if (roomCode) {
            window.location.href = "/playOnline?room=" + roomCode;
        }
    });
</script>

@endsection