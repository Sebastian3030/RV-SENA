<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = ucfirst(fake()->unique()->words(3, true));

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->sentence(12),
            'price' => fake()->numberBetween(8, 45) * 1000,
            'image' => null,
            'prep_minutes' => fake()->numberBetween(5, 30),
            'is_available' => true,
            'is_featured' => false,
        ];
    }

    public function unavailable(): static
    {
        return $this->state(fn () => ['is_available' => false]);
    }
}
