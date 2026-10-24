<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CouponController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CouponResource::collection(Coupon::latest()->get());
    }

    public function store(CouponRequest $request): JsonResponse
    {
        $coupon = Coupon::create($request->validated());

        return (new CouponResource($coupon->refresh()))
            ->additional(['message' => 'Cupón creado.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(CouponRequest $request, Coupon $coupon): CouponResource
    {
        $coupon->update($request->validated());

        return (new CouponResource($coupon))->additional(['message' => 'Cupón actualizado.']);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json(['message' => 'Cupón eliminado.']);
    }
}
