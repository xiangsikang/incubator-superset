import { t } from '@superset-ui/translation';
import { ChartMetadata, ChartPlugin } from '@superset-ui/chart';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';


const metadata = new ChartMetadata({
    name: t('Echarts Map'),
    description: 'echarts map',
    credits: ['https://www.echartsjs.com/examples/en/editor.html?c=mix-line-bar'],
    thumbnail,
    useLegacyApi: true,
});

export default class EchartsMapChartPlugin extends ChartPlugin {
    constructor() {
        super({
            metadata,
            transformProps,
            loadChart: () => import('./ReactEchartsMap'), // 前端渲染逻辑
        });
    }
}