import { t } from '@superset-ui/translation';

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
            label: t('Options'),
            controlSetRows: [
                ['table_timestamp_format'],
                ['row_limit', 'page_length'],
                ['include_search', 'table_filter'],
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