import d3 from 'd3';
import PropTypes from 'prop-types';
import dt from 'datatables.net-bs/js/dataTables.bootstrap';
import dompurify from 'dompurify';
import {getNumberFormatter, NumberFormats} from '@superset-ui/number-format';
import {getTimeFormatter} from '@superset-ui/time-format';
import fixTableHeight from './utils/fixTableHeight';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import './Table.css';


if (window.$) {
    dt(window, window.$);
}
const $ = window.$ || dt.$;

const propTypes = {
    // Each object is { field1: value1, field2: value2 }
    data: PropTypes.arrayOf(PropTypes.object),
    height: PropTypes.number,
    alignPositiveNegative: PropTypes.bool,
    colorPositiveNegative: PropTypes.bool,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string,
            label: PropTypes.string,
            format: PropTypes.string,
        }),
    ),
    filters: PropTypes.object,
    includeSearch: PropTypes.bool,
    metrics: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
    onAddFilter: PropTypes.func,
    onRemoveFilter: PropTypes.func,
    orderDesc: PropTypes.bool,
    usePaging: PropTypes.bool,
    pageLength: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    percentMetrics: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
    tableFilter: PropTypes.bool,
    tableTimestampFormat: PropTypes.string,
    timeseriesLimitMetric: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

const formatValue = getNumberFormatter(NumberFormats.INTEGER);
const formatPercent = getNumberFormatter(NumberFormats.PERCENT_3_POINT);


function NOOP() {
}

function DrillTableVis(element, props) {
    const {
        data,
        height,
        alignPositiveNegative = false,
        colorPositiveNegative = false,
        columnLabels,
        columns,
        filters = {},
        includeSearch = false,
        metrics: rawMetrics,
        onAddFilter = NOOP,
        onRemoveFilter = NOOP,
        orderDesc,
        usePaging,
        pageLength,
        percentMetrics,
        tableFilter,
        tableTimestampFormat,
        timeseriesLimitMetric,
        drillBy,
        sliceId,
        formData,
        showCellBars,
        upMode = 1
    } = props;


    // 取消浏览器的邮件点击事件
    document.oncontextmenu = function () {
        return false;
    };


    const $container = $(element);
    $container.addClass('superset-legacy-chart-table');


    const metrics = (rawMetrics || [])
        .map(m => m.label || m)
        // Add percent metrics
        .concat((percentMetrics || []).map(m => `%${m}`))
        // Removing metrics (aggregates) that are strings
        .filter(m => data && data.length > 0 && typeof data[0][m] === 'number');


    function col(c) {
        const arr = [];
        for (let i = 0; i < data.length; i += 1) {
            arr.push(data[i][c]);
        }

        return arr;
    }

    const maxes = {};
    const mins = {};
    for (let i = 0; i < metrics.length; i += 1) {
        if (alignPositiveNegative) {
            maxes[metrics[i]] = d3.max(col(metrics[i]).map(Math.abs));
        } else {
            maxes[metrics[i]] = d3.max(col(metrics[i]));
            mins[metrics[i]] = d3.min(col(metrics[i]));
        }
    }

    const tsFormatter = getTimeFormatter(tableTimestampFormat);

    const baseUrl = window.location.protocol + "//" + window.location.host;

    const apiUrl = baseUrl + '/superset/explore_json/?form_data=' + encodeURI(JSON.stringify({"slice_id": sliceId}));


    let timeIndex = 0, areaIndex = -1, mainIndex = -1, newColumns = [], whereList = [], cacheData = new Map(),
        check = true, token = "", requestData = formData, resultData = [], lastRequestTime = 0;
    let drillByIndex = drillBy.map(()=>0);
    let drillHistory = [];


    const div = d3.select(element);
    div.html('');

   /* if (timeBy.length <= 0) {
        areaIndex = 0;
        if (areaBy <= 0) {
            mainIndex = 0;
        }
    }*/

    getToken();
    flashTable();


    function flashTable() {

        const table = div
            .append('table')
            .classed(
                'dataframe table table-striped ' +
                'table-condensed table-hover dataTable no-footer',
                true,
            )
            .attr('width', '100%');


        // 将列置为空
        newColumns = [];
        requestData.groupby = [];

        for (let i = 0; i < drillBy.length; i++) {
            let index = drillByIndex.length > i ? drillByIndex[i] : -1;
            let items = drillBy[i];
            if (items && items.length > 0) {
                let key = index > 0 && index <= items.length ? items[index - 1] : items[0];

                newColumns.push({key, label: columnLabels[key], format: undefined})
            }

            // groupby
            for (let ii = 0; ii < index; ii++) {
                requestData.groupby.push(drillBy[i][ii]);
            }
        }
        columns.map(item => {
            metrics.map(metric => {
                if (item['key'] === metric) {
                    newColumns.push(item);
                }
            })
        });

        let humpFields =['adhocFilters', 'vizType', 'timeRangeEndpoints', 'urlParams', 'timeRangeEndpoints', 'granularitySqla', 'timeRange', 'rowLimit'];
        for (let field of humpFields) {
            requestData[field.replace(/([A-Z])/g,"_$1").toLowerCase()] =  requestData[field];
            if (requestData[field] !== undefined) {
                delete requestData[field]
            }
        }
        if (whereList.length > 0) {
            requestData.filters = [];
            whereList.map(item => {
                let filters_tmp = {"col": item['name'], "op": "==", "val": item['value']};
                requestData.filters.push(filters_tmp);

            });
        } else {
            requestData.filters = [];
        }

        if (check) {
            let isCache = false;
            let form_data = JSON.stringify(requestData);
            if (new Date().getTime() - lastRequestTime < 60000) {
                resultData = cacheData.get(form_data);
                if (resultData !== undefined) {
                    isCache = true;
                }
            }

            if (!isCache) {
                $.ajax({
                    url: apiUrl,
                    method: "POST",
                    cache: true,
                    beforeSend: function (XMLHttpRequest) {
                        XMLHttpRequest.setRequestHeader("X-CSRFToken", token);
                    },
                    async: false,
                    data: {"form_data": JSON.stringify(requestData)},
                    success: function (result) {
                        resultData = result['data']['records'];

                        lastRequestTime = new Date().getTime();
                        cacheData.set(form_data, resultData)
                    }
                });
            }
        }


        table
            .append('thead')
            .append('tr')
            .selectAll('th')
            .data(newColumns.map(c => c.label))
            .enter()
            .append('th')
            .text(d=>d)
            // .html(d => "<div>" + d + "<span></span></div>");


        table
            .append('tbody')
            .selectAll('tr')
            .data(resultData)
            .enter()
            .append('tr')
            .selectAll('td')
            .data(row =>
                newColumns.map(({key, format}, col) => {
                    const isMetric = metrics.indexOf(key) >= 0;
                    let val = row[key];
                    if (!isMetric) {
                        let index = drillByIndex[col] > 1 ? drillByIndex[col] - 1: 0;
                        val = row[drillBy[col][index]];
                    }

                    let html;

                    if (key === '__timestamp') {
                        html = tsFormatter(val);
                    }
                    if (typeof val === 'string') {
                        html = `<span class="like-pre">${dompurify.sanitize(val)}</span>`;
                    }
                    if (isMetric) {
                        html = getNumberFormatter(format)(val);
                    }
                    if (key[0] === '%') {
                        html = formatPercent(val);
                    }

                    if (typeof val === 'undefined' && key !== "操作") {
                        html = '全部';
                        val = '点击下钻';
                    }

                    if (typeof val === 'undefined' && key === "操作") {
                        html = `<span class="like-pre like-pre-add">下钻/上卷</span>`;
                        val = '左键下钻/右键上卷';
                    }

                    return {
                        col: key,
                        val,
                        html,
                        isMetric,
                    };
                }),
            )
            .enter()
            .append('td')
            .style('background-image', d => {
                if (d.isMetric && showCellBars) {
                    const r = colorPositiveNegative && d.val < 0 ? 150 : 0;
                    if (alignPositiveNegative) {
                        const perc = Math.abs(Math.round((d.val / maxes[d.col]) * 100));

                        // The 0.01 to 0.001 is a workaround for what appears to be a
                        // CSS rendering bug on flat, transparent colors
                        return (
                            `linear-gradient(to right, rgba(${r},0,0,0.2), rgba(${r},0,0,0.2) ${perc}%, ` +
                            `rgba(0,0,0,0.01) ${perc}%, rgba(0,0,0,0.001) 100%)`
                        );
                    }
                    const posExtent = Math.abs(Math.max(maxes[d.col], 0));
                    const negExtent = Math.abs(Math.min(mins[d.col], 0));
                    const tot = posExtent + negExtent;
                    const perc1 = Math.round((Math.min(negExtent + d.val, negExtent) / tot) * 100);
                    const perc2 = Math.round((Math.abs(d.val) / tot) * 100);

                    // The 0.01 to 0.001 is a workaround for what appears to be a
                    // CSS rendering bug on flat, transparent colors
                    return (
                        `linear-gradient(to right, rgba(0,0,0,0.01), rgba(0,0,0,0.001) ${perc1}%, ` +
                        `rgba(${r},0,0,0.2) ${perc1}%, rgba(${r},0,0,0.2) ${perc1 + perc2}%, ` +
                        `rgba(0,0,0,0.01) ${perc1 + perc2}%, rgba(0,0,0,0.001) 100%)`
                    );
                }

                return null;
            })
            .classed('text-right', d => d.isMetric)
            .attr('title', d => {
                if (typeof d.val === 'string') {
                    return d.val;
                }
                if (!Number.isNaN(d.val)) {
                    return formatValue(d.val);
                }

                return null;
            })
            .attr('data-sort', d => (d.isMetric ? d.val : null))
            .classed('filtered', d => filters && filters[d.col] && filters[d.col].indexOf(d.val) >= 0)
            .on('click', function (d, col, index) {
                let isDown = true;

                if (!d.isMetric && d.val) {

                    cacheData.set(drillByIndex.join('_'), resultData);

                    const line = resultData[index];
                    getDownWhere(line, d, false);

                    if (drillBy[col].length < drillByIndex[col] + 1) {
                        isDown = false;
                    } else {
                        if (upMode == 1) {
                            drillHistory.push(JSON.stringify(drillByIndex));
                        }
                        drillByIndex[col] = drillByIndex[col] + 1;
                    }

                    if (isDown) {
                        // 移除已有的记录
                        $(element).find('table').remove();
                        $(element).find('.dataTables_wrapper').remove();
                        check = true;
                        flashTable();
                    }

                }


            })
            .on('contextmenu', function (d, col, index) {
                    let isDown = true;
                    check = true;

                    if (!d.isMetric) {
                        const line = resultData[index];

                        // 上卷
                        if (upMode == 1) {
                            let str = drillHistory.pop();
                            if (str === undefined) {
                                isDown = false;
                            } else {
                                drillByIndex = JSON.parse(str);
                            }
                        } else {
                            // 选择列上卷
                            if (drillByIndex[col] <= 0) {
                                isDown = false;
                            } else {
                                drillByIndex[col] = drillByIndex[col] - 1;
                            }
                        }

                        if (isDown) {
                            resultData = cacheData.get(drillByIndex.join('_'));
                            if (resultData === undefined) {
                                check = true;
                            } else {
                                check = false;
                            }
                        }


                        if (check && isDown) {
                            getUpWhere(line, d, col);
                        }


                        if (isDown) {

                            // 移除已有的记录
                            $(element).find('table').remove();
                            $(element).find('.dataTables_wrapper').remove();
                            flashTable();
                        }

                    }

                }
            )

            .style('cursor', d => (!d.isMetric ? 'pointer' : ''))
            .html(d => (d.html ? d.html : d.val));


        $(element).find('.like-pre-add').parent().addClass("cssx");

        const paging = !!usePaging;

        const datatable = $container.find('.dataTable').DataTable({
            paging,
            pageLength,
            aaSorting: [],
            searching: includeSearch,
            bInfo: false,
            scrollY: `${height}px`,
            scrollCollapse: true,
            scrollX: true,
            retrieve: true,
        });

        fixTableHeight($container.find('.dataTables_wrapper'), height);
        // Sorting table by main column
        let sortBy;
        const limitMetric = Array.isArray(timeseriesLimitMetric)
            ? timeseriesLimitMetric[0]
            : timeseriesLimitMetric;
        if (limitMetric) {
            // Sort by as specified
            sortBy = limitMetric.label || limitMetric;
        } else if (metrics.length > 0) {
            // If not specified, use the first metric from the list
            sortBy = metrics[0];
        }
        if (sortBy) {
            const keys = newColumns.map(c => c.key);
            const index = keys.indexOf(sortBy);
            datatable.column(index).order(orderDesc ? 'desc' : 'asc');
            if (metrics.indexOf(sortBy) < 0) {
                // Hiding the sortBy column if not in the metrics list
                datatable.column(index).visible(false);
            }
        }
        datatable.draw();

    }


    function getDownWhere(line) {
        whereList = [];

        Object.keys(line).forEach(function (key) {
            let flag = true;
            metrics.map(metric => {
                if (key === metric) {
                    flag = false;
                }
            });


            if (flag) {
                whereList.push({"name": key, "value": line[key]});
            }
        });
    }


    function getUpWhere(line, d, row) {
        let midWhereLst = whereList;
        whereList = [];
        Object.keys(line).forEach(function (key) {
            let flag = true;
            metrics.map(metric => {
                if (key === metric) {
                    flag = false;
                }
            });


/*            if (timeBy.indexOf(key) > timeIndex) {
                flag = false;
            }

            if (areaBy.indexOf(key) > areaIndex) {
                flag = false;
            }

            if (groupby.indexOf(key) > mainIndex || mainIndex === -1) {
                flag = false;
            }*/


            if (flag) {
                whereList.push({"name": key, "value": line[key]});
            }

        });

        if (areaIndex === -1) whereList = [];
    }


    function getToken() {
        $.ajax({
            url: baseUrl + '/superset/csrf_token/',
            dataType: "json",
            async: false,
            success: function (res) {
                token = res.csrf_token;
            }
        })
    }


}

DrillTableVis.displayName = 'DrillTableVis';
DrillTableVis.propTypes = propTypes;

export default DrillTableVis;