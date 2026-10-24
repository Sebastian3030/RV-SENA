<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Efectivo = 'efectivo';
    case Tarjeta = 'tarjeta';
    case Nequi = 'nequi';

    public function label(): string
    {
        return match ($this) {
            self::Efectivo => 'Efectivo',
            self::Tarjeta => 'Tarjeta',
            self::Nequi => 'Nequi',
        };
    }
}
