<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KitchenAndAdminTest extends TestCase
{
    use RefreshDatabase;

    private function pendingOrder(): Order
    {
        return User::factory()->create()->orders()->create([
            'type' => 'recoger',
            'payment_method' => 'nequi',
            'subtotal' => 10000,
            'total' => 10000,
        ])->refresh();
    }

    public function test_kitchen_moves_orders_through_the_allowed_states(): void
    {
        $order = $this->pendingOrder();
        Sanctum::actingAs(User::factory()->kitchen()->create());

        $this->getJson('/api/v1/kitchen/orders')->assertOk()->assertJsonCount(1, 'data');

        $url = "/api/v1/kitchen/orders/{$order->code}/status";
        $this->patchJson($url, ['status' => 'en_preparacion'])->assertOk()->assertJsonPath('data.status', 'en_preparacion');
        $this->patchJson($url, ['status' => 'listo'])->assertOk();
        $this->patchJson($url, ['status' => 'entregado'])->assertOk()->assertJsonPath('data.status', 'entregado');

        $this->assertNotNull($order->fresh()->delivered_at);
    }

    public function test_states_cannot_be_skipped(): void
    {
        $order = $this->pendingOrder();
        Sanctum::actingAs(User::factory()->kitchen()->create());

        $this->patchJson("/api/v1/kitchen/orders/{$order->code}/status", ['status' => 'entregado'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
    }

    public function test_customers_cannot_use_the_kitchen_or_admin(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->getJson('/api/v1/kitchen/orders')->assertForbidden();
        $this->getJson('/api/v1/admin/dashboard')->assertForbidden();
        $this->getJson('/api/v1/admin/users')->assertForbidden();
    }

    public function test_kitchen_staff_cannot_use_admin(): void
    {
        Sanctum::actingAs(User::factory()->kitchen()->create());

        $this->getJson('/api/v1/admin/dashboard')->assertForbidden();
    }

    public function test_admin_sees_the_dashboard_and_manages_products(): void
    {
        $admin = User::factory()->admin()->create();
        $this->pendingOrder();
        Sanctum::actingAs($admin);

        $this->getJson('/api/v1/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('data.today.active_orders', 1)
            ->assertJsonCount(7, 'data.sales_by_day');

        $category = \App\Models\Category::factory()->create();
        $id = $this->postJson('/api/v1/admin/products', [
            'category_id' => $category->id,
            'name' => 'Arepa de Choclo',
            'description' => 'Arepa dulce de maíz tierno con queso.',
            'price' => 9000,
            'prep_minutes' => 10,
        ])->assertCreated()->assertJsonPath('data.slug', 'arepa-de-choclo')->json('data.id');

        $this->putJson("/api/v1/admin/products/{$id}", [
            'category_id' => $category->id,
            'name' => 'Arepa de Choclo',
            'description' => 'Arepa dulce de maíz tierno con queso.',
            'price' => 9500,
            'prep_minutes' => 10,
            'is_available' => false,
        ])->assertOk()->assertJsonPath('data.price', 9500)->assertJsonPath('data.is_available', false);
    }

    public function test_admin_can_change_roles_but_not_their_own(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        Sanctum::actingAs($admin);

        $this->patchJson("/api/v1/admin/users/{$user->id}/role", ['role' => 'cocina'])->assertOk()->assertJsonPath('data.role', 'cocina');
        $this->patchJson("/api/v1/admin/users/{$admin->id}/role", ['role' => 'cliente'])->assertUnprocessable();
    }

    public function test_only_delivered_products_can_be_reviewed_once(): void
    {
        $user = User::factory()->create();
        $product = Product::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson("/api/v1/products/{$product->id}/reviews", ['rating' => 5])->assertUnprocessable();

        $order = $user->orders()->create(['type' => 'mesa', 'table_number' => 1, 'payment_method' => 'efectivo', 'subtotal' => 1, 'total' => 1]);
        $order->items()->create(['product_id' => $product->id, 'product_name' => $product->name, 'unit_price' => 1, 'quantity' => 1, 'subtotal' => 1]);
        $order->forceFill(['status' => 'entregado'])->save();

        $this->postJson("/api/v1/products/{$product->id}/reviews", ['rating' => 4, 'comment' => 'Muy rico'])->assertCreated();
        $this->postJson("/api/v1/products/{$product->id}/reviews", ['rating' => 5])->assertUnprocessable();

        $this->assertSame(4.0, $product->fresh()->rating_avg);
    }
}
