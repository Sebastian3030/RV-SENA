<?php

use App\Http\Controllers\Api\V1\Admin;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\FavoriteController;
use App\Http\Controllers\Api\V1\KitchenController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API RV SENA · v1
|--------------------------------------------------------------------------
| Todas las rutas quedan bajo /api/v1. Ver la sección "API REST propia"
| de la documentación del proyecto.
*/

Route::prefix('v1')->group(function () {

    // Autenticación
    Route::prefix('auth')->group(function () {
        Route::middleware('throttle:10,1')->group(function () {
            Route::post('register', [AuthController::class, 'register']);
            Route::post('login', [AuthController::class, 'login']);
        });

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
        });
    });

    // Menú público
    Route::get('categories', [CategoryController::class, 'index']);
    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{slug}', [ProductController::class, 'show']);

    // Usuario con sesión
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('orders/{order}', [OrderController::class, 'show']);

        // Cliente
        Route::middleware('role:cliente,admin')->group(function () {
            Route::get('orders', [OrderController::class, 'index']);
            Route::post('orders', [OrderController::class, 'store']);
            Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
            Route::post('coupons/validate', [CouponController::class, 'validateCode']);
            Route::get('favorites', [FavoriteController::class, 'index']);
            Route::post('favorites/{product}', [FavoriteController::class, 'toggle']);
            Route::post('products/{product}/reviews', [ReviewController::class, 'store']);
        });

        // Cocina
        Route::middleware('role:cocina,admin')->prefix('kitchen')->group(function () {
            Route::get('orders', [KitchenController::class, 'index']);
            Route::patch('orders/{order}/status', [KitchenController::class, 'updateStatus']);
        });

        // Administración
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('dashboard', Admin\DashboardController::class);
            Route::apiResource('products', Admin\ProductController::class);
            Route::apiResource('categories', Admin\CategoryController::class)->except('show');
            Route::apiResource('coupons', Admin\CouponController::class)->except('show');
            Route::get('orders', [Admin\OrderController::class, 'index']);
            Route::get('users', [Admin\UserController::class, 'index']);
            Route::patch('users/{user}/role', [Admin\UserController::class, 'updateRole']);
        });
    });
});
