<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_visitor_can_register_and_receives_a_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Ana Gómez',
            'email' => 'ANA@correo.com',
            'password' => 'secreta123',
            'password_confirmation' => 'secreta123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.email', 'ana@correo.com')
            ->assertJsonPath('data.user.role', 'cliente')
            ->assertJsonStructure(['data' => ['token']]);
    }

    public function test_registration_cannot_choose_a_role(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Pirata',
            'email' => 'pirata@correo.com',
            'password' => 'secreta123',
            'password_confirmation' => 'secreta123',
            'role' => 'admin',
        ])->assertCreated()->assertJsonPath('data.user.role', 'cliente');
    }

    public function test_email_must_be_unique(): void
    {
        User::factory()->create(['email' => 'ana@correo.com']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Ana',
            'email' => 'ana@correo.com',
            'password' => 'secreta123',
            'password_confirmation' => 'secreta123',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_a_user_can_log_in_and_out(): void
    {
        User::factory()->create(['email' => 'ana@correo.com', 'password' => 'secreta123']);

        $token = $this->postJson('/api/v1/auth/login', ['email' => 'ana@correo.com', 'password' => 'secreta123'])
            ->assertOk()
            ->json('data.token');

        $this->withToken($token)->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('data.email', 'ana@correo.com');
        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_wrong_credentials_are_rejected(): void
    {
        User::factory()->create(['email' => 'ana@correo.com', 'password' => 'secreta123']);

        $this->postJson('/api/v1/auth/login', ['email' => 'ana@correo.com', 'password' => 'otra'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_guests_get_401_on_protected_routes(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->get('/api/v1/orders')->assertUnauthorized();
    }
}
