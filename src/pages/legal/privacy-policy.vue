<script setup lang="ts">
import { SUPPORT_EMAIL } from "@/config/constants";
</script>

<template>
  <div class="container my-12">
    <h1 class="text-4xl">Política de Privacidad</h1>
    <p class="mt-2 mb-6">
      En <strong>inventariofacil.mx</strong> (en adelante, "nosotros", "nuestro"
      o "la Empresa"), nos comprometemos a proteger su privacidad. Esta Política
      de Privacidad describe cómo recopilamos, usamos y protegemos su
      información personal cuando utiliza nuestro sitio web y servicios.
    </p>

    <h2 class="text-xl">1. Información que Recopilamos</h2>
    <p class="mt-2 mb-2">Podemos recopilar la siguiente información:</p>
    <ul class="mb-6">
      <li>
        <strong>Información de Registro:</strong> Cuando se registra en nuestro
        sitio, recopilamos información personal como nombre, dirección de correo
        electrónico y datos de contacto.
      </li>
      <li>
        <strong>Información de Uso:</strong> Datos sobre cómo y cuándo utiliza
        nuestros servicios, incluyendo las páginas visitadas, las funciones
        usadas y las acciones realizadas.
      </li>
      <li>
        <strong>Información de Pago:</strong> Si adquiere una membresía premium,
        procesamos la información de pago a través de Stripe. No almacenamos
        información de pago en nuestros servidores.
      </li>
      <li>
        <strong>Información Técnica:</strong> Datos como dirección IP, tipo de
        navegador, idioma del navegador y otra información técnica relacionada
        con su uso del sitio.
      </li>
    </ul>

    <h2 class="text-xl">2. Uso de la Información</h2>
    <p class="mt-2 mb-2">Utilizamos la información recopilada para:</p>
    <ul class="mb-6">
      <li>Proveer y mejorar nuestros servicios.</li>
      <li>Procesar sus transacciones y gestionar su suscripción.</li>
      <li>Comunicarnos con usted sobre su cuenta y nuestros servicios.</li>
      <li>Personalizar su experiencia en nuestro sitio.</li>
      <li>
        Realizar análisis y estudios de mercado para mejorar nuestros servicios.
      </li>
      <li>Cumplir con nuestras obligaciones legales y resolver disputas.</li>
    </ul>

    <h2 class="text-xl">3. Compartir Información</h2>
    <p class="mt-2 mb-2">
      No compartimos su información personal con terceros, excepto en las
      siguientes circunstancias:
    </p>
    <ul class="mb-6">
      <li>
        <strong>Proveedores de Servicios:</strong> Podemos compartir información
        con terceros que nos ayudan a proporcionar nuestros servicios, como
        Stripe para el procesamiento de pagos, y servicios de hosting. Estos
        terceros están obligados a proteger su información y usarla solo para
        los fines especificados por nosotros.
      </li>
      <li>
        <strong>Obligaciones Legales:</strong> Podemos divulgar su información
        si es requerido por ley o en respuesta a solicitudes válidas por parte
        de autoridades públicas.
      </li>
      <li>
        <strong>Protección de Derechos:</strong> Podemos divulgar información
        para proteger nuestros derechos, propiedad o seguridad, así como los de
        nuestros usuarios y otros.
      </li>
    </ul>

    <h2 class="text-xl">4. Seguridad</h2>
    <p class="mt-2 mb-6">
      Nos esforzamos por proteger su información personal mediante el uso de
      medidas de seguridad apropiadas. Sin embargo, ningún método de transmisión
      por Internet o de almacenamiento electrónico es completamente seguro, por
      lo que no podemos garantizar su absoluta seguridad.
    </p>

    <h2 class="text-xl">5. Sus Derechos</h2>
    <p class="mt-2 mb-2">
      Dependiendo de su ubicación, puede tener ciertos derechos sobre su
      información personal, incluyendo el derecho a:
    </p>
    <ul class="mb-2">
      <li>Acceder a su información personal.</li>
      <li>Corregir o actualizar su información.</li>
      <li>Solicitar la eliminación de su información.</li>
      <li>Restringir u oponerse al procesamiento de su información.</li>
      <li>
        Solicitar una copia de su información en un formato estructurado y
        comúnmente utilizado.
      </li>
    </ul>
    <p class="mt-2 mb-6">
      Para ejercer estos derechos, puede contactarnos en [su dirección de
      contacto].
    </p>

    <h2 class="text-xl">6. Cambios a esta Política</h2>
    <p class="mt-2 mb-6">
      Podemos actualizar esta Política de Privacidad de vez en cuando. Le
      notificaremos sobre cualquier cambio publicando la nueva Política en
      nuestro sitio web. Se recomienda revisar esta Política periódicamente para
      estar informado sobre cómo protegemos su información.
    </p>

    <h2 class="text-xl">7. Contacto</h2>
    <p class="mt-2 mb-6">
      Si tiene alguna pregunta o inquietud sobre esta Política de Privacidad,
      puede contactarnos en:
    </p>
    <p class="mt-2 mb-6">
      <strong>inventariofacil.mx</strong><br />
      Correo Electrónico: {{ SUPPORT_EMAIL }}
    </p>
  </div>
</template>
