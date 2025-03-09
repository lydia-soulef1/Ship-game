<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Log;

class RegisteredUserController extends Controller
{

    

public function store(Request $request)
{
    try {
        Log::info('Register request received', $request->all());

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Log::info('User registered successfully', ['user_id' => $user->id]);

        Auth::login($user);

        return redirect()->route('dashboard');
    } catch (\Exception $e) {
        Log::error('Registration error', ['message' => $e->getMessage()]);
        return back()->withErrors('حدث خطأ أثناء التسجيل.');
    }
}

}


