<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FavoriteController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = $request->user()->favorites()
            ->available()
            ->with('category')
            ->withSoldCount()
            ->withFavoriteFlag($request->user())
            ->latest('favorites.created_at')
            ->get();

        return ProductResource::collection($products);
    }

    /** Marca o desmarca un favorito. */
    public function toggle(Request $request, Product $product): JsonResponse
    {
        $result = $request->user()->favorites()->toggle($product->id);
        $isFavorite = count($result['attached']) > 0;

        return response()->json([
            'data' => ['product_id' => $product->id, 'is_favorite' => $isFavorite],
            'message' => $isFavorite ? 'Agregado a favoritos.' : 'Quitado de favoritos.',
        ]);
    }
}
