<?php

namespace Tests\Feature;

use App\Enums\CouponType;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'type' => 'mesa',
            'table_number' => 4,
            'payment_method' => 'efectivo',
            'items' => [],
        ], $overrides);
    }

    public function test_the_total_is_calculated_on_the_server(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $burger = Product::factory()->create(['price' => 20000]);
        $soda = Product::factory()->create(['price' => 5000]);

        $response = $this->postJson('/api/v1/orders', $this->payload([
            'items' => [
                ['product_id' => $burger->id, 'quantity' => 2, 'price' => 1],
                ['product_id' => $soda->id, 'quantity' => 1],
            ],
        ]));

        $response->assertCreated()
            ->assertJsonPath('data.code', 'RV-0001')
            ->assertJsonPath('data.subtotal', 45000)
            ->assertJsonPath('data.total', 45000)
            ->assertJsonPath('data.status', 'pendiente');
    }

    public function test_delivery_adds_the_fee_and_requires_an_address(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = Product::factory()->create(['price' => 10000]);
        $items = [['product_id' => $product->id, 'quantity' => 1]];

        $this->postJson('/api/v1/orders', $this->payload(['type' => 'domicilio', 'items' => $items]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('address');

        $this->postJson('/api/v1/orders', $this->payload(['type' => 'domicilio', 'address' => 'Calle 10 # 5-20', 'items' => $items]))
            ->assertCreated()
            ->assertJsonPath('data.delivery_fee', 4000)
            ->assertJsonPath('data.total', 14000);
    }

    public function test_a_valid_coupon_applies_a_discount(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = Product::factory()->create(['price' => 30000]);
        $coupon = Coupon::factory()->create(['code' => 'SENA10', 'type' => CouponType::Porcentaje, 'value' => 10, 'min_subtotal' => 20000]);

        $this->postJson('/api/v1/orders', $this->payload([
            'coupon_code' => 'sena10',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ]))->assertCreated()->assertJsonPath('data.discount', 3000)->assertJsonPath('data.total', 27000);

        $this->assertSame(1, $coupon->fresh()->used_count);
    }

    public function test_an_expired_coupon_is_rejected(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = Product::factory()->create(['price' => 30000]);
        Coupon::factory()->create(['code' => 'VIEJO', 'expires_at' => now()->subDay()]);

        $this->postJson('/api/v1/orders', $this->payload([
            'coupon_code' => 'VIEJO',
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ]))->assertUnprocessable()->assertJsonValidationErrors('coupon_code');
    }

    public function test_unavailable_products_cannot_be_ordered(): void
    {
        Sanctum::actingAs(User::factory()->create());
        $product = Product::factory()->unavailable()->create();

        $this->postJson('/api/v1/orders', $this->payload([
            'items' => [['product_id' => $product->id, 'quantity' => 1]],
        ]))->assertUnprocessable()->assertJsonValidationErrors('items.0.product_id');

        $this->assertDatabaseCount('orders', 0);
    }

    public function test_a_customer_cannot_see_or_cancel_another_customers_order(): void
    {
        $order = $this->orderFor(User::factory()->create());
        Sanctum::actingAs(User::factory()->create());

        $this->getJson("/api/v1/orders/{$order->code}")->assertForbidden();
        $this->postJson("/api/v1/orders/{$order->code}/cancel")->assertForbidden();
    }

    public function test_a_customer_can_cancel_only_while_pending(): void
    {
        $user = User::factory()->create();
        $order = $this->orderFor($user);
        Sanctum::actingAs($user);

        $this->postJson("/api/v1/orders/{$order->code}/cancel")->assertOk()->assertJsonPath('data.status', 'cancelado');

        $preparing = $this->orderFor($user, ['status' => 'en_preparacion']);
        $this->postJson("/api/v1/orders/{$preparing->code}/cancel")->assertForbidden();
    }

    private function orderFor(User $user, array $attributes = []): Order
    {
        $order = $user->orders()->create([
            'type' => 'recoger',
            'payment_method' => 'efectivo',
            'subtotal' => 10000,
            'total' => 10000,
        ]);

        if ($attributes) {
            $order->forceFill($attributes)->save();
        }

        return $order->refresh();
    }
}
