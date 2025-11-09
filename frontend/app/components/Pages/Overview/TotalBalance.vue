<template>
  <div class="overviewTotalBalance">
    <UISectionTitle>
        Total Balance
    </UISectionTitle>

    <p class="overviewTotalBalance__value">
        $10.000<span>,00</span>
    </p>

    <SharedVariationBadge 
        :change="1"
    />
  </div>
</template>

<script lang="ts" setup>

</script>

<style lang="scss" scoped>
.overviewTotalBalance{
    margin-bottom: 32px;

    &__value{
        font-family: "Britanica Expanded";
        font-size: 32px;
        line-height: 32px;
        font-weight: bold;
        margin-bottom: 10px;
        margin-top: -4px;

        span{
            color: #707070;
        }
    }
}
</style>