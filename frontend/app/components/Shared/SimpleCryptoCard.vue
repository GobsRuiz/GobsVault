<template>
  <UCard class="simpleCryptoCard">
    <div class="simpleCryptoCard__top">
        <div class="simpleCryptoCard__top__logo">
            <UIcon 
                name="material-symbols:currency-bitcoin" 
                size="20" 
            />
        </div>

        <div class="simpleCryptoCard__top__names">
            <p class="simpleCryptoCard__top__names__full">
                BITCOIN
            </p>

            <p class="simpleCryptoCard__top__names__short">
                BTC
            </p>
        </div>
    </div>

    <div class="simpleCryptoCard__infos">
        <p class="simpleCryptoCard__infos__value">
            $19,384
        </p>

        <div class="simpleCryptoCard__infos__valorization">
            <UIcon name="ant-design:rise-outlined" size="15" />
            <p>
                2%
            </p>
        </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>

</script>

<style lang="scss">
.simpleCryptoCard{
    &__top{
        display: flex;
        align-items: center;

        &__logo{
            display: flex;
            box-shadow: 0 0 3px rgba(0, 0, 0, .1);
            border-radius: 10px;
            padding: 5px;
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
            background-color: green;
            padding: 3px 6px;

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