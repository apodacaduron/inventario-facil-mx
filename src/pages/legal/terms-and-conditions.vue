<script setup lang="ts">
import { SUPPORT_EMAIL } from "@/config/constants";
</script>

<template>
  <div class="container my-12">
    <h1 class="text-4xl">Términos y Condiciones</h1>
    <p class="mt-2 mb-6">
      Bienvenido a <strong>inventariofacil.mx</strong> (en adelante, "nosotros",
      "nuestro" o "la Empresa"). Estos términos y condiciones describen las
      reglas y directrices para el uso de nuestro sitio web y servicios. Al
      acceder y utilizar nuestro sitio web, usted acepta estos términos en su
      totalidad. Si no está de acuerdo con alguno de estos términos, por favor,
      no utilice nuestro sitio web.
    </p>

    <h2 class="text-xl">1. Introducción</h2>
    <p class="mt-2 mb-6">
      Estos Términos y Condiciones rigen su uso de nuestro sitio web y
      servicios. Al usar nuestro sitio web, usted acepta estos términos en su
      totalidad. Si no está de acuerdo con alguno de estos términos, por favor,
      no utilice nuestro sitio web.
    </p>

    <h2 class="text-xl">2. Descripción del Servicio</h2>
    <p class="mt-2 mb-6">
      <strong>inventariofacil.mx</strong> proporciona una plataforma para la
      gestión de inventarios, permitiendo a los usuarios agregar productos,
      clientes, registrar ventas y ver estadísticas. También ofrecemos
      suscripciones premium que brindan características adicionales.
    </p>

    <h2 class="text-xl">3. Obligaciones del Usuario</h2>
    <p class="mt-2 mb-2">
      Al utilizar nuestro sitio web, usted se compromete a:
    </p>
    <ul class="mb-6">
      <li>
        Proporcionar información veraz, precisa, actual y completa sobre usted
        según lo solicite nuestro formulario de registro.
      </li>
      <li>Actualizar y mantener la exactitud de dicha información.</li>
      <li>
        No utilizar nuestro sitio web para actividades ilegales o no
        autorizadas.
      </li>
      <li>
        Respetar los derechos de propiedad intelectual y otros derechos de la
        Empresa y de terceros.
      </li>
    </ul>

    <h2 class="text-xl">4. Propiedad Intelectual</h2>
    <p class="mt-2 mb-6">
      Todo el contenido incluido en este sitio web, como textos, gráficos,
      logotipos, imágenes, clips de audio, descargas digitales, compilaciones de
      datos y software, es propiedad de <strong>inventariofacil.mx</strong> o
      sus proveedores de contenido y está protegido por las leyes de derechos de
      autor internacionales.
    </p>

    <h2 class="text-xl">5. Limitación de Responsabilidad</h2>
    <p class="mt-2 mb-6">
      No garantizamos que el sitio web esté libre de errores o ininterrumpido.
      No seremos responsables de ningún daño directo, indirecto, incidental,
      especial o consecuente que resulte del uso o la incapacidad de usar
      nuestro sitio web.
    </p>

    <h2 class="text-xl">6. Terminación</h2>
    <p class="mt-2 mb-6">
      Nos reservamos el derecho de suspender o terminar su acceso a nuestro
      sitio web y servicios sin previo aviso si incumple estos Términos y
      Condiciones o si determinamos que es necesario para proteger nuestros
      intereses.
    </p>

    <h2 class="text-xl">7. Modificaciones</h2>
    <p class="mt-2 mb-6">
      Podemos modificar estos Términos y Condiciones en cualquier momento. Le
      notificaremos sobre cualquier cambio publicando los nuevos términos en
      nuestro sitio web. Su uso continuado del sitio web después de cualquier
      cambio constituirá su aceptación de los nuevos términos.
    </p>

    <h2 class="text-xl">8. Ley Aplicable</h2>
    <p class="mt-2 mb-6">
      Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las
      leyes de México, sin dar efecto a sus principios de conflicto de leyes.
    </p>

    <h2 class="text-xl">9. Contacto</h2>
    <p class="mt-2 mb-6">
      Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor
      contáctenos en:
    </p>
    <p>
      <strong>inventariofacil.mx</strong><br />
      Correo Electrónico: {{ SUPPORT_EMAIL }}
    </p>
  </div>
</template>
