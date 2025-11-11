<template>
  <UCard class="simpleCryptoCard max-w-max pointer-events-none">
    <div class="simpleCryptoCard__top">
      <div class="w-5 h-5 bg-white/10 rounded-full mr-2.5 animate-[pulse_1.5s_ease-in-out_infinite]"></div>

      <div class="simpleCryptoCard__top__names">
        <div class="w-[60px] h-3 mb-1 bg-white/10 rounded animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        <div class="w-[35px] h-2.5 bg-white/10 rounded animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.1s]"></div>
      </div>
    </div>

    <div class="simpleCryptoCard__chart">
      <div class="h-10 flex items-end gap-0.5 mx-2.5">
        <div class="flex-1 h-[50%] bg-gradient-to-t from-[rgba(0,220,130,0.15)] to-[rgba(0,220,130,0.05)] rounded-t animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0s]"></div>
        <div class="flex-1 h-[70%] bg-gradient-to-t from-[rgba(0,220,130,0.15)] to-[rgba(0,220,130,0.05)] rounded-t animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.1s]"></div>
        <div class="flex-1 h-[85%] bg-gradient-to-t from-[rgba(0,220,130,0.15)] to-[rgba(0,220,130,0.05)] rounded-t animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.2s]"></div>
        <div class="flex-1 h-[60%] bg-gradient-to-t from-[rgba(0,220,130,0.15)] to-[rgba(0,220,130,0.05)] rounded-t animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.3s]"></div>
        <div class="flex-1 h-[40%] bg-gradient-to-t from-[rgba(0,220,130,0.15)] to-[rgba(0,220,130,0.05)] rounded-t animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.4s]"></div>
      </div>
    </div>

    <div class="simpleCryptoCard__infos">
      <div class="w-[100px] h-5 mb-[5px] bg-white/10 rounded animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.2s]"></div>
      <div class="w-[60px] h-6 bg-white/10 rounded-xl animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.3s]"></div>
    </div>
  </UCard>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
