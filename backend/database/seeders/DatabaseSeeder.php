<?php

namespace Database\Seeders;

use App\Enums\CouponType;
use App\Models\Coupon;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Usuarios de prueba (contraseña: rvsena123), menú, cupones y pedidos de ejemplo.
     */
    public function run(): void
    {
        $password = 'rvsena123';

        User::factory()->admin()->create(['name' => 'Administrador RV', 'email' => 'admin@rvsena.com', 'password' => $password]);
        User::factory()->kitchen()->create(['name' => 'Cocina RV', 'email' => 'cocina@rvsena.com', 'password' => $password]);
        User::factory()->create(['name' => 'Sebastián Palacios', 'email' => 'cliente@rvsena.com', 'password' => $password, 'phone' => '3001234567']);
        User::factory(8)->create();

        Coupon::create(['code' => 'SENA10', 'type' => CouponType::Porcentaje, 'value' => 10, 'min_subtotal' => 20000]);
        Coupon::create(['code' => 'BIENVENIDA', 'type' => CouponType::Fijo, 'value' => 5000, 'min_subtotal' => 25000]);
        Coupon::create(['code' => 'VENCIDO', 'type' => CouponType::Porcentaje, 'value' => 50, 'expires_at' => now()->subDay()]);

        $this->call([
            MenuSeeder::class,
            DemoOrdersSeeder::class,
        ]);
    }
}
