<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MenuSeeder extends Seeder
{
    private const IMG = 'https://images.unsplash.com/photo-%s?auto=format&fit=crop&w=800&q=80';

    public function run(): void
    {
        foreach ($this->menu() as $sort => [$category, $icon, $products]) {
            $cat = Category::create([
                'name' => $category,
                'slug' => Str::slug($category),
                'icon' => $icon,
                'sort_order' => $sort + 1,
            ]);

            foreach ($products as [$name, $description, $price, $photo, $minutes, $badge, $featured]) {
                Product::create([
                    'category_id' => $cat->id,
                    'name' => $name,
                    'slug' => Str::slug($name),
                    'description' => $description,
                    'price' => $price,
                    'image' => sprintf(self::IMG, $photo),
                    'prep_minutes' => $minutes,
                    'badge' => $badge,
                    'is_featured' => $featured,
                ]);
            }
        }
    }

    /**
     * [categoría, ícono, [[nombre, descripción, precio, foto Unsplash, minutos, etiqueta, destacado]]]
     */
    private function menu(): array
    {
        return [
            ['Hamburguesas', 'beef', [
                ['Burger Deluxe Pro', 'Doble carne angus, queso cheddar fundido, tocineta crujiente y salsa secreta de la casa en pan brioche.', 24900, '1568901346375-23c9450c58cd', 15, 'Popular', true],
                ['Burger BBQ Bacon', 'Carne de res a la parrilla, cebolla caramelizada, tocineta, aros de cebolla y salsa BBQ ahumada.', 27900, '1553979459-d2229ba7433b', 15, null, false],
                ['Smash Burger Doble', 'Dos carnes aplastadas en plancha caliente, queso americano, pepinillos y mostaza dulce.', 22900, '1550547660-d9450f859349', 12, 'Nuevo', false],
            ]],
            ['Pizzas', 'pizza', [
                ['Pizza Rústica Trufada', 'Masa madre, tomates cherry confitados, champiñones, albahaca fresca y aceite de trufa.', 36000, '1513104890138-7c749659a591', 20, 'Chef', true],
                ['Pizza Pepperoni Explosive', 'Abundante pepperoni americano, mozzarella fundida y un toque picante opcional.', 32000, '1628840042765-356cda07504e', 18, null, false],
                ['Pizza Margarita Clásica', 'Salsa de tomate italiano, mozzarella fresca, albahaca y aceite de oliva extra virgen.', 28000, '1574071318508-1cdbab80d002', 18, null, false],
            ]],
            ['Pastas', 'soup', [
                ['Pasta Carbonara Italiana', 'Spaghetti al dente, guanciale crujiente, yema de huevo y queso pecorino romano.', 28000, '1612874742237-6526221588e3', 16, 'Nuevo', true],
                ['Spaghetti a la Boloñesa', 'Ragú de res cocinado a fuego lento por 4 horas con tomate, vino tinto y parmesano.', 26000, '1622973536968-3ead9e780960', 16, null, false],
                ['Lasaña de la Nonna', 'Capas de pasta fresca, boloñesa, bechamel casera y mozzarella gratinada.', 29500, '1574894709920-11b28e7367e3', 22, null, false],
            ]],
            ['Asiática', 'fish', [
                ['Dragon Roll Especial', 'Langostino tempura, aguacate por fuera, queso crema y reducción de unagi.', 34000, '1579871494447-9811cf80d66c', 18, null, false],
                ['Poke Bowl de Salmón', 'Arroz de sushi, cubos de salmón fresco, edamame, mango, wakame y salsa ponzu.', 35000, '1546069901-ba9599a7e63c', 12, 'Fit', true],
                ['Ramen Tonkotsu', 'Caldo de cerdo cremoso, fideos artesanales, chashu, huevo marinado y cebollín.', 31000, '1569718212165-3a8278d5f624', 20, null, false],
            ]],
            ['Saludable', 'salad', [
                ['Ensalada Vitality', 'Mix de lechugas orgánicas, aguacate hass, quinoa, frutos secos y vinagreta de miel.', 19500, '1512621776951-a57141f2eefd', 8, null, false],
                ['Bowl Mediterráneo', 'Garbanzos, pepino, tomate, aceitunas, queso feta, hummus y pan pita tostado.', 21000, '1540189549336-e6e99c3679fe', 10, null, false],
            ]],
            ['Parrilla', 'drumstick', [
                ['Costillas BBQ Glaseadas', 'Costillas de cerdo cocidas 8 horas, bañadas en salsa BBQ artesanal con papas rústicas.', 42000, '1544025162-d76694265947', 25, 'Top', true],
                ['Alitas Picantes x10', 'Alitas crocantes con salsa búfalo, palitos de apio y aderezo ranch.', 23900, '1567620832903-9fc6debc209f', 18, 'Picante', false],
                ['Picada RV para Compartir', 'Chorizo, morcilla, chicharrón, carne de res, papa criolla, arepitas y guacamole.', 45000, '1555939594-58d7cb561ad1', 25, null, false],
            ]],
            ['Postres', 'cake-slice', [
                ['Torta de Chocolate', 'Bizcocho húmedo de cacao 70 % con ganache y frutos rojos frescos.', 15000, '1578985545062-69928b1d9587', 5, 'Dulce', false],
                ['Cheesecake de Frutos Rojos', 'Base de galleta, crema de queso horneada y coulis de mora y fresa.', 14000, '1533134242443-d4fd215305ad', 5, null, false],
                ['Helado Artesanal', 'Tres bolas de helado a elección: vainilla, chocolate, arequipe o maracuyá.', 9000, '1497034825429-c343d7c6a68f', 3, null, false],
            ]],
            ['Bebidas', 'cup-soda', [
                ['Té Helado de Limón', 'Té negro frío con limón fresco, hierbabuena y un toque de panela.', 12000, '1556679343-c7306c1976bc', 5, 'Refrescante', true],
                ['Jugo Natural de Naranja', 'Naranjas recién exprimidas, sin azúcar añadida. 400 ml.', 8000, '1600271886742-f049cd451bba', 4, null, false],
                ['Malteada Cookies & Cream', 'Helado de vainilla, galletas de chocolate trituradas, crema batida y sirope de chocolate.', 13000, '1572490122747-3968b75cc699', 6, null, false],
                ['Café Frappé', 'Espresso colombiano, leche, hielo y caramelo. Hecho con café del Huila.', 10000, '1461023058943-07fcbe16d735', 5, null, false],
            ]],
        ];
    }
}
