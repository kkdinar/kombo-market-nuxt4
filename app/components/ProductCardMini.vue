<template>
    <div>
        <div class="fixed-size-div">
            <Image :src="card.imageUrl" alt="Фото" @click="clickShowCard(card)" loading="lazy" />
        </div>
        <p />
        <Rating v-model="card.Level" readonly :cancel="false" />
        <p />
        <Button label="Отзывы" icon="pi pi-question-circle" @click="clickFeedBack(card)" />
        <label>|</label>
        <Button icon="pi pi-heart" label="Избранное" @click="clickAddToFavorite(card)" :disabled="card.inFavorit" />
        <h3>{{ card.Name }}</h3>
        <h3>{{ card.Price }} рублей</h3>
    </div>
</template>

<script setup lang="ts">
const props = defineProps({
    card: {
        type: Object,
        required: true
    },
    clickFeedBack: {
        type: Function,
        required: true
    },
    clickAddToFavorite: {
        type: Function,
        required: true
    }
});
console.log('!!!props.card=', props.card);
const clickShowCard = (data: any) => {
    const { id, typeOfSale } = toRaw(data);
    let form = 'ShowProductCard';
    if (typeOfSale === "Service") form = 'ShowServiceCard';
    linkToForm({ module: 'shop', form, id, });
    // return navigateTo(`/modules/shop/${form}/?id=` + id+'&backUrl='+);
}
</script>

<style>
.fixed-size-div {
    width: 300px;
    /* Фиксированная ширина */
    height: 300px;
    /* Фиксированная высота */
    overflow: hidden;
}
</style>