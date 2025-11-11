<template>
  <div class="skeleton-container">
    <div class="skeleton-chart">
      <div class="skeleton-header">
        <div class="skeleton-info">
          <div class="skeleton-title"></div>
          <div class="skeleton-metrics">
            <div class="skeleton-price"></div>
            <div class="skeleton-change"></div>
          </div>
        </div>
        <div class="skeleton-period"></div>
      </div>
      <div class="skeleton-graph">
        <div class="skeleton-line skeleton-line-1"></div>
        <div class="skeleton-line skeleton-line-2"></div>
        <div class="skeleton-line skeleton-line-3"></div>
      </div>
    </div>
    <div class="skeleton-buttons">
      <div class="skeleton-button" v-for="i in 5" :key="i"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.skeleton-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-chart {
  flex: 1;
  min-height: 400px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.skeleton-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-title {
  width: 120px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-metrics {
  display: flex;
  gap: 1rem;
}

.skeleton-price {
  width: 150px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-change {
  width: 80px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
  animation-delay: 0.1s;
}

.skeleton-period {
  width: 60px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  animation: pulse 1.5s ease-in-out infinite;
  animation-delay: 0.2s;
}

.skeleton-graph {
  flex: 1;
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 2rem 0;
}

.skeleton-line {
  flex: 1;
  background: linear-gradient(
    to top,
    rgba(0, 220, 130, 0.2) 0%,
    rgba(0, 220, 130, 0.05) 100%
  );
  border-radius: 4px 4px 0 0;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-line-1 {
  height: 60%;
  animation-delay: 0s;
}

.skeleton-line-2 {
  height: 80%;
  animation-delay: 0.2s;
}

.skeleton-line-3 {
  height: 45%;
  animation-delay: 0.4s;
}

.skeleton-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.skeleton-button {
  width: 100px;
  height: 52px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;

  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.2s; }
  &:nth-child(4) { animation-delay: 0.3s; }
  &:nth-child(5) { animation-delay: 0.4s; }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
</style>
