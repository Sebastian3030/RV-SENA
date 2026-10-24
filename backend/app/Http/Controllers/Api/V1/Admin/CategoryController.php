<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection(Category::ordered()->withCount('products')->get());
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $category = Category::create([
            ...$request->validated(),
            'slug' => Str::slug($request->input('name')),
        ]);

        return (new CategoryResource($category->loadCount('products')))
            ->additional(['message' => 'Categoría creada.'])
            ->response()
            ->setStatusCode(201);
    }

    public function update(CategoryRequest $request, Category $category): CategoryResource
    {
        $category->update([
            ...$request->validated(),
            'slug' => Str::slug($request->input('name')),
        ]);

        return (new CategoryResource($category->loadCount('products')))
            ->additional(['message' => 'Categoría actualizada.']);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'No se puede eliminar: la categoría tiene productos. Muévelos o desactívala.',
            ]);
        }

        $category->delete();

        return response()->json(['message' => 'Categoría eliminada.']);
    }
}
