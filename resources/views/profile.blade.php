@extends('layout.layout')

@section('content')
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card shadow-lg border-0 rounded-4">
                <div class="card-body text-center">
                    <!-- 🖼 صورة المستخدم -->
                    <div class="mb-3">
                        <img src="{{ Auth::user()->photo ?? asset('default-avatar.png') }}"
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
                        </ul>
                    </div>


                </div>
            </div>
        </div>
    </div>
</div>
@endsection