<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class KitchenController extends Controller
{
    /** Pedidos activos del tablero, del más antiguo al más nuevo. */
    public function index(): AnonymousResourceCollection
    {
        $orders = Order::active()
            ->with(['items', 'user:id,name,phone'])
            ->oldest()
            ->get();

        return OrderResource::collection($orders);
    }

    public function updateStatus(Request $request, Order $order, OrderService $orders): OrderResource
    {
        $data = $request->validate([
            'status' => ['required', Rule::enum(OrderStatus::class)],
        ]);

        $orders->transition($order, OrderStatus::from($data['status']));

        return (new OrderResource($order->load(['items', 'user:id,name,phone'])))
            ->additional(['message' => "Pedido {$order->code}: {$order->status->label()}."]);
    }
}
