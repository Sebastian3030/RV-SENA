<?php

namespace App\Enums;

enum OrderType: string
{
    case Mesa = 'mesa';
    case Recoger = 'recoger';
    case Domicilio = 'domicilio';

    public const DELIVERY_FEE = 4000;

    public function label(): string
    {
        return match ($this) {
            self::Mesa => 'En mesa',
            self::Recoger => 'Para recoger',
            self::Domicilio => 'A domicilio',
        };
    }

    public function deliveryFee(): int
    {
        return $this === self::Domicilio ? self::DELIVERY_FEE : 0;
    }
}
