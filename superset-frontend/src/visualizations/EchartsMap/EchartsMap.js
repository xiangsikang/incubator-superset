import echarts from 'echarts';
import d3 from 'd3';
import PropTypes from 'prop-types';
import china from 'echarts/map/js/china'
import pp from './province'


// 数据类型检查
const propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
};

function EchartsMap(element, props) {


    const {
        width,
        height,
        data,
        formData
    } = props; // transformProps.js 返回的数据


    const div = d3.select(element);
    const sliceId = 'echarts_map_' + 10;
    const html = '<div id="' + sliceId + '" style="height:' + height + 'px; width:' + width + 'px;border:1px"></div>';
    div.html(html);

    let myChart = echarts.init(document.getElementById(sliceId), 'light');
    document.oncontextmenu = function () {
        return false;
    }; // 取消浏览器的邮件点击事件


    let groupbys = formData['groupby'];
    let metrics = formData['metrics'];
    let lab = 1;

    let data_value = data[groupbys[0]];

    let data_name = new Set();

    let option = {
        title: {
            subtext: '点击进入下一级，右键返回中国地图',
            x: 'center',
            bottom: '5%'
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                let res = params.name + '<br/>';
                let myseries = option.series;
                for (let i = 0; i < myseries.length; i++) {
                    for (let j = 0; j < myseries[i].data.length; j++) {
                        if (myseries[i].data[j].name == params.name) {
                            res += myseries[i].name + ' : ' + myseries[i].data[j].value + '</br>';
                        }
                    }
                }
                return res;
            }
        },
        toolbox: {
            show: true,
            orient: 'vertical',
            left: 'right',
            top: 'center',
            feature: {
                dataView: {readOnly: false},
                restore: {},
                saveAsImage: {}
            }
        },
        visualMap: {
            min: 0,
            max: 200,
            text: ['High', 'Low'],
            realtime: false,
            calculable: true,
            inRange: {
                color: ['lightskyblue', 'yellow', 'orangered']
            }
        },
        series: getSeries('china')
    };

    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);

    //用点击事件来切换地图实现下钻功能，该省份有值时才可以下钻
    myChart.on('click', function (chinaParam) {

        if (data_name.has(chinaParam.name) && lab === 1 && groupbys.length > 1) {
            lab = 2;
            data_value = data[groupbys[1]];
            let result_value = [];
            data_value.map(item => {
                let midValue = [];
                item['data'].map(opt => {
                    if (opt['key'] === chinaParam.name) {
                        midValue.push({'name': opt['name'], 'value': opt['value']})
                    }
                });
                result_value.push({'name': item['name'], 'data': midValue})
            });

            data_value = result_value;
            option = myChart.getOption();
            option.series = getSeries(chinaParam.name);
            myChart.setOption(option);

            // city_json.map(item => {
            //     if (item['dep'] === chinaParam.name) {
            //         $.getJSON('http://' + window.document.location.host + '/static/assets/spec/echarts/citys/' + item['value'] + '.json', function (res) {
            //             echarts.registerMap(item['name'], res);
            //         })
            //     }
            // })
        }

        if (data_name.has(chinaParam.name) && lab === 2 && groupbys.length > 2) {
            lab = 3;
            data_value = data[groupbys[2]];
            let result_value = [];
            data_value.map(item => {
                let midValue = [];
                item['data'].map(opt => {
                    if (opt['key'] === chinaParam.name) {
                        midValue.push({'name': opt['name'], 'value': opt['value']})
                    }
                });
                result_value.push({'name': item['name'], 'data': midValue})
            });

            data_value = result_value;
            option = myChart.getOption();
            option.series = getSeries(chinaParam.name);
            myChart.setOption(option);


        }
    });


    //用双击事件来返回最上层的中国地图，当不在中国地图时生效
    myChart.on('contextmenu', function (chinaParam) {
        if (myChart.getOption().series[0].map !== 'china') {
            lab = 1;
            data_value = data[groupbys[0]];
            option = myChart.getOption();
            option.series = getSeries('china');
            myChart.setOption(option);
        }
    });


    function getSeries(type) {
        let result = [];
        data_name.clear();
        metrics.map(opt => {
            data_value.map(datax => {
                let optName = typeof opt === 'string' ? opt : opt.label;
                if (datax['name'] === optName) {
                    datax['data'].map(item => {
                        data_name.add(item['name']);
                    });

                    let midx = {
                        name: datax['name'],
                        type: 'map',
                        map: type,
                        selectedMode: 'single',
                        roam: 'scale',
                        data: datax['data'],
                        /*label: {
                            normal: {
                                show: true,
                                textStyle: {color: "#b6a38a"}
                            },
                            emphasis: {
                                show: true,
                                textStyle: {color: "#ff6347"}
                            }
                        },
                        itemStyle: {
                            emphasis: {
                                areaColor: "#2e4783",
                                borderWidth: 0
                            }
                        }*/
                    };
                    result.push(midx);
                }
            })
        });

        return result;

    }

}

EchartsMap.displayName = 'Echarts Map2';
EchartsMap.propTypes = propTypes;

export default EchartsMap;