<template>
  <UCard class="simpleCryptoCard">
    <div class="simpleCryptoCard__top">
        <div class="simpleCryptoCard__top__logo">
            <UIcon :name="getIcon(symbol)" size="20" />
        </div>

        <div class="simpleCryptoCard__top__names">
            <p class="simpleCryptoCard__top__names__full">{{ name }}</p>
            <p class="simpleCryptoCard__top__names__short">{{ symbol }}</p>
        </div>
    </div>
    
    <div class="simpleCryptoCard__chart">
        <SharedChartsLineChartWithoutInfo 
            :data="sparkline" 
            :color="change >= 0 ? '#00dc82' : '#ef4444'"
        />
    </div>

    <div class="simpleCryptoCard__infos">
        <p class="simpleCryptoCard__infos__value">
           ${{ price.toLocaleString() }}
        </p>

        <div 
            class="simpleCryptoCard__infos__valorization"
            :class="{ negative: change < 0 }"
        >
            <UIcon 
                :name="change >= 0 ? 'ant-design:rise-outlined' : 'ant-design:fall-outlined'"  
                size="15" 
            />

            <p>
               {{ Math.abs(change).toFixed(2) }}%
            </p>
        </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
defineProps<{
    symbol: string
    name: string
    price: number
    change: number
    sparkline: number[]
}>()

const getIcon = (symbol: string) => {
  const icons: Record<string, string> = {
    BTC: 'cryptocurrency:btc',
    ETH: 'cryptocurrency:eth',
    BNB: 'cryptocurrency:bnb',
    SOL: 'cryptocurrency:sol',
    ADA: 'cryptocurrency:ada'
  }

  return icons[symbol] || 'cryptocurrency:generic'
}
</script>

<style lang="scss">
.simpleCryptoCard{
    max-width: max-content;

    &__top{
        display: flex;
        align-items: center;

        &__logo{
            display: flex;
            // box-shadow: 0 0 3px rgba(0, 0, 0, .1);
            border-radius: 10px;
            margin-right: 10px;
        }

        &__names{
            &__full{
                font-size: 10px;
                font-weight: 600; 
            }

            &__short{
                font-size: 10px;
                font-weight: 100;
            }
        }
    }

    &__chart {
        flex: 1;
        height: 40px;
        margin: 0 10px;
        
        canvas {
        width: 100% !important;
        height: 100% !important;
        }
    }

    &__infos{
        &__value{
            font-family: 'Britanica Expanded';
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        &__valorization{
            max-width: max-content;
            display: flex;
            align-items: center;
            border-radius: 6px;
            background-color: #00dc82;
            padding: 3px 6px;

            &.negative {
                background-color: #ef4444;
            }

            p{
                font-family: 'Britanica Expanded';
                font-size: 10px;
                font-weight: bold;
                margin-left: 5px;
            }
        }
    }
}
</style>