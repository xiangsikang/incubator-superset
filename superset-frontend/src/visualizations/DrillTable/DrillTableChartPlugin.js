import {t} from '@superset-ui/translation';
import {ChartMetadata, ChartPlugin} from '@superset-ui/chart';
import transformProps from './transformProps';
import thumbnail from './images/thumbnail.png';

const metadata = new ChartMetadata({
    canBeAnnotationTypes: ['EVENT', 'INTERVAL'],
    description: '',
    name: t('Drill Table'),
    thumbnail,
    useLegacyApi: true,
});

export default class DrillTableChartPlugin extends ChartPlugin {
    constructor() {
        super({
            loadChart: () => import('./ReactDrillTable.js'),
            metadata,
            transformProps,
        });
    }
}