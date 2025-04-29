@extends('layout.layout')

@section('content')




<div class="container d-flex flex-column justify-content-center align-items-center vh-100 text-center">
    <i class="fas fa-ship fa-5x text-white mb-3"></i>
    <h1 class="display-4">🎮 Welcome to the Game</h1>
    <p class="lead">Get ready for an exciting experience!</p>
    <div class="mt-3">
        <div class="mt-3 d-flex justify-content-center gap-3">
            <!-- زر Play Now لفتح المودال -->
            <button class="btn btn-success btn-lg" data-bs-toggle="modal" data-bs-target="#playModal">
                Play Now
            </button>

            <!-- ✅ Modal -->
            <div class="modal fade" id="playModal" tabindex="-1" aria-labelledby="playModalLabel">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content text-dark">
                        <div class="modal-header">
                            <h5 class="modal-title" id="playModalLabel">Choose Game Mode</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div class="modal-body">
                            <div class="row">
                                <!-- Vs Bot -->
                                <div class="col-md-6 text-center">
                                    <h5>Vs Bot</h5>
                                    <a href="/play" class="image-link">
                                        <img src="/images/bot.jpg" alt="Bot" class="game-image rounded shadow-sm">
                                    </a>
                                </div>

                                <!-- Vs Online -->
                                <div class="col-md-6 text-center">
                                    <h5>Vs Online</h5>
                                    <a id="find-match" class="image-link">
                                        <img src="/images/opponent.jpg" alt="Online Match" class="game-image rounded shadow-sm">
                                    </a>
                                    <div id="game-status" class="alert alert-info mt-2 d-none">
                                        <img src="/images/wait.jpg" alt="Wait Match" class="game-image rounded shadow-sm">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="waitModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-fullscreen-sm-down">
                    <div class="modal-content bg-dark text-white border-0">
                        <div class="modal-body text-center p-0 position-relative">
                            <!-- صورة الانتظار مكبرة -->
                            <img src="{{ asset('images/wait.jpg') }}" alt="Wait Match" class="img-fluid w-100" style="max-height: 120vh; object-fit: cover;">

                            <!-- زر إلغاء المباراة -->
                            <div class="position-absolute bottom-0 start-50 translate-middle-x mb-4">
                                <button type="button" class="btn btn-danger btn-lg mt-5" id="cancel-matchmaking-btn">
                                    Cancel Matchmaking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            @push('scripts')
            <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
            <script>
                const socket = io("http://localhost:3000");

                // دالة لبدء البحث عن الخصم
                function joinQueue() {
                    document.getElementById('game-status').classList.remove('d-none');

                    fetch('/initialize-game-session', {
                            method: 'POST',
                            headers: {
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                                'Content-Type': 'application/json',
                            }
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                const socketUserId = data.socket_user_id;
                                socket.emit('join_queue', {
                                    user_id: socketUserId
                                });
                                console.log('User joined queue with ID:', socketUserId);
                            } else {
                                alert("فشل في تهيئة الجلسة.");
                                document.getElementById('game-status').classList.add('d-none');
                            }
                        })
                        .catch(err => {
                            console.error('Error initializing game session', err);
                            document.getElementById('game-status').classList.add('d-none');
                        });
                }

                // معالج الحدث لزر البحث
                document.getElementById('find-match').addEventListener('click', joinQueue);

                // معالج الحدث لزر إلغاء البحث
                document.getElementById('cancel-matchmaking-btn').addEventListener('click', function() {
                    // إلغاء انضمام المستخدم إلى الطابور عبر Socket
                    const userId = 'user-id-here'; // استبدل هذا بـ user_id الفعلي
                    socket.emit('cancel_queue', {
                        user_id: userId
                    });

                    // إخفاء حالة اللعبة
                    document.getElementById('game-status').classList.add('d-none');

                    // إغلاق الـ Modal
                    const waitModal = bootstrap.Modal.getInstance(document.getElementById('waitModal'));
                    waitModal.hide();

                    // إذا كانت هناك حاجة إلى إيقاف البحث على الخادم، يجب عليك إرسال طلب للخادم ليتوقف عن البحث هنا.
                    fetch('/stop-search', {
                            method: 'POST',
                            headers: {
                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                user_id: userId
                            })
                        })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                console.log("Search canceled on the server.");
                            } else {
                                console.log("Failed to cancel search on the server.");
                            }
                        })
                        .catch(err => {
                            console.error('Error canceling search on the server', err);
                        });
                });
            </script>
            @endpush



            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const openWaitModalBtn = document.getElementById('find-match');
                    const cancelMatchmakingBtn = document.getElementById('cancel-matchmaking-btn');
                    const playModalEl = document.getElementById('playModal');
                    const waitModalEl = document.getElementById('waitModal');

                    let playModal = new bootstrap.Modal(playModalEl);
                    let waitModal = new bootstrap.Modal(waitModalEl);

                    openWaitModalBtn.addEventListener('click', function(e) {
                        e.preventDefault();

                        // إزالة التركيز من الرابط قبل إغلاق المودال الحالي
                        openWaitModalBtn.blur();

                        // Check if playModal is visible
                        if (playModalEl.classList.contains('show')) {
                            playModalEl.addEventListener('hidden.bs.modal', () => {
                                waitModal.show();
                            }, {
                                once: true
                            });

                            playModal.hide();
                        } else {
                            waitModal.show();
                        }
                    });
                    cancelMatchmakingBtn.addEventListener('click', () => {
                        // إغلاق الـ waitModal
                        waitModal.hide();

                        // فتح الـ playModal بعد فترة قصيرة
                        setTimeout(() => {
                            playModal.show();
                        }, 300); // تأخير صغير لفتح playModal
                    });

                });
            </script>

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
                <h5 class="modal-title text-dark" id="leaderboardModalLabel">🏆 Leaderboard</h5>
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
        window.location.href = "/playOnline?room=" + roomCode;

    });
</script>

@vite(['resources/js/room.js'])


@endsection