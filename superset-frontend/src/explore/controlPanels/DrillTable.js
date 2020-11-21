/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {t} from '@superset-ui/translation';
import controls from "../controls";
import mycontrols from "../mycontrols";

const drillDimSize = 3;
const drillControlSetRows = [];
for (let i = 1; i <= drillDimSize; i++) {
    let name = 'drill_by_' + i;
    drillControlSetRows.push([{
        name: name,
        config: {
            ...controls.groupby,
            queryField: name,
            multi: true, // 多选
            clearable: true, // 是否可调用， true当作sql
            validators: [], // 是否可以为空
            label: t('钻取列' + i),
            description: t('钻取列' + i)
        }
    }])
}


export default {
    controlPanelSections: [
        {
            label: t("钻取列"),
            description: t('钻取列'),
            expanded: true,
            controlSetRows: drillControlSetRows
        },
        {
            label: t('GROUP BY'),
            description: t('Use this section if you want a query that aggregates'),
            expanded: true,
            controlSetRows: [
                ['metrics'],
                ['groupby'],
                ['timeseries_limit_metric', 'row_limit'],
                ['include_time', 'order_desc'],
            ],
        },
        // {
        //     label: t('NOT GROUPED BY'),
        //     description: t('Use this section if you want to query atomic rows'),
        //     expanded: true,
        //     controlSetRows: [
        //         ['all_columns'],
        //         ['order_by_cols'],
        //         ['row_limit', null],
        //     ],
        // },
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
                [mycontrols.page_length],
                [mycontrols.include_search],
                [mycontrols.align_pn, mycontrols.color_pn],
                [mycontrols.use_paging, mycontrols.show_cell_bars]
            ],
        },
    ],
    controlOverrides: {
        metrics: {
            validators: [],
        },
    },
};