<!--
CanvasJS React StockCharts - https://canvasjs.com/
Copyright 2023 fenopix

--------------------- License Information --------------------
CanvasJS is a commercial product which requires purchase of license. Without a commercial license you can use it for evaluation purposes for upto 30 days. Please refer to the following link for further details.
https://canvasjs.com/license/
-->
<script>
    import * as CJS from './canvasjs.min';
    var CanvasJS = CJS.Chart ? CJS : window.CanvasJS;

    export default {
        props: {
            'styles': {
                type: Object,
                default: () => ({})
            },
            'options': {
                type: Object,
                default: () => ({})
            }
        },
        emits: ['chart-ref'],
        data() {
            return {
                chart: null,
                updateChart: true,
                containerStyle: {
                    width: this.styles && this.styles.width ? this.styles.width : "100%",
                    height: this.styles && this.styles.height ? this.styles.height : "360px",
                    ...this.styles
                },
            }
        },
        watch: {
            options: {
                handler(options, prevOptions) {
                    this.updateChart = (!(options === prevOptions));
                }
            }
        },
        updated() {
            if (this.chart && this.updateChart) {
                this.chart.options = this.options;
                this.chart.render();
            }
        },
        mounted() {
            this.chart = new CanvasJS.Chart(this.$refs.chartContainer, this.options);
            this.chart.render();
            this.$emit('chart-ref', this.chart);

        },
        unmounted() {
            if (this.chart) {
                this.chart.destroy();
            }
        }
    }
    export { CanvasJS };
</script>
<template>
    <div ref="chartContainer" :style="containerStyle"></div>
</template>