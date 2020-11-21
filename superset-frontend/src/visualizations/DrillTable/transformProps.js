export default function transformProps(chartProps) {
    const {height, datasource, filters, formData, onAddFilter, queryData} = chartProps;
    const {
        alignPn,
        colorPn,
        includeSearch,
        metrics,
        orderDesc,
        usePaging,
        pageLength,
        percentMetrics,
        tableFilter,
        tableTimestampFormat,
        timeseriesLimitMetric,
        groupby,
        sliceId,
        showCellBars
    } = formData;


    let drillBy = [];
    for (let i = 1; i <= 3; i++) {
        let name = 'drillBy' + i;
        if (formData[name] && formData[name]) {
            drillBy.push(formData[name]);
        }
    }

    const {columnFormats, verboseMap} = datasource;

    const {records, columns} = queryData.data;

    const processedColumns = columns.map(key => {
        let label = verboseMap[key];
        // Handle verbose names for percents
        if (!label) {
            if (key[0] === '%') {
                const cleanedKey = key.substring(1);
                label = `% ${verboseMap[cleanedKey] || cleanedKey}`;
            } else {
                label = key;
            }
        }

        return {
            key,
            label,
            format: columnFormats && columnFormats[key],
        };
    });

    return {
        height,
        data: records,
        alignPositiveNegative: alignPn,
        colorPositiveNegative: colorPn,
        columns: processedColumns,
        filters,
        includeSearch,
        metrics,
        onAddFilter,
        orderDesc,
        usePaging,
        pageLength: pageLength && parseInt(pageLength, 10),
        percentMetrics,
        tableFilter,
        tableTimestampFormat,
        timeseriesLimitMetric,
        drillBy,
        groupby,
        sliceId,
        formData,
        showCellBars
    };
}