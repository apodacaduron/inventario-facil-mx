<script setup lang="ts">
import { SUPPORT_EMAIL } from "@/config/constants";
</script>

<template>
  <div class="container my-12">
    <h1 class="text-4xl">Aviso Legal</h1>
    <p class="mt-2 mb-6">
      Bienvenido a <strong>inventariofacil.mx</strong>. Este aviso legal regula
      el uso del sitio web
      <a href="https://inventariofacil.mx">https://inventariofacil.mx</a> (en
      adelante, "el sitio web"). Al acceder y utilizar este sitio web, usted
      acepta los términos y condiciones descritos en este aviso legal. Si no
      está de acuerdo con estos términos, por favor, no utilice nuestro sitio
      web.
    </p>

    <h2 class="text-xl">1. Información General</h2>
    <p class="mt-2 mb-6">
      De conformidad con lo establecido en la Ley Federal de Protección de Datos
      Personales en Posesión de los Particulares, se informa a los usuarios de
      este sitio web lo siguiente:
    </p>
    <p class="mt-2 mb-6">
      <strong>inventariofacil.mx</strong><br />
      Correo Electrónico: {{ SUPPORT_EMAIL }}<br />
      Sitio Web:
      <a href="https://inventariofacil.mx">https://inventariofacil.mx</a>
    </p>

    <h2 class="text-xl">2. Propiedad Intelectual</h2>
    <p class="mt-2 mb-6">
      Todo el contenido de este sitio web, incluyendo textos, gráficos,
      logotipos, iconos de botones, imágenes, clips de audio, descargas
      digitales, compilaciones de datos y software, es propiedad de
      <strong>inventariofacil.mx</strong> o sus proveedores de contenido y está
      protegido por las leyes de derechos de autor internacionales.
    </p>

    <h2 class="text-xl">3. Exclusión de Responsabilidad</h2>
    <p class="mt-2 mb-6">
      El uso de este sitio web es bajo su propio riesgo.
      <strong>inventariofacil.mx</strong> no garantiza que el sitio web estará
      disponible de manera ininterrumpida, libre de errores o que los defectos
      serán corregidos. El sitio web se proporciona "tal cual" y "según
      disponibilidad".
    </p>
    <p class="mt-2 mb-6">
      <strong>inventariofacil.mx</strong> no será responsable de ningún daño
      directo, indirecto, incidental, especial o consecuente que resulte del uso
      o la imposibilidad de uso del sitio web.
    </p>

    <h2 class="text-xl">4. Enlaces a Terceros</h2>
    <p class="mt-2 mb-6">
      Este sitio web puede contener enlaces a otros sitios web operados por
      terceros. Estos enlaces se proporcionan únicamente para su conveniencia.
      <strong>inventariofacil.mx</strong> no tiene control sobre estos sitios
      web y no es responsable de su contenido o disponibilidad. La inclusión de
      estos enlaces no implica la aprobación de su contenido ni asociación
      alguna con sus operadores.
    </p>

    <h2 class="text-xl">5. Modificaciones</h2>
    <p class="mt-2 mb-6">
      Nos reservamos el derecho de modificar este aviso legal en cualquier
      momento. Le notificaremos sobre cualquier cambio publicando el nuevo aviso
      legal en nuestro sitio web. Su uso continuado del sitio web después de
      cualquier cambio constituirá su aceptación de los nuevos términos.
    </p>

    <h2 class="text-xl">6. Ley Aplicable</h2>
    <p class="mt-2 mb-6">
      Este aviso legal se regirá e interpretará de acuerdo con las leyes de
      México, sin dar efecto a sus principios de conflicto de leyes.
    </p>

    <h2 class="text-xl">7. Contacto</h2>
    <p class="mt-2 mb-6">
      Si tiene alguna pregunta sobre este aviso legal, puede contactarnos en:
    </p>
    <p class="mt-2 mb-6">
      <strong>inventariofacil.mx</strong><br />
      Correo Electrónico: {{ SUPPORT_EMAIL }}
    </p>
  </div>
</template>
