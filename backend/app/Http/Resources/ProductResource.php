<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Product */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'price' => $this->price,
            'image_url' => $this->imageUrl(),
            'badge' => $this->badge,
            'prep_minutes' => $this->prep_minutes,
            'is_available' => $this->is_available,
            'is_featured' => $this->is_featured,
            'rating_avg' => $this->rating_avg,
            'rating_count' => $this->rating_count,
            'sold_count' => (int) ($this->sold_count ?? 0),
            'is_favorite' => (bool) ($this->is_favorite ?? false),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'category_id' => $this->category_id,
            'reviews' => ReviewResource::collection($this->whenLoaded('reviews')),
        ];
    }
}
