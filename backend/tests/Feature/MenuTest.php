<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_public_menu_hides_unavailable_products(): void
    {
        $category = Category::factory()->create();
        Product::factory()->for($category)->create(['name' => 'Visible']);
        Product::factory()->for($category)->unavailable()->create(['name' => 'Oculto']);

        $this->getJson('/api/v1/products')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Visible');
    }

    public function test_products_can_be_filtered_by_category_and_search(): void
    {
        $burgers = Category::factory()->create(['slug' => 'hamburguesas']);
        $drinks = Category::factory()->create(['slug' => 'bebidas']);
        Product::factory()->for($burgers)->create(['name' => 'Burger Doble']);
        Product::factory()->for($drinks)->create(['name' => 'Limonada']);

        $this->getJson('/api/v1/products?category=bebidas')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Limonada');
        $this->getJson('/api/v1/products?search=burger')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Burger Doble');
    }

    public function test_product_detail_is_found_by_slug(): void
    {
        $product = Product::factory()->create(['slug' => 'pizza-margarita']);

        $this->getJson('/api/v1/products/pizza-margarita')->assertOk()->assertJsonPath('data.id', $product->id);
        $this->getJson('/api/v1/products/no-existe')->assertNotFound();
    }
}
