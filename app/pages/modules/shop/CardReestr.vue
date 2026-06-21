<template>
    <div class="products-page">
        <div class="fixed">
            <Toast position="center" />
            <Toolbar>
                <template #start>
                    <Button label="Назад" icon="pi pi-chevron-left"
                        @click="main" />
                </template>
            </Toolbar>
        </div>
        <div>
            <table class="table">
                <tr>
                    <td colspan="3">
                        <h1>Разместить объявление</h1>
                    </td>
                </tr>
                <tr>
                    <td>
                        <Button label="Товары" icon="pi pi-chevron-right"
                            @click="clickBack({ module: 'shop', form: 'ProductCardReestr' })" />
                    </td>
                </tr>
                <tr>
                    <td>
                        <!-- <Button label="Услуги" icon="pi pi-chevron-right"
                            @click="clickBack({ module: 'shop', form: 'ServiceCardReestr' })" /> -->
                        <Button label="Услуги" icon="pi pi-chevron-right"/>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>


<script setup lang="ts">
import { clickBack } from '~/utils';
const main = async () => { navigateTo('/'); }
</script>
