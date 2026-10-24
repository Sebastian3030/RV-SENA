<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validateCode(Request $request, OrderService $orders): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:30'],
            'subtotal' => ['required', 'integer', 'min:0'],
        ]);

        $coupon = $orders->resolveCoupon($data['code'], $data['subtotal']);

        return response()->json([
            'data' => [
                'code' => $coupon->code,
                'type' => $coupon->type->value,
                'value' => $coupon->value,
                'discount' => $coupon->discountFor($data['subtotal']),
            ],
            'message' => 'Cupón aplicado.',
        ]);
    }
}
