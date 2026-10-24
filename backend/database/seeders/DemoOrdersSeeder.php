<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Pedidos de los últimos 7 días para que el panel, el tablero de cocina
 * y el historial del cliente tengan datos desde el primer arranque.
 */
class DemoOrdersSeeder extends Seeder
{
    private const COMMENTS = [
        5 => ['¡Espectacular! Volvería a pedirlo.', 'Llegó caliente y delicioso.', 'El mejor que he probado en la ciudad.', 'Porción generosa y muy buen sabor.'],
        4 => ['Muy rico, aunque tardó un poco.', 'Buen sabor, le pondría más salsa.', 'Recomendado.'],
        3 => ['Estaba bien, nada extraordinario.'],
    ];

    public function run(): void
    {
        fake()->seed(2026);

        $products = Product::all();
        $customers = User::where('role', 'cliente')->get();
        $mainCustomer = $customers->firstWhere('email', 'cliente@rvsena.com');

        // Historial: días 6 a 1, todos entregados (algunos cancelados).
        foreach (range(6, 1) as $daysAgo) {
            foreach (range(1, fake()->numberBetween(5, 9)) as $_) {
                $at = now()->subDays($daysAgo)->setTime(fake()->numberBetween(11, 21), fake()->numberBetween(0, 59));
                $status = fake()->boolean(92) ? OrderStatus::Entregado : OrderStatus::Cancelado;
                $this->makeOrder($customers->random(), $products, $at, $status);
            }
        }

        // Hoy: entregados en la mañana + pedidos activos para el tablero de cocina.
        foreach (range(1, 4) as $_) {
            $this->makeOrder($customers->random(), $products, now()->subMinutes(fake()->numberBetween(90, 240)), OrderStatus::Entregado);
        }

        $this->makeOrder($mainCustomer, $products, now()->subDays(2)->setTime(13, 10), OrderStatus::Entregado);
        $this->makeOrder($mainCustomer, $products, now()->subMinutes(14), OrderStatus::EnPreparacion);

        foreach ([[OrderStatus::Listo, 22], [OrderStatus::EnPreparacion, 11], [OrderStatus::Pendiente, 6], [OrderStatus::Pendiente, 2]] as [$status, $minutes]) {
            $this->makeOrder($customers->where('id', '!=', $mainCustomer->id)->random(), $products, now()->subMinutes($minutes), $status);
        }

        $this->seedReviews($mainCustomer);
        $products->each->refreshRating();
    }

    private function makeOrder(User $user, Collection $products, Carbon $at, OrderStatus $status): Order
    {
        $type = fake()->randomElement(OrderType::cases());
        $lines = $products->random(fake()->numberBetween(1, 3))->map(function (Product $p) {
            $qty = fake()->numberBetween(1, 3);

            return [
                'product_id' => $p->id,
                'product_name' => $p->name,
                'unit_price' => $p->price,
                'quantity' => $qty,
                'notes' => fake()->boolean(20) ? fake()->randomElement(['Empacar aparte', 'Extra servilletas', 'Salsas aparte']) : null,
                'subtotal' => $p->price * $qty,
            ];
        });

        $subtotal = (int) $lines->sum('subtotal');
        $fee = $type->deliveryFee();

        $order = $user->orders()->create([
            'type' => $type,
            'table_number' => $type === OrderType::Mesa ? fake()->numberBetween(1, 20) : null,
            'address' => $type === OrderType::Domicilio ? fake()->randomElement(['Calle 10 # 5-20', 'Carrera 45 # 12-30 apto 301', 'Av. Siempre Viva 742', 'Calle 72 # 11-08']) : null,
            'payment_method' => fake()->randomElement(PaymentMethod::cases()),
            'subtotal' => $subtotal,
            'delivery_fee' => $fee,
            'total' => $subtotal + $fee,
        ]);

        $order->items()->createMany($lines->all());

        $timeline = ['status' => $status, 'created_at' => $at, 'updated_at' => $at];
        $reached = fn (OrderStatus ...$s) => in_array($status, $s, true);

        if ($reached(OrderStatus::EnPreparacion, OrderStatus::Listo, OrderStatus::Entregado)) {
            $timeline['accepted_at'] = $at->copy()->addMinutes(2);
        }
        if ($reached(OrderStatus::Listo, OrderStatus::Entregado)) {
            $timeline['ready_at'] = $at->copy()->addMinutes(fake()->numberBetween(12, 20));
        }
        if ($status === OrderStatus::Entregado) {
            $timeline['delivered_at'] = $at->copy()->addMinutes(fake()->numberBetween(22, 35));
        }
        if ($status === OrderStatus::Cancelado) {
            $timeline['cancelled_at'] = $at->copy()->addMinutes(3);
        }

        $order->forceFill($timeline)->saveQuietly();

        return $order;
    }

    /** Reseñas de los clientes; al cliente de prueba le quedan platos sin calificar. */
    private function seedReviews(User $mainCustomer): void
    {
        Order::with('items')
            ->where('status', OrderStatus::Entregado)
            ->where('user_id', '!=', $mainCustomer->id)
            ->get()
            ->each(function (Order $order) {
                foreach ($order->items as $item) {
                    if (! fake()->boolean(55)) {
                        continue;
                    }

                    $rating = fake()->randomElement([5, 5, 5, 4, 4, 3]);

                    Review::firstOrCreate(
                        ['user_id' => $order->user_id, 'product_id' => $item->product_id],
                        [
                            'order_id' => $order->id,
                            'rating' => $rating,
                            'comment' => fake()->randomElement(self::COMMENTS[$rating]),
                            'created_at' => $order->delivered_at,
                            'updated_at' => $order->delivered_at,
                        ],
                    );
                }
            });
    }
}
