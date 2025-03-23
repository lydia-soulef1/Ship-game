@extends('layout.layout')

@section('content')
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card shadow-lg border-0 rounded-4 mt-5">
                <div class="card-body text-center">
                    <!-- 🖼 صورة المستخدم -->
                    <div class="mb-3">
                        <img src="{{ Auth::user()->photo ?? asset('images/unknown.webp') }}"
                            alt="User Avatar"
                            class="rounded-circle border shadow-sm"
                            style="width: 120px; height: 120px; object-fit: cover;">
                    </div>

                    <!-- 👤 اسم المستخدم واللقب -->
                    <h3 class="fw-bold text-primary">{{ Auth::user()->name }}</h3>
                    @if(Auth::user()->nickname)
                    <h5 class="text-muted">"{{ Auth::user()->nickname }}"</h5>
                    @endif

                    <!-- 🏆 الإحصائيات -->
                    <div class="mt-4">
                        <h5 class="fw-bold text-secondary">🎮 Player Statistics:</h5>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item d-flex justify-content-between">
                                <span>⭐ Score:</span>
                                <span class="fw-bold">{{ Auth::user()->leaderboard->score ?? 0 }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>🏆 Wins:</span>
                                <span class="fw-bold">{{ Auth::user()->leaderboard->wins ?? 0 }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>💔 Losses:</span>
                                <span class="fw-bold">{{ Auth::user()->leaderboard->loses ?? 0 }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>
                                    <img src="{{ asset('images/treasure-chest.png') }}" alt="Treasure Chest" width="24" height="24">
                                    Tresor:
                                </span>
                                <span id="tresor-count" class="fs-6 fw-bold">{{ Auth::user()->leaderboard->tresor ?? 0 }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>🏅 Total Achievements:</span>
                                <span class="fw-bold">{{ Auth::user()->leaderboard->achievements_count ?? 0 }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>🎮 Matches Played (vs Online):</span>
                                <span class="fw-bold">{{ $matchesPlayed['vsOnline'] ?? 0 }}</span>
                            </li>
                            <li class="list-group-item d-flex justify-content-between">
                                <span>🤖 Matches Played (vs Computer):</span>
                                <span class="fw-bold">{{ $matchesPlayed['vsComputer'] ?? 0 }}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="text-center text-muted mt-4">
                        <small>📅 Account Created On: {{ Auth::user()->created_at->format('F d, Y') }}</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection