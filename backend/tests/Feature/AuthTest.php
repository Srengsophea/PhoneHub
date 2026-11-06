<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test Customer',
            'email' => 'customer@test.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
            'phone' => '+855 12 999 888',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    'user' => ['id', 'name', 'email'],
                    'token',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'customer@test.com',
            'role' => 'customer',
        ]);
    }

    public function test_customer_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'valid@test.com',
            'password' => bcrypt('ValidPass123!'),
            'role' => 'customer',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'valid@test.com',
            'password' => 'ValidPass123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user',
                ],
            ]);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'fail@test.com',
            'password' => bcrypt('CorrectPassword123!'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'fail@test.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_fetch_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Profile User',
            'email' => 'profile@test.com',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/user');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'profile@test.com',
                ],
            ]);
    }
}
