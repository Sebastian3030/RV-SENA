<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pendiente = 'pendiente';
    case EnPreparacion = 'en_preparacion';
    case Listo = 'listo';
    case Entregado = 'entregado';
    case Cancelado = 'cancelado';

    public function label(): string
    {
        return match ($this) {
            self::Pendiente => 'Pendiente',
            self::EnPreparacion => 'En preparación',
            self::Listo => 'Listo',
            self::Entregado => 'Entregado',
            self::Cancelado => 'Cancelado',
        };
    }

    /** Estados a los que se puede pasar desde el actual (ver diagrama en la documentación). */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pendiente => [self::EnPreparacion, self::Cancelado],
            self::EnPreparacion => [self::Listo, self::Cancelado],
            self::Listo => [self::Entregado],
            self::Entregado, self::Cancelado => [],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, $this->allowedTransitions(), true);
    }

    /** Columna de fecha que se llena al llegar a este estado. */
    public function timestampColumn(): ?string
    {
        return match ($this) {
            self::EnPreparacion => 'accepted_at',
            self::Listo => 'ready_at',
            self::Entregado => 'delivered_at',
            self::Cancelado => 'cancelled_at',
            self::Pendiente => null,
        };
    }

    /** @return list<self> */
    public static function active(): array
    {
        return [self::Pendiente, self::EnPreparacion, self::Listo];
    }
}
