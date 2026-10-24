<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(OrderStatus::class)],
            'date' => ['nullable', 'date'],
            'search' => ['nullable', 'string', 'max:80'],
        ]);

        $orders = Order::query()
            ->with(['user:id,name,phone', 'items'])
            ->withCount('items')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('date'), fn ($q) => $q->whereDate('created_at', $request->input('date')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->input('search').'%';
                $q->where(fn ($w) => $w->where('code', 'like', $term)
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', $term)));
            })
            ->latest()
            ->paginate(15);

        return OrderResource::collection($orders);
    }
}
