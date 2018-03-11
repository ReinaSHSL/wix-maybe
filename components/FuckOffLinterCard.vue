<template>
    <img class="card-preview" :src="card.image"/>
</template>
<script>
    export default {
        props: ['card']
    }
</script>