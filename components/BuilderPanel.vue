<template>
    <builder-search-sidebar/>
</template>
<script>
import BuilderSearchSidebar from '~/components/BuilderSearchSidebar.vue'
export default {
	components: { BuilderSearchSidebar }
}
</script>
<style>
	.panel.builder {
    margin: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    max-height: 100%;
    display: grid;
    grid:
        "info toolbar search" 33px
        "info deck    search" calc(100% - 33px)
        / 251px auto 251px;
}
</style>	