<template>
  <div class="w-full bg-white rounded-lg shadow dark:bg-slate-800 p-4 md:p-6">
    <div class="flex justify-between">
      <div class="flex items-center">
        <div
          class="w-12 h-12 rounded-lg text-slate-800 bg-slate-50 dark:bg-slate-700 dark:text-slate-100 flex items-center justify-center me-3"
        >
          <slot name="icon" />
        </div>
        <div>
          <h5
            class="leading-none text-2xl font-bold text-slate-900 dark:text-white pb-1"
          >
            <slot name="stat" />
          </h5>
          <p class="text-sm font-normal text-slate-500 dark:text-slate-400">
            <slot name="label" />
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
