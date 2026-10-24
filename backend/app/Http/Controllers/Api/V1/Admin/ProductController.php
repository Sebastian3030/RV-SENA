<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->with('category')
            ->withSoldCount()
            ->when($request->filled('search'), fn ($q) => $q->whereLike('name', '%'.$request->input('search').'%'))
            ->when($request->filled('category_id'), fn ($q) => $q->where('category_id', $request->integer('category_id')))
            ->orderBy('category_id')
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return ProductResource::collection($products);
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $product = new Product($this->attributes($request));
        $product->slug = Product::uniqueSlug($product->name);
        $product->save();
        $product->refresh(); // trae los valores por defecto de la base de datos

        return (new ProductResource($product->load('category')))
            ->additional(['message' => 'Producto creado.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product->load('category'));
    }

    public function update(ProductRequest $request, Product $product): ProductResource
    {
        $previousImage = $product->image;
        $product->fill($this->attributes($request));

        if ($product->isDirty('name')) {
            $product->slug = Product::uniqueSlug($product->name, $product->id);
        }

        $product->save();

        if ($previousImage !== $product->image) {
            $this->deleteLocalImage($previousImage);
        }

        return (new ProductResource($product->load('category')))
            ->additional(['message' => 'Producto actualizado.']);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->deleteLocalImage($product->image);
        $product->delete();

        return response()->json(['message' => 'Producto eliminado.']);
    }

    /** Arma los atributos guardando la imagen subida o la URL indicada. */
    private function attributes(ProductRequest $request): array
    {
        $data = $request->safe()->except(['image', 'image_url']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        } elseif ($request->filled('image_url')) {
            $data['image'] = $request->input('image_url');
        }

        return $data;
    }

    private function deleteLocalImage(?string $path): void
    {
        if ($path && ! Str::startsWith($path, ['http://', 'https://'])) {
            Storage::disk('public')->delete($path);
        }
    }
}
