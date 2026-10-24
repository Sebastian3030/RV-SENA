<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = $request->user()->orders()
            ->with(['items.product:id,slug,image'])
            ->withCount('items')
            ->latest()
            ->paginate(10);

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orders->place($request->user(), $request->validated());

        return (new OrderResource($order->load(['items.product:id,slug,image', 'coupon'])))
            ->additional(['message' => "¡Pedido {$order->code} recibido! Ya lo estamos preparando."])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Request $request, Order $order): OrderResource
    {
        $this->authorize('view', $order);

        $order->load(['items.product:id,slug,image', 'coupon', 'user']);

        // Platos de este pedido que el dueño ya calificó (para ocultar el botón "Calificar").
        $reviewed = $order->user->reviews()
            ->whereIn('product_id', $order->items->pluck('product_id')->filter())
            ->pluck('product_id');

        return (new OrderResource($order))->additional(['meta' => ['reviewed_product_ids' => $reviewed]]);
    }

    public function cancel(Order $order): OrderResource
    {
        $this->authorize('cancel', $order);

        $this->orders->transition($order, OrderStatus::Cancelado);

        return (new OrderResource($order->load(['items.product:id,slug,image', 'coupon'])))
            ->additional(['message' => 'Pedido cancelado.']);
    }
}
