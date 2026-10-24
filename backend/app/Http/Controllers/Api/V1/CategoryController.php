<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $categories = Category::active()
            ->ordered()
            ->withCount(['products' => fn ($q) => $q->available()])
            ->get();

        return CategoryResource::collection($categories);
    }
}
