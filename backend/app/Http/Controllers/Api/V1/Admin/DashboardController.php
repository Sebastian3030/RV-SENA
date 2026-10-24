<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $today = now()->startOfDay();
        $from = now()->subDays(6)->startOfDay();

        $todayOrders = Order::notCancelled()->where('created_at', '>=', $today);
        $todaySales = (int) (clone $todayOrders)->sum('total');
        $todayCount = (clone $todayOrders)->count();

        // Ventas de los últimos 7 días agrupadas en PHP (funciona igual en SQLite y MySQL).
        $week = Order::notCancelled()
            ->where('created_at', '>=', $from)
            ->get(['created_at', 'total'])
            ->groupBy(fn (Order $o) => $o->created_at->toDateString());

        $salesByDay = collect(range(6, 0))->map(function (int $daysAgo) use ($week) {
            $date = now()->subDays($daysAgo)->toDateString();
            $orders = $week->get($date, collect());

            return [
                'date' => $date,
                'total' => (int) $orders->sum('total'),
                'orders' => $orders->count(),
            ];
        })->values();

        $topProducts = OrderItem::query()
            ->whereHas('order', fn ($q) => $q->notCancelled())
            ->selectRaw('product_name, SUM(quantity) as quantity, SUM(subtotal) as revenue')
            ->groupBy('product_name')
            ->orderByDesc('quantity')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->product_name,
                'quantity' => (int) $row->quantity,
                'revenue' => (int) $row->revenue,
            ]);

        $byStatus = Order::query()
            ->where('created_at', '>=', $today)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return response()->json([
            'data' => [
                'today' => [
                    'sales' => $todaySales,
                    'orders' => $todayCount,
                    'average_ticket' => $todayCount ? intdiv($todaySales, $todayCount) : 0,
                    'active_orders' => Order::active()->count(),
                ],
                'customers' => User::where('role', UserRole::Cliente)->count(),
                'sales_by_day' => $salesByDay,
                'top_products' => $topProducts,
                'orders_by_status' => collect(OrderStatus::cases())->map(fn (OrderStatus $s) => [
                    'status' => $s->value,
                    'label' => $s->label(),
                    'total' => (int) ($byStatus[$s->value] ?? 0),
                ]),
                'recent_orders' => OrderResource::collection(
                    Order::with('user:id,name')->withCount('items')->latest()->limit(6)->get()
                ),
            ],
        ]);
    }
}
