# InventarioFacilMX

InventarioFacilMX es una aplicación diseñada para ayudar a pequeños vendedores, especialmente aquellos que venden a través de plataformas como Facebook, a gestionar su inventario de manera fácil y eficiente. La aplicación permite el seguimiento de productos, ventas y clientes, proporcionando una interfaz intuitiva y herramientas útiles para la gestión diaria.

## Características

- **Inicio**: Visualiza estadísticas y métricas importantes como ventas totales, productos más vendidos, mejores clientes, y ganancias. Permite el filtrado mensual y anual.
- **Productos**: Gestiona un listado de productos con funcionalidades de búsqueda, adición, edición, eliminación y ajuste de stock.
- **Clientes**: Administra un listado de clientes con opciones de búsqueda, adición, edición, eliminación y marcaje de estatus de confiabilidad. Enlaces rápidos a WhatsApp y Google Maps.
- **Ventas**: Lleva un registro de las ventas, permite crear, editar y eliminar ventas. Gestión del estado de las ventas (en progreso, completada, cancelada) y ajuste automático del inventario.
- **Página pública de productos**: Comparte tu inventario con tus clientes mediante una página pública opcional accesible a través de un QR code.

## Planes de Suscripción

InventarioFacilMX ofrece tres planes de suscripción:

- **Gratis**: Limitado a 50 productos y 50 clientes.
- **Premium**: Productos y clientes ilimitados, pagina publica de inventario.

## Requisitos

- Node.js
- Supabase
- Stripe (para la gestión de suscripciones)

## Configuración

1. **Clonar el repositorio**:
    ```bash
    git clone https://github.com/apodacaduron/inventario-facil-mx.git
    cd inventario-facil-mx
    ```

2. **Instalar dependencias**:
    ```bash
    npm install
    ```

3. **Configurar las variables de entorno**:
    Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
    ```env
   VITE_GOOGLE_MEASUREMENT_ID=YOUR_SUPABASE_URL
   VITE_SUPABASE_URL=YOUR_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   VITE_WHATSAPP_URL=https://wa.me

    ```

4. **Ejecutar la aplicación**:
    ```bash
    npm run dev
    ```

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue para discutir cualquier cambio significativo antes de enviar un pull request.

1. **Fork el repositorio**
2. **Crea una rama feature**
    ```bash
    git checkout -b feature/nueva-feature
    ```
3. **Commit tus cambios**
    ```bash
    git commit -m 'Añadir nueva feature'
    ```
4. **Push a la rama**
    ```bash
    git push origin feature/nueva-feature
    ```
5. **Abre un Pull Request**

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Para más información, puedes contactarnos en [apodacaduron@gmail.com](mailto:apodacaduron@gmail.com).

¡Gracias por utilizar InventarioFacilMX!
