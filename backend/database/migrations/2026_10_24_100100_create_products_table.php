<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('name', 100);
            $table->string('slug', 120)->unique();
            $table->text('description');
            $table->unsignedInteger('price');
            $table->string('image')->nullable();
            $table->string('badge', 30)->nullable();
            $table->unsignedSmallInteger('prep_minutes')->default(15);
            $table->boolean('is_available')->default(true)->index();
            $table->boolean('is_featured')->default(false);
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
