<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * Menú público. Filtros: search, category (slug), featured, sort.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:80'],
            'category' => ['nullable', 'string', 'max:80'],
            'featured' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'in:popular,rating,price_asc,price_desc,newest'],
        ]);

        $products = Product::query()
            ->available()
            ->whereHas('category', fn ($q) => $q->active())
            ->with('category')
            ->withSoldCount()
            ->withFavoriteFlag($request->user('sanctum'))
            ->when($request->filled('search'), function ($q) use ($request) {
                $term = '%'.$request->string('search')->trim().'%';
                $q->where(fn ($w) => $w->whereLike('name', $term)->orWhereLike('description', $term));
            })
            ->when($request->filled('category'), fn ($q) => $q->whereHas(
                'category', fn ($c) => $c->where('slug', $request->input('category'))
            ))
            ->when($request->boolean('featured'), fn ($q) => $q->where('is_featured', true))
            ->tap(fn ($q) => match ($request->input('sort', 'popular')) {
                'rating' => $q->orderByDesc('rating_avg')->orderByDesc('rating_count'),
                'price_asc' => $q->orderBy('price'),
                'price_desc' => $q->orderByDesc('price'),
                'newest' => $q->latest('id'),
                default => $q->orderByDesc('sold_count')->orderByDesc('rating_avg'),
            })
            ->get();

        return ProductResource::collection($products);
    }

    public function show(Request $request, string $slug): ProductResource
    {
        $product = Product::query()
            ->where('slug', $slug)
            ->available()
            ->with(['category', 'reviews' => fn ($q) => $q->with('user:id,name')->latest()->limit(20)])
            ->withSoldCount()
            ->withFavoriteFlag($request->user('sanctum'))
            ->firstOrFail();

        return new ProductResource($product);
    }
}
