<template>
  <div class="fixed">

  </div>
</template>


<style>
.fixed {
  position: sticky;
  /*позицианируем чтобы исчез скролл*/
  width: 100%;
  /*что бы верстка не складывалась по ширине*/
  top: 0px;
  z-index: 99999999;

  /*поверх всех элементов*/
  .error {
    border-color: red;
  }

  .error-msg {
    color: red;
    font-size: 0.8em;
  }
}
</style>