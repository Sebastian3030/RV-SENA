<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->nullable()->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->string('status', 20)->default('pendiente')->index();
            $table->string('type', 20);
            $table->unsignedTinyInteger('table_number')->nullable();
            $table->string('address')->nullable();
            $table->string('payment_method', 20);
            $table->string('notes', 500)->nullable();
            $table->unsignedInteger('subtotal');
            $table->unsignedInteger('discount')->default(0);
            $table->unsignedInteger('delivery_fee')->default(0);
            $table->unsignedInteger('total');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index('created_at');
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('product_name', 100);
            $table->unsignedInteger('unit_price');
            $table->unsignedSmallInteger('quantity');
            $table->string('notes', 200)->nullable();
            $table->unsignedInteger('subtotal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
