<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function store(StoreReviewRequest $request, Product $product): JsonResponse
    {
        $user = $request->user();

        $order = Order::where('user_id', $user->id)
            ->where('status', OrderStatus::Entregado)
            ->whereHas('items', fn ($q) => $q->where('product_id', $product->id))
            ->latest()
            ->first();

        if (! $order) {
            throw ValidationException::withMessages([
                'rating' => 'Solo puedes calificar platos de pedidos que ya recibiste.',
            ]);
        }

        if ($product->reviews()->where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages([
                'rating' => 'Ya calificaste este plato. ¡Gracias!',
            ]);
        }

        $review = $product->reviews()->create([
            ...$request->validated(),
            'user_id' => $user->id,
            'order_id' => $order->id,
        ]);

        $product->refreshRating();

        return (new ReviewResource($review->load('user:id,name')))->response()->setStatusCode(201);
    }
}
