<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'slug', 'description', 'price', 'image',
        'badge', 'prep_minutes', 'is_available', 'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'prep_minutes' => 'integer',
            'is_available' => 'boolean',
            'is_featured' => 'boolean',
            'rating_avg' => 'float',
            'rating_count' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }

    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('is_available', true);
    }

    /** Agrega el campo is_favorite para el usuario indicado (o false si no hay sesión). */
    public function scopeWithFavoriteFlag(Builder $query, ?User $user): Builder
    {
        return $user
            ? $query->withExists(['favoritedBy as is_favorite' => fn ($q) => $q->where('users.id', $user->id)])
            : $query;
    }

    /** Agrega sold_count: unidades vendidas en pedidos no cancelados. */
    public function scopeWithSoldCount(Builder $query): Builder
    {
        return $query->withSum(['orderItems as sold_count' => fn ($q) => $q->whereHas(
            'order', fn ($o) => $o->where('status', '!=', 'cancelado')
        )], 'quantity');
    }

    /** URL pública de la imagen: puede ser externa (seeder) o subida al disco público. */
    public function imageUrl(): ?string
    {
        if (! $this->image) {
            return null;
        }

        return Str::startsWith($this->image, ['http://', 'https://'])
            ? $this->image
            : Storage::disk('public')->url($this->image);
    }

    public function refreshRating(): void
    {
        $this->forceFill([
            'rating_avg' => round((float) $this->reviews()->avg('rating'), 2),
            'rating_count' => $this->reviews()->count(),
        ])->save();
    }

    /** Genera un slug único a partir del nombre. */
    public static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'producto';
        $slug = $base;
        $i = 2;

        while (static::where('slug', $slug)->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }
}
