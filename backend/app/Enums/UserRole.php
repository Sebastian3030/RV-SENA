<?php

namespace App\Enums;

enum UserRole: string
{
    case Cliente = 'cliente';
    case Cocina = 'cocina';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Cliente => 'Cliente',
            self::Cocina => 'Cocina',
            self::Admin => 'Administrador',
        };
    }

    /** Roles que trabajan en el restaurante (ven el tablero de cocina). */
    public function isStaff(): bool
    {
        return $this !== self::Cliente;
    }
}
