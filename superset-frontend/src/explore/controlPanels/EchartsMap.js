import { t } from '@superset-ui/translation';
import mycontrols from "../mycontrols";

export default {
    controlPanelSections: [
        {
            label: t('GROUP BY'),
            expanded: true,
            controlSetRows: [
                ['groupby'],
                ['metrics'],
                ['percent_metrics'],
                ['include_time'],
                ['timeseries_limit_metric', 'order_desc'],
            ],
        },
        {
            label: t('NOT GROUPED BY'),
            description: t('Use this section if you want to query atomic rows'),
            controlSetRows: [
                ['all_columns'],
                ['order_by_cols'],
            ],
        },
        {
            label: t('Query'),
            expanded: true,
            controlSetRows: [
                ['adhoc_filters'],
            ],
        },
        {
            label: t('Options'),
            expanded: true,
            controlSetRows: [
                ['color_scheme']
            ],
        }
    ],
    controlOverrides: {
        metrics: {
            validators: [],
        },
        time_grain_sqla: {
            default: null,
        },
    }

};
