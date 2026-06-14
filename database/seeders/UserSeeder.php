<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Sam Manzano',
                'email' => 'manzano.sheramae@ue.edu.ph',
                'password' => '1q2w3r4r',
                'status' => 'active',
                'role' => 'admin'
            ],
            [
                'name' => 'Autumn Tandog',
                'email' => 'tandog.autumnphenelope@ue.edu.ph',
                'password' => 'pass1234',
                'status' => 'active',
                'role' => 'admin'
            ],
            [
                'name' => 'Charles Bryant Librada',
                'email' => 'librada.charlesbryant@ue.edu.ph',
                'password' => 'hello1234',
                'status' => 'active',
                'role' => 'admin'
            ],
            [
                'name' => 'Earl Joshua Espinosa',
                'email' => 'espinosa.earljoshua@ue.edu.ph',
                'password' => 'password',
                'status' => 'active',
                'role' => 'admin'
            ]
        ];

        foreach($users as $userData) {
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => $userData['password'],
                'status' => 'active'
            ]);

            $user->role = $userData['role'];
            $user->save();
        }
    }
}
