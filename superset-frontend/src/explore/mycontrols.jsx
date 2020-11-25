import React from 'react';
import { t } from '@superset-ui/translation';
import { getCategoricalSchemeRegistry, getSequentialSchemeRegistry } from '@superset-ui/color';

import {
  formatSelectOptionsForRange,
  formatSelectOptions,
  mainMetric,
} from '../modules/utils';
import * as v from '@superset-ui/validator';
import { ColumnOption, OptionDescription } from '@superset-ui/chart-controls';

const categoricalSchemeRegistry = getCategoricalSchemeRegistry();
const sequentialSchemeRegistry = getSequentialSchemeRegistry();

const PRIMARY_COLOR = { r: 0, g: 122, b: 135, a: 1 };

const D3_FORMAT_DOCS = 'D3 format syntax: https://github.com/d3/d3-format';

// input choices & options
const D3_FORMAT_OPTIONS = [
  ['SMART_NUMBER', 'Adaptative formating'],
  ['.1s', '.1s (12345.432 => 10k)'],
  ['.3s', '.3s (12345.432 => 12.3k)'],
  [',.1%', ',.1% (12345.432 => 1,234,543.2%)'],
  ['.3%', '.3% (12345.432 => 1234543.200%)'],
  ['.4r', '.4r (12345.432 => 12350)'],
  [',.3f', ',.3f (12345.432 => 12,345.432)'],
  ['+,', '+, (12345.432 => +12,345.432)'],
  ['$,.2f', '$,.2f (12345.432 => $12,345.43)'],
];

const ROW_LIMIT_OPTIONS = [10, 50, 100, 250, 500, 1000, 5000, 10000, 50000];

const SERIES_LIMITS = [0, 5, 10, 25, 50, 100, 500];

export const D3_TIME_FORMAT_OPTIONS = [
  ['smart_date', 'Adaptative formating'],
  ['%d/%m/%Y', '%d/%m/%Y | 14/01/2019'],
  ['%m/%d/%Y', '%m/%d/%Y | 01/14/2019'],
  ['%Y-%m-%d', '%Y-%m-%d | 2019-01-14'],
  ['%Y-%m-%d %H:%M:%S', '%Y-%m-%d %H:%M:%S | 2019-01-14 01:32:10'],
  ['%d-%m-%Y %H:%M:%S', '%Y-%m-%d %H:%M:%S | 14-01-2019 01:32:10'],
  ['%H:%M:%S', '%H:%M:%S | 01:32:10'],
];


const timeColumnOption = {
  verbose_name: 'Time',
  column_name: '__timestamp',
  description: t(
      'A reference to the [Time] configuration, taking granularity into ' +
      'account'),
};
const sortAxisChoices = [
  ['alpha_asc', 'Axis ascending'],
  ['alpha_desc', 'Axis descending'],
  ['value_asc', 'sum(value) ascending'],
  ['value_desc', 'sum(value) descending'],
];

const groupByControl = {
  type: 'SelectControl',
  multi: true,
  freeForm: true,
  label: t('Group by'),
  default: [],
  includeTime: false,
  description: t('One or many controls to group by'),
  optionRenderer: c => <ColumnOption column={c} showType />,
  valueRenderer: c => <ColumnOption column={c} />,
  valueKey: 'column_name',
  allowAll: true,
  filterOption: (opt, text) => (
      (opt.column_name && opt.column_name.toLowerCase().indexOf(text.toLowerCase()) >= 0) ||
      (opt.verbose_name && opt.verbose_name.toLowerCase().indexOf(text.toLowerCase()) >= 0)
  ),
  promptTextCreator: label => label,
  mapStateToProps: (state, control) => {
    const newState = {};
    if (state.datasource) {
      newState.options = state.datasource.columns.filter(c => c.groupby);
      if (control && control.includeTime) {
        newState.options.push(timeColumnOption);
      }
    }
    return newState;
  },
  commaChoosesOption: false,
};

const sandboxUrl = (
    'https://github.com/apache/incubator-superset/' +
    'blob/master/superset/assets/src/modules/sandbox.js');
const jsFunctionInfo = (
    <div>
      {t('For more information about objects are in context in the scope of this function, refer to the')}
      <a href={sandboxUrl}>
        {t(" source code of Superset's sandboxed parser")}.
      </a>.
    </div>
);
function jsFunctionControl(label, description, extraDescr = null, height = 100, defaultText = '') {
  return {
    type: 'TextAreaControl',
    language: 'javascript',
    label,
    description,
    height,
    default: defaultText,
    aboveEditorSection: (
        <div>
          <p>{description}</p>
          <p>{jsFunctionInfo}</p>
          {extraDescr}
        </div>
    ),
    mapStateToProps: state => ({
      warning: !state.common.conf.ENABLE_JAVASCRIPT_CONTROLS ?
          t('This functionality is disabled in your environment for security reasons.') : null,
      readOnly: !state.common.conf.ENABLE_JAVASCRIPT_CONTROLS,
    }),
  };
}


const controls = {
  compare_lag: {
    type: 'TextControl',
    label: t('Comparison Period Lag'),
    isInt: true,
    description: t('Based on granularity, number of time periods to compare against'),
  },

  compare_suffix: {
    type: 'TextControl',
    label: t('Comparison suffix'),
    description: t('Suffix to apply after the percentage display'),
  },

  table_timestamp_format: {
    type: 'SelectControl',
    freeForm: true,
    label: t('Table Timestamp Format'),
    default: '%Y-%m-%d %H:%M:%S',
    renderTrigger: true,
    validators: [v.nonEmpty],
    clearable: false,
    choices: D3_TIME_FORMAT_OPTIONS,
    description: t('Timestamp Format'),
  },

  series_height: {
    type: 'SelectControl',
    renderTrigger: true,
    freeForm: true,
    label: t('Series Height'),
    default: '25',
    choices: formatSelectOptions(['10', '25', '40', '50', '75', '100', '150', '200']),
    description: t('Pixel height of each series'),
  },

  page_length: {
    type: 'SelectControl',
    freeForm: true,
    renderTrigger: true,
    label: t('Page Length'),
    default: 0,
    choices: formatSelectOptions([0, 10, 25, 40, 50, 75, 100, 150, 200]),
    description: t('Rows per page, 0 means no pagination'),
  },

  x_axis_format: {
    type: 'SelectControl',
    freeForm: true,
    label: t('X Axis Format'),
    renderTrigger: true,
    default: 'SMART_NUMBER',
    choices: D3_FORMAT_OPTIONS,
    description: D3_FORMAT_DOCS,
  },

  x_axis_time_format: {
    type: 'SelectControl',
    freeForm: true,
    label: t('X Axis Format'),
    renderTrigger: true,
    default: 'smart_date',
    choices: D3_TIME_FORMAT_OPTIONS,
    description: D3_FORMAT_DOCS,
  },

  y_axis_format: {
    type: 'SelectControl',
    freeForm: true,
    label: t('Y Axis Format'),
    renderTrigger: true,
    default: 'SMART_NUMBER',
    choices: D3_FORMAT_OPTIONS,
    description: D3_FORMAT_DOCS,
    mapStateToProps: (state) => {
      const showWarning = (
          state.controls &&
          state.controls.comparison_type &&
          state.controls.comparison_type.value === 'percentage');
      return {
        warning: showWarning ?
            t('When `Calculation type` is set to "Percentage change", the Y ' +
                'Axis Format is forced to `.1%`') : null,
        disabled: showWarning,
      };
    },
  },

  y_axis_2_format: {
    type: 'SelectControl',
    freeForm: true,
    label: t('Right Axis Format'),
    default: 'SMART_NUMBER',
    choices: D3_FORMAT_OPTIONS,
    description: D3_FORMAT_DOCS,
  },

  date_time_format: {
    type: 'SelectControl',
    freeForm: true,
    label: t('Date Time Format'),
    renderTrigger: true,
    default: 'smart_date',
    choices: D3_TIME_FORMAT_OPTIONS,
    description: D3_FORMAT_DOCS,
  },

  markup_type: {
    type: 'SelectControl',
    label: t('Markup Type'),
    clearable: false,
    choices: formatSelectOptions(['markdown', 'html']),
    default: 'markdown',
    validators: [v.nonEmpty],
    description: t('Pick your favorite markup language'),
  },

  rotation: {
    type: 'SelectControl',
    label: t('Word Rotation'),
    choices: formatSelectOptions(['random', 'flat', 'square']),
    renderTrigger: true,
    default: 'square',
    clearable: false,
    description: t('Rotation to apply to words in the cloud'),
  },

  line_interpolation: {
    type: 'SelectControl',
    label: t('Line Style'),
    renderTrigger: true,
    choices: formatSelectOptions(['linear', 'basis', 'cardinal',
      'monotone', 'step-before', 'step-after']),
    default: 'linear',
    description: t('Line interpolation as defined by d3.js'),
  },

  pie_label_type: {
    type: 'SelectControl',
    label: t('Label Type'),
    default: 'key',
    renderTrigger: true,
    choices: [
      ['key', 'Category Name'],
      ['value', 'Value'],
      ['percent', 'Percentage'],
      ['key_value', 'Category and Value'],
      ['key_percent', 'Category and Percentage'],
    ],
    description: t('What should be shown on the label?'),
  },

  code: {
    type: 'TextAreaControl',
    label: t('Code'),
    description: t('Put your code here'),
    mapStateToProps: state => ({
      language: state.controls && state.controls.markup_type ? state.controls.markup_type.value : 'markdown',
    }),
    default: '',
  },

  pandas_aggfunc: {
    type: 'SelectControl',
    label: t('Aggregation function'),
    clearable: false,
    choices: formatSelectOptions([
      'sum',
      'mean',
      'min',
      'max',
      'std',
      'var',
    ]),
    default: 'sum',
    description: t('Aggregate function to apply when pivoting and ' +
        'computing the total rows and columns'),
  },

  js_agg_function: {
    type: 'SelectControl',
    label: t('Dynamic Aggregation Function'),
    description: t('The function to use when aggregating points into groups'),
    default: 'sum',
    clearable: false,
    renderTrigger: true,
    choices: formatSelectOptions([
      'sum',
      'min',
      'max',
      'mean',
      'median',
      'count',
      'variance',
      'deviation',
      'p1',
      'p5',
      'p95',
      'p99',
    ]),
  },

  size_from: {
    type: 'TextControl',
    isInt: true,
    label: t('Minimum Font Size'),
    renderTrigger: true,
    default: '20',
    description: t('Font size for the smallest value in the list'),
  },

  size_to: {
    type: 'TextControl',
    isInt: true,
    label: t('Maximum Font Size'),
    renderTrigger: true,
    default: '150',
    description: t('Font size for the biggest value in the list'),
  },

  header_font_size: {
    type: 'SelectControl',
    label: t('Header Font Size'),
    renderTrigger: true,
    clearable: false,
    default: 0.3,
    // Values represent the percentage of space a header should take
    options: [
      {
        label: t('Tiny'),
        value: 0.125,
      },
      {
        label: t('Small'),
        value: 0.2,
      },
      {
        label: t('Normal'),
        value: 0.3,
      },
      {
        label: t('Large'),
        value: 0.4,
      },
      {
        label: t('Huge'),
        value: 0.5,
      },
    ],
  },

  subheader_font_size: {
    type: 'SelectControl',
    label: t('Subheader Font Size'),
    renderTrigger: true,
    clearable: false,
    default: 0.125,
    // Values represent the percentage of space a subheader should take
    options: [
      {
        label: t('Tiny'),
        value: 0.125,
      },
      {
        label: t('Small'),
        value: 0.2,
      },
      {
        label: t('Normal'),
        value: 0.3,
      },
      {
        label: t('Large'),
        value: 0.4,
      },
      {
        label: t('Huge'),
        value: 0.5,
      },
    ],
  },

  instant_filtering: {
    type: 'CheckboxControl',
    label: t('Instant Filtering'),
    renderTrigger: true,
    default: true,
    description: (
        'Whether to apply filters as they change, or wait for' +
        'users to hit an [Apply] button'
    ),
  },

  extruded: {
    type: 'CheckboxControl',
    label: t('Extruded'),
    renderTrigger: true,
    default: true,
    description: ('Whether to make the grid 3D'),
  },

  show_brush: {
    type: 'SelectControl',
    label: t('Show Range Filter'),
    renderTrigger: true,
    clearable: false,
    default: 'auto',
    choices: [
      ['yes', 'Yes'],
      ['no', 'No'],
      ['auto', 'Auto'],
    ],
    description: t('Whether to display the time range interactive selector'),
  },

  date_filter: {
    type: 'CheckboxControl',
    label: t('Date Filter'),
    default: true,
    description: t('Whether to include a time filter'),
  },

  show_sqla_time_granularity: {
    type: 'CheckboxControl',
    label: t('Show SQL Granularity Dropdown'),
    default: false,
    description: t('Check to include SQL Granularity dropdown'),
  },

  show_sqla_time_column: {
    type: 'CheckboxControl',
    label: t('Show SQL Time Column'),
    default: false,
    description: t('Check to include Time Column dropdown'),
  },

  show_druid_time_granularity: {
    type: 'CheckboxControl',
    label: t('Show Druid Granularity Dropdown'),
    default: false,
    description: t('Check to include Druid Granularity dropdown'),
  },

  show_druid_time_origin: {
    type: 'CheckboxControl',
    label: t('Show Druid Time Origin'),
    default: false,
    description: t('Check to include Time Origin dropdown'),
  },

  show_datatable: {
    type: 'CheckboxControl',
    label: t('Data Table'),
    default: false,
    renderTrigger: true,
    description: t('Whether to display the interactive data table'),
  },

  include_search: {
    type: 'CheckboxControl',
    label: t('Search Box'),
    renderTrigger: true,
    default: false,
    description: t('Whether to include a client-side search box'),
  },

  table_filter: {
    type: 'CheckboxControl',
    label: t('Emit Filter Events'),
    renderTrigger: true,
    default: false,
    description: t('Whether to apply filter when items are clicked'),
  },

  align_pn: {
    type: 'CheckboxControl',
    label: t('Align +/-'),
    renderTrigger: true,
    default: false,
    description: t('Whether to align the background chart for +/- values'),
  },

  color_pn: {
    type: 'CheckboxControl',
    label: t('Color +/-'),
    renderTrigger: true,
    default: true,
    description: t('Whether to color +/- values'),
  },

  show_bubbles: {
    type: 'CheckboxControl',
    label: t('Show Bubbles'),
    default: false,
    renderTrigger: true,
    description: t('Whether to display bubbles on top of countries'),
  },

  show_legend: {
    type: 'CheckboxControl',
    label: t('Legend'),
    renderTrigger: true,
    default: true,
    description: t('Whether to display the legend (toggles)'),
  },

  send_time_range: {
    type: 'CheckboxControl',
    label: t('Propagate'),
    renderTrigger: true,
    default: false,
    description: t('Send range filter events to other charts'),
  },

  toggle_polygons: {
    type: 'CheckboxControl',
    label: t('Multiple filtering'),
    renderTrigger: true,
    default: true,
    description: t('Allow sending multiple polygons as a filter event'),
  },

  num_buckets: {
    type: 'SelectControl',
    multi: false,
    freeForm: true,
    label: t('Number of buckets to group data'),
    default: 5,
    choices: formatSelectOptions([2, 3, 5, 10]),
    description: t('How many buckets should the data be grouped in.'),
    renderTrigger: true,
  },

  break_points: {
    type: 'SelectControl',
    multi: true,
    freeForm: true,
    label: t('Bucket break points'),
    choices: formatSelectOptions([]),
    description: t('List of n+1 values for bucketing metric into n buckets.'),
    renderTrigger: true,
  },

  show_labels: {
    type: 'CheckboxControl',
    label: t('Show Labels'),
    renderTrigger: true,
    default: true,
    description: t(
        'Whether to display the labels. Note that the label only displays when the the 5% ' +
        'threshold.'),
  },

  show_values: {
    type: 'CheckboxControl',
    label: t('Show Values'),
    renderTrigger: true,
    default: false,
    description: t('Whether to display the numerical values within the cells'),
  },

  show_metric_name: {
    type: 'CheckboxControl',
    label: t('Show Metric Names'),
    renderTrigger: true,
    default: true,
    description: t('Whether to display the metric name as a title'),
  },

  show_trend_line: {
    type: 'CheckboxControl',
    label: t('Show Trend Line'),
    renderTrigger: true,
    default: true,
    description: t('Whether to display the trend line'),
  },

  start_y_axis_at_zero: {
    type: 'CheckboxControl',
    label: t('Start y-axis at 0'),
    renderTrigger: true,
    default: true,
    description: t('Start y-axis at zero. Uncheck to start y-axis at minimum value in the data.'),
  },

  x_axis_showminmax: {
    type: 'CheckboxControl',
    label: t('X bounds'),
    renderTrigger: true,
    default: false,
    description: t('Whether to display the min and max values of the X-axis'),
  },

  y_axis_showminmax: {
    type: 'CheckboxControl',
    label: t('Y bounds'),
    renderTrigger: true,
    default: false,
    description: t('Whether to display the min and max values of the Y-axis'),
  },

  rich_tooltip: {
    type: 'CheckboxControl',
    label: t('Rich Tooltip'),
    renderTrigger: true,
    default: true,
    description: t('The rich tooltip shows a list of all series for that ' +
        'point in time'),
  },

  y_log_scale: {
    type: 'CheckboxControl',
    label: t('Y Log Scale'),
    default: false,
    renderTrigger: true,
    description: t('Use a log scale for the Y-axis'),
  },

  x_log_scale: {
    type: 'CheckboxControl',
    label: t('X Log Scale'),
    default: false,
    renderTrigger: true,
    description: t('Use a log scale for the X-axis'),
  },

  log_scale: {
    type: 'CheckboxControl',
    label: t('Log Scale'),
    default: false,
    renderTrigger: true,
    description: t('Use a log scale'),
  },

  donut: {
    type: 'CheckboxControl',
    label: t('Donut'),
    default: false,
    renderTrigger: true,
    description: t('Do you want a donut or a pie?'),
  },

  labels_outside: {
    type: 'CheckboxControl',
    label: t('Put labels outside'),
    default: true,
    renderTrigger: true,
    description: t('Put the labels outside the pie?'),
  },

  contribution: {
    type: 'CheckboxControl',
    label: t('Contribution'),
    default: false,
    description: t('Compute the contribution to the total'),
  },

  time_compare: {
    type: 'SelectControl',
    multi: true,
    freeForm: true,
    label: t('Time Shift'),
    choices: formatSelectOptions([
      '1 day',
      '1 week',
      '28 days',
      '30 days',
      '52 weeks',
      '1 year',
    ]),
    description: t('Overlay one or more timeseries from a ' +
        'relative time period. Expects relative time deltas ' +
        'in natural language (example:  24 hours, 7 days, ' +
        '56 weeks, 365 days)'),
  },

  comparison_type: {
    type: 'SelectControl',
    label: t('Calculation type'),
    default: 'values',
    choices: [
      ['values', 'Actual Values'],
      ['absolute', 'Absolute difference'],
      ['percentage', 'Percentage change'],
      ['ratio', 'Ratio'],
    ],
    description: t('How to display time shifts: as individual lines; as the ' +
        'absolute difference between the main time series and each time shift; ' +
        'as the percentage change; or as the ratio between series and time shifts.'),
  },

  subheader: {
    type: 'TextControl',
    label: t('Subheader'),
    description: t('Description text that shows up below your Big Number'),
  },

  mapbox_label: {
    type: 'SelectControl',
    multi: true,
    label: t('label'),
    default: [],
    description: t('`count` is COUNT(*) if a group by is used. ' +
        'Numerical columns will be aggregated with the aggregator. ' +
        'Non-numerical columns will be used to label points. ' +
        'Leave empty to get a count of points in each cluster.'),
    mapStateToProps: state => ({
      choices: columnChoices(state.datasource),
    }),
  },

  mapbox_style: {
    type: 'SelectControl',
    label: t('Map Style'),
    clearable: false,
    renderTrigger: true,
    choices: [
      ['mapbox://styles/mapbox/streets-v9', 'Streets'],
      ['mapbox://styles/mapbox/dark-v9', 'Dark'],
      ['mapbox://styles/mapbox/light-v9', 'Light'],
      ['mapbox://styles/mapbox/satellite-streets-v9', 'Satellite Streets'],
      ['mapbox://styles/mapbox/satellite-v9', 'Satellite'],
      ['mapbox://styles/mapbox/outdoors-v9', 'Outdoors'],
    ],
    default: 'mapbox://styles/mapbox/light-v9',
    description: t('Base layer map style'),
  },

  clustering_radius: {
    type: 'SelectControl',
    freeForm: true,
    label: t('Clustering Radius'),
    default: '60',
    choices: formatSelectOptions([
      '0',
      '20',
      '40',
      '60',
      '80',
      '100',
      '200',
      '500',
      '1000',
    ]),
    description: t('The radius (in pixels) the algorithm uses to define a cluster. ' +
        'Choose 0 to turn off clustering, but beware that a large ' +
        'number of points (>1000) will cause lag.'),
  },

  point_radius_fixed: {
    type: 'FixedOrMetricControl',
    label: t('Point Size'),
    default: { type: 'fix', value: 1000 },
    description: t('Fixed point radius'),
    mapStateToProps: state => ({
      datasource: state.datasource,
    }),
  },

  point_radius: {
    type: 'SelectControl',
    label: t('Point Radius'),
    default: 'Auto',
    description: t('The radius of individual points (ones that are not in a cluster). ' +
        'Either a numerical column or `Auto`, which scales the point based ' +
        'on the largest cluster'),
    mapStateToProps: state => ({
      choices: columnChoices(state.datasource),
    }),
  },

  point_radius_unit: {
    type: 'SelectControl',
    label: t('Point Radius Unit'),
    default: 'Pixels',
    choices: formatSelectOptions(['Pixels', 'Miles', 'Kilometers']),
    description: t('The unit of measure for the specified point radius'),
  },

  point_unit: {
    type: 'SelectControl',
    label: t('Point Unit'),
    default: 'square_m',
    clearable: false,
    choices: [
      ['square_m', 'Square meters'],
      ['square_km', 'Square kilometers'],
      ['square_miles', 'Square miles'],
      ['radius_m', 'Radius in meters'],
      ['radius_km', 'Radius in kilometers'],
      ['radius_miles', 'Radius in miles'],
    ],
    description: t('The unit of measure for the specified point radius'),
  },

  global_opacity: {
    type: 'TextControl',
    label: t('Opacity'),
    default: 1,
    isFloat: true,
    description: t('Opacity of all clusters, points, and labels. ' +
        'Between 0 and 1.'),
  },

  opacity: {
    type: 'SliderControl',
    label: t('Opacity'),
    default: 80,
    step: 1,
    min: 0,
    max: 100,
    renderTrigger: true,
    description: t('Opacity, expects values between 0 and 100'),
  },

  viewport_zoom: {
    type: 'TextControl',
    label: t('Zoom'),
    renderTrigger: true,
    isFloat: true,
    default: 11,
    description: t('Zoom level of the map'),
    places: 8,
    // Viewport zoom shouldn't prompt user to re-run query
    dontRefreshOnChange: true,
  },

  viewport_latitude: {
    type: 'TextControl',
    label: t('Default latitude'),
    renderTrigger: true,
    default: 37.772123,
    isFloat: true,
    description: t('Latitude of default viewport'),
    places: 8,
    // Viewport latitude changes shouldn't prompt user to re-run query
    dontRefreshOnChange: true,
  },

  viewport_longitude: {
    type: 'TextControl',
    label: t('Default longitude'),
    renderTrigger: true,
    default: -122.405293,
    isFloat: true,
    description: t('Longitude of default viewport'),
    places: 8,
    // Viewport longitude changes shouldn't prompt user to re-run query
    dontRefreshOnChange: true,
  },

  render_while_dragging: {
    type: 'CheckboxControl',
    label: t('Live render'),
    default: true,
    description: t('Points and clusters will update as the viewport is being changed'),
  },

  mapbox_color: {
    type: 'SelectControl',
    freeForm: true,
    label: t('RGB Color'),
    default: 'rgb(0, 122, 135)',
    choices: [
      ['rgb(0, 139, 139)', 'Dark Cyan'],
      ['rgb(128, 0, 128)', 'Purple'],
      ['rgb(255, 215, 0)', 'Gold'],
      ['rgb(69, 69, 69)', 'Dim Gray'],
      ['rgb(220, 20, 60)', 'Crimson'],
      ['rgb(34, 139, 34)', 'Forest Green'],
    ],
    description: t('The color for points and clusters in RGB'),
  },

  color: {
    type: 'ColorPickerControl',
    label: t('Color'),
    default: PRIMARY_COLOR,
    description: t('Pick a color'),
  },

  ranges: {
    type: 'TextControl',
    label: t('Ranges'),
    default: '',
    description: t('Ranges to highlight with shading'),
  },

  range_labels: {
    type: 'TextControl',
    label: t('Range labels'),
    default: '',
    description: t('Labels for the ranges'),
  },

  markers: {
    type: 'TextControl',
    label: t('Markers'),
    default: '',
    description: t('List of values to mark with triangles'),
  },

  marker_labels: {
    type: 'TextControl',
    label: t('Marker labels'),
    default: '',
    description: t('Labels for the markers'),
  },

  marker_lines: {
    type: 'TextControl',
    label: t('Marker lines'),
    default: '',
    description: t('List of values to mark with lines'),
  },

  marker_line_labels: {
    type: 'TextControl',
    label: t('Marker line labels'),
    default: '',
    description: t('Labels for the marker lines'),
  },

  annotation_layers: {
    type: 'AnnotationLayerControl',
    label: '',
    default: [],
    description: 'Annotation Layers',
    renderTrigger: true,
    tabOverride: 'data',
  },

  adhoc_filters: {
    type: 'AdhocFilterControl',
    label: t('Filters'),
    default: null,
    description: '',
    mapStateToProps: state => ({
      columns: state.datasource ? state.datasource.columns.filter(c => c.filterable) : [],
      savedMetrics: state.datasource ? state.datasource.metrics : [],
      datasource: state.datasource,
    }),
    provideFormDataToProps: true,
  },

  filters: {
    type: 'FilterPanel',
  },

  slice_id: {
    type: 'HiddenControl',
    label: t('Chart ID'),
    hidden: true,
    description: t('The id of the active chart'),
  },

  cache_timeout: {
    type: 'HiddenControl',
    label: t('Cache Timeout (seconds)'),
    hidden: true,
    description: t('The number of seconds before expiring the cache'),
  },

  url_params: {
    type: 'HiddenControl',
    label: t('URL Parameters'),
    hidden: true,
    description: t('Extra parameters for use in jinja templated queries'),
  },

  order_by_entity: {
    type: 'CheckboxControl',
    label: t('Order by entity id'),
    description: t('Important! Select this if the table is not already sorted by entity id, ' +
        'else there is no guarantee that all events for each entity are returned.'),
    default: true,
  },

  min_leaf_node_event_count: {
    type: 'SelectControl',
    freeForm: false,
    label: t('Minimum leaf node event count'),
    default: 1,
    choices: formatSelectOptionsForRange(1, 10),
    description: t('Leaf nodes that represent fewer than this number of events will be initially ' +
        'hidden in the visualization'),
  },

  color_scheme: {
    type: 'ColorSchemeControl',
    label: t('Color Scheme'),
    default: 'bnbColors',
    renderTrigger: true,
    choices: () => categoricalSchemeRegistry.keys().map(s => ([s, s])),
    description: t('The color scheme for rendering chart'),
    schemes: () => categoricalSchemeRegistry.getMap(),
  },

  label_colors: {
    type: 'ColorMapControl',
    label: t('Color Map'),
    default: {},
    renderTrigger: true,
    mapStateToProps: state => ({
      colorNamespace: state.form_data.color_namespace,
      colorScheme: state.form_data.color_scheme,
    }),
  },

  significance_level: {
    type: 'TextControl',
    label: t('Significance Level'),
    default: 0.05,
    description: t('Threshold alpha level for determining significance'),
  },

  pvalue_precision: {
    type: 'TextControl',
    label: t('p-value precision'),
    default: 6,
    description: t('Number of decimal places with which to display p-values'),
  },

  liftvalue_precision: {
    type: 'TextControl',
    label: t('Lift percent precision'),
    default: 4,
    description: t('Number of decimal places with which to display lift values'),
  },

  column_collection: {
    type: 'CollectionControl',
    label: t('Time Series Columns'),
    validators: [v.nonEmpty],
    controlName: 'TimeSeriesColumnControl',
  },

  rose_area_proportion: {
    type: 'CheckboxControl',
    label: t('Use Area Proportions'),
    description: t(
        'Check if the Rose Chart should use segment area instead of ' +
        'segment radius for proportioning',
    ),
    default: false,
    renderTrigger: true,
  },

  time_series_option: {
    type: 'SelectControl',
    label: t('Options'),
    validators: [v.nonEmpty],
    default: 'not_time',
    valueKey: 'value',
    options: [
      {
        label: t('Not Time Series'),
        value: 'not_time',
        description: t('Ignore time'),
      },
      {
        label: t('Time Series'),
        value: 'time_series',
        description: t('Standard time series'),
      },
      {
        label: t('Aggregate Mean'),
        value: 'agg_mean',
        description: t('Mean of values over specified period'),
      },
      {
        label: t('Aggregate Sum'),
        value: 'agg_sum',
        description: t('Sum of values over specified period'),
      },
      {
        label: t('Difference'),
        value: 'point_diff',
        description: t('Metric change in value from `since` to `until`'),
      },
      {
        label: t('Percent Change'),
        value: 'point_percent',
        description: t('Metric percent change in value from `since` to `until`'),
      },
      {
        label: t('Factor'),
        value: 'point_factor',
        description: t('Metric factor change from `since` to `until`'),
      },
      {
        label: t('Advanced Analytics'),
        value: 'adv_anal',
        description: t('Use the Advanced Analytics options below'),
      },
    ],
    optionRenderer: op => <OptionDescription option={op} />,
    valueRenderer: op => <OptionDescription option={op} />,
    description: t('Settings for time series'),
  },

  equal_date_size: {
    type: 'CheckboxControl',
    label: t('Equal Date Sizes'),
    default: true,
    renderTrigger: true,
    description: t('Check to force date partitions to have the same height'),
  },

  partition_limit: {
    type: 'TextControl',
    label: t('Partition Limit'),
    isInt: true,
    default: '5',
    description:
        t('The maximum number of subdivisions of each group; ' +
            'lower values are pruned first'),
  },

  min_radius: {
    type: 'TextControl',
    label: t('Minimum Radius'),
    isFloat: true,
    validators: [v.nonEmpty],
    renderTrigger: true,
    default: 2,
    description:
        t('Minimum radius size of the circle, in pixels. As the zoom level changes, this ' +
            'insures that the circle respects this minimum radius.'),
  },

  max_radius: {
    type: 'TextControl',
    label: t('Maximum Radius'),
    isFloat: true,
    validators: [v.nonEmpty],
    renderTrigger: true,
    default: 250,
    description:
        t('Maxium radius size of the circle, in pixels. As the zoom level changes, this ' +
            'insures that the circle respects this maximum radius.'),
  },

  partition_threshold: {
    type: 'TextControl',
    label: t('Partition Threshold'),
    isFloat: true,
    default: '0.05',
    description:
        t('Partitions whose height to parent height proportions are ' +
            'below this value are pruned'),
  },

  line_column: {
    type: 'SelectControl',
    label: t('Lines column'),
    default: null,
    description: t('The database columns that contains lines information'),
    mapStateToProps: state => ({
      choices: columnChoices(state.datasource),
    }),
    validators: [v.nonEmpty],
  },
  line_type: {
    type: 'SelectControl',
    label: t('Lines encoding'),
    clearable: false,
    default: 'json',
    description: t('The encoding format of the lines'),
    choices: [
      ['polyline', 'Polyline'],
      ['json', 'JSON'],
      ['geohash', 'geohash (square)'],
    ],
  },

  line_width: {
    type: 'TextControl',
    label: t('Line width'),
    renderTrigger: true,
    isInt: true,
    default: 10,
    description: t('The width of the lines'),
  },

  line_charts: {
    type: 'SelectAsyncControl',
    multi: true,
    label: t('Line charts'),
    validators: [v.nonEmpty],
    default: [],
    description: t('Pick a set of line charts to layer on top of one another'),
    dataEndpoint: '/sliceasync/api/read?_flt_0_viz_type=line&_flt_7_viz_type=line_multi',
    placeholder: t('Select charts'),
    onAsyncErrorMessage: t('Error while fetching charts'),
    mutator: (data) => {
      if (!data || !data.result) {
        return [];
      }
      return data.result.map(o => ({ value: o.id, label: o.slice_name }));
    },
  },

  line_charts_2: {
    type: 'SelectAsyncControl',
    multi: true,
    label: t('Right Axis chart(s)'),
    validators: [],
    default: [],
    description: t('Choose one or more charts for right axis'),
    dataEndpoint: '/sliceasync/api/read?_flt_0_viz_type=line&_flt_7_viz_type=line_multi',
    placeholder: t('Select charts'),
    onAsyncErrorMessage: t('Error while fetching charts'),
    mutator: (data) => {
      if (!data || !data.result) {
        return [];
      }
      return data.result.map(o => ({ value: o.id, label: o.slice_name }));
    },
  },

  prefix_metric_with_slice_name: {
    type: 'CheckboxControl',
    label: t('Prefix metric name with slice name'),
    default: false,
    renderTrigger: true,
  },

  reverse_long_lat: {
    type: 'CheckboxControl',
    label: t('Reverse Lat & Long'),
    default: false,
  },

  deck_slices: {
    type: 'SelectAsyncControl',
    multi: true,
    label: t('deck.gl charts'),
    validators: [v.nonEmpty],
    default: [],
    description: t('Pick a set of deck.gl charts to layer on top of one another'),
    dataEndpoint: '/sliceasync/api/read?_flt_0_viz_type=deck_&_flt_7_viz_type=deck_multi',
    placeholder: t('Select charts'),
    onAsyncErrorMessage: t('Error while fetching charts'),
    mutator: (data) => {
      if (!data || !data.result) {
        return [];
      }
      return data.result.map(o => ({ value: o.id, label: o.slice_name }));
    },
  },

  js_data_mutator: jsFunctionControl(
      t('Javascript data interceptor'),
      t('Define a javascript function that receives the data array used in the visualization ' +
          'and is expected to return a modified version of that array. This can be used ' +
          'to alter properties of the data, filter, or enrich the array.'),
  ),

  js_data: jsFunctionControl(
      t('Javascript data mutator'),
      t('Define a function that receives intercepts the data objects and can mutate it'),
  ),

  js_tooltip: jsFunctionControl(
      t('Javascript tooltip generator'),
      t('Define a function that receives the input and outputs the content for a tooltip'),
  ),

  js_onclick_href: jsFunctionControl(
      t('Javascript onClick href'),
      t('Define a function that returns a URL to navigate to when user clicks'),
  ),

  js_columns: {
    ...groupByControl,
    label: t('Extra data for JS'),
    default: [],
    description: t('List of extra columns made available in Javascript functions'),
  },

  stroked: {
    type: 'CheckboxControl',
    label: t('Stroked'),
    renderTrigger: true,
    description: t('Whether to display the stroke'),
    default: false,
  },

  filled: {
    type: 'CheckboxControl',
    label: t('Filled'),
    renderTrigger: true,
    description: t('Whether to fill the objects'),
    default: true,
  },

  filter_configs: {
    type: 'CollectionControl',
    label: 'Filters',
    description: t('Filter configuration for the filter box'),
    validators: [],
    controlName: 'FilterBoxItemControl',
    mapStateToProps: ({ datasource }) => ({ datasource }),
  },

  normalized: {
    type: 'CheckboxControl',
    label: t('Normalized'),
    renderTrigger: true,
    description: t('Whether to normalize the histogram'),
    default: false,
  },

  order_desc: {
    type: 'CheckboxControl',
    label: t('order desc'),
    renderTrigger: true,
    default: false,
    description: t('Order Desc'),
  },

  use_paging: {
    type: 'CheckboxControl',
    label: t('Use paging'),
    renderTrigger: true,
    default: false,
    description: t('Use paging'),
  },

  show_cell_bars: {
    type: 'CheckboxControl',
    label: t('Show Cell Bars'),
    renderTrigger: true,
    default: false,
    description: t('Show Cell Bars'),
  }
};

for (let key in controls) {
  let config = controls[key];
  controls[key] = {
    name: key,
    config: config
  }
}

export default controls;
