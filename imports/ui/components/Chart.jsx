import React, { Component } from 'react';
import _ from 'lodash';
import Tooltip from 'tooltip.js';

let Axes; let Components; let Dataset; let Interactions; let Plots; let
  Scales;

if (Meteor.isClient) {
  const plottable = require('/client/libs/plottable.js');
  ({
    Axes, Components, Dataset, Interactions, Plots, Scales,
  } = plottable);
}

const getCombinedMap = (newArray = [], curArray = [], id) => {
  const combinedMap = {};
  newArray.forEach((entry, i) => combinedMap[entry[id]] = { newId: i });
  curArray.forEach((entry, i) => {
    if (combinedMap[entry[id]]) combinedMap[entry[id]].curId = i;
    else combinedMap[entry[id]] = { curId: i };
  });
  return combinedMap;
};

export default class PChart extends Component {
  constructor(props) {
    super(props);
    this.targetRef = React.createRef();
  }

  createScale(scaleData) {
    const { scaleId } = scaleData;
    if (this.scales[scaleId]) throw `duplicate scaleId: ${scaleId}.`;

    let scale;
    switch (scaleData.type) {
      case 'Linear':
        scale = new Scales.Linear();
        break;
      case 'Log':
        scale = new Scales.Log();
        break;
      case 'ModifiedLog':
        scale = new Scales.ModifiedLog();
        break;
      case 'Time':
        scale = new Scales.Time();
        break;
      case 'Category':
        scale = new Scales.Category();
        break;
      case 'Color':
        scale = new Scales.Color();
        break;
      case 'InterpolatedColor':
        scale = new Scales.InterpolatedColor(scaleData.colorScale);
        break;
      default:
        throw `${scaleData.type} is not a valid type for Scale.`;
    }
    if (scaleData.domain) scale.domain(scaleData.domain);
    if (scaleData.range) scale.range(scaleData.range);
    /* TODO: add tickGenerator */

    return scale;
  }

  loadScales() {
    this.scales = {};
    const { scales } = this.props;
    if (scales) {
      scales.forEach((scaleData) => this.scales[scaleData.scaleId] = this.createScale(scaleData));
    }
  }

  getScale(scaleId) {
    if (scaleId == null) return null;
    if (this.scales.hasOwnProperty(scaleId)) {
      return this.scales[scaleId];
    }
    throw `invalid scaleId: ${scaleId}`;
  }

  getComponent(componentId) {
    if (componentId == null) return null;
    if (this.components.hasOwnProperty(componentId)) {
      return this.components[componentId];
    }
    throw `invalid componentId: ${componentId}`;
  }

  getDataset(datasetId) {
    if (this.datasets.hasOwnProperty(datasetId)) return this.datasets[datasetId];
    throw `invalid datasetId: ${datasetId}`;
  }

  createDataset(datasetData) {
    const { datasetId } = datasetData;
    if (this.datasets[datasetId]) throw `duplicate datasetId: ${datasetId}.`;
    return new Dataset(datasetData.data, _.omit(datasetData, 'data'));
  }

  loadDatasets() {
    this.datasets = {};
    this.props.datasets.forEach((datasetData) => {
      this.datasets[datasetData.datasetId] = this.createDataset(datasetData);
    });
  }

  createPlot(plotData) {
    // TODO: add renderer('canvas') for supported types
    const { plotId } = plotData;
    if (this.components[plotId]) throw `duplicate componentId: ${plotId}.`;

    let plot;
    switch (plotData.type) {
      case 'Area':
        plot = new Plots.Area();
        break;
      case 'Bar':
        plot = new Plots.Bar();
        break;
      case 'ClusteredBar':
        plot = new Plots.ClusteredBar();
        break;
      case 'Line':
        plot = new Plots.Line();
        break;
      case 'Pie':
        plot = new Plots.Pie();
        break;
      case 'Rectangle':
        plot = new Plots.Rectangle();
        break;
      case 'Scatter':
        plot = new Plots.Scatter();
        break;
      case 'Segment':
        plot = new Plots.Segment();
        break;
      case 'StackedArea':
        plot = new Plots.StackedArea();
        break;
      case 'StackedBar':
        plot = new Plots.StackedBar();
        break;
      case 'Waterfall':
        plot = new Plots.Waterfall();
        break;
      default:
        throw `${plotData.type} is not a valid type for Scale.`;
    }
    if (plotData.type === 'Pie' && plotData.sectorValue) {
      plot.sectorValue(plotData.sectorValue.value,
        this.getScale(plotData.sectorValue.scale));
    }
    if (plotData.type !== 'Pie' && plotData.x) plot.x(plotData.x.value, this.getScale(plotData.x.scale));
    if (plotData.type !== 'Pie' && plotData.y) plot.y(plotData.y.value, this.getScale(plotData.y.scale));
    // TODO: use fill/stroke for different types of plots
    let hasFill = false;
    let hasStroke = false;
    if (plotData.attrs) {
      plotData.attrs.forEach((attrData) => {
        plot.attr(attrData.attr, attrData.value,
          this.getScale(attrData.scale));
        hasFill = hasFill || attrData.attr == 'fill';
        hasStroke = hasStroke || attrData.attr == 'stroke';
      });
    }
    let allDatasetsHaveColor = true;
    if (plotData.datasets) {
      plotData.datasets.forEach((datasetId) => {
        try {
          const dataset = this.getDataset(datasetId);
          plot.addDataset(dataset);
          allDatasetsHaveColor = allDatasetsHaveColor && !!dataset.metadata().color;
        } catch (e) {
          console.error(e);
        }
      });
    }

    if (!hasFill && !hasStroke && allDatasetsHaveColor) {
      plot.attr('stroke', (d, i, ds) => ds.metadata().color);
    }

    /* if (plot.attr('fill') && plot.attr('fill').scale) {
            this.plotColorScales[plotId] = plot.attr('fill').scale;
        } else if (plot.attr('stroke') && plot.attr('stroke').scale) {
            this.plotColorScales[plotId] = plot.attr('stroke').scale;
        } */

    if (plotData.interactions) this.loadInteractions(plotData.interactions, plot, plotId);
    if (plotData.tooltip) this.addTooltipQueue.push([plotData.tooltip, plot, plotId]);

    if (plotData.labelsEnabled != null) plot.labelsEnabled(plotData.labelsEnabled);
    if (plotData.labelFormatter) plot.labelFormatter(plotData.labelFormatter);
    return plot;
  }

  createAxis(axisData) {
    const { axisId } = axisData;
    if (this.components[axisId]) throw `duplicate componentId: ${axisId}.`;

    let axis;
    switch (axisData.type) {
      case 'Category':
        axis = new Axes.Category(
          this.getScale(axisData.scale), axisData.orientation,
        );
        break;
      case 'Numeric':
        axis = new Axes.Numeric(
          this.getScale(axisData.scale), axisData.orientation,
        );
        break;
      case 'Time':
        axis = new Axes.Time(
          this.getScale(axisData.scale), axisData.orientation,
        );
        break;
      default:
        throw `${axisData.type} is not a valid type for Axis.`;
    }
    if (axisData.xAlignment) axis.xAlignment(axisData.xAlignment);
    if (axisData.yAlignment) axis.yAlignment(axisData.yAlignment);

    if (axisData.interactions) this.loadInteractions(axisData.interactions, axis, axisId);
    if (axisData.tooltip) this.addTooltipQueue.push([axisData.tooltip, axis, axisId]);

    return axis;
  }

  createLabel(labelData) {
    const { labelId } = labelData;
    if (this.components[labelId]) throw `duplicate componentId: ${labelId}.`;

    let label;
    switch (labelData.type) {
      case 'Axis':
        label = new Label.Axis(labelData.text, labelData.angel);
      case 'Regular':
        label = new Label.Regular(labelData.text, labelData.angel);
      case 'Title':
        label = new Label.Title(labelData.text, labelData.angel);
      default:
        throw `${labelData.type} is not a valid type for Label.`;
    }
    if (labelData.xAlignment) label.xAlignment(labelData.xAlignment);
    if (labelData.yAlignment) label.yAlignment(labelData.yAlignment);
    if (labelData.padding) label.padding(labelData.padding);


    if (labelData.interactions) this.loadInteractions(labelData.interactions, label, labelId);
    if (labelData.tooltip) this.addTooltipQueue.push([labelData.tooltip, label, labelId]);

    return label;
  }

  createGridline(gridlineData) {
    const gridId = gridlineData.gridlineId;
    if (this.components[gridId]) throw `duplicate componentId: ${gridId}.`;

    const grid = new Components.Gridlines(
      this.getScale(gridlineData.xScale),
      this.getScale(gridlineData.yScale),
    );

    if (gridlineData.interactions) this.loadInteractions(gridlineData.interactions, grid, gridId);
    if (gridlineData.tooltip) this.addTooltipQueue.push([gridlineData.tooltip, grid, gridId]);

    return grid;
  }

  getColorDomainRangeFromPlots(plotIds) {
    const domain = []; const
      range = [];
    plotIds.forEach((plotId) => {
      const plot = this.getComponent(plotId);
      plot.datasets().forEach((dataset) => {
        const metadata = dataset.metadata();
        domain.push(metadata.label);
        range.push(metadata.color);
      });
    });
    return { domain, range };
  }

  createLegend(legendData) {
    // TODO: should take PlotGroup as well
    const { legendId } = legendData;
    const { plotId } = legendData;
    if (this.components[legendId]) throw `duplicate componentId: ${legendId}.`;

    let legend;
    switch (legendData.type) {
      case 'Regular':
        let domain = [];
        let range = [];
        if (legendData.domain && legendData.range) {
          domain = legendData.domain;
          range = legendData.range;
        } else {
          ({ domain, range } = getColorDomainRangeFromPlots(legendData.plotIds));
        }
        const colorScale = new Scales.Color().domain(domain).range(range);
        legend = new Components.Legend(colorScale);
        break;

      case 'InterpolatedColor':
        legend = new Components.InterpolatedColorLegend(
          this.getScale(legendData.colorScaleId),
        );
        break;
      default:
        throw `${legendData.type} is not a valid type for Legend.`;
    }

    if (legendData.xAlignment) legend.xAlignment(legendData.xAlignment);
    if (legendData.yAlignment) legend.yAlignment(legendData.yAlignment);

    if (legendData.interactions) this.loadInteractions(legendData.interactions, legend, legendId);
    if (legendData.tooltip) this.addTooltipQueue.push([legendData.tooltip, legend, legendId]);

    return legend;
  }

  createGroup(groupData) {
    const { groupId } = groupData;
    if (this.components[groupId]) throw `duplicate componentId: ${groupId}.`;

    let group;
    switch (groupData.type) {
      case 'Regular':
        group = new Components.Group();
        break;
      case 'Plot':
        group = new Components.PlotGroup();
        break;
      default:
        throw `${groupData.type} is not a valid type for Group.`;
    }
    groupData.components.forEach((componentId) => group.append(this.getComponent(componentId)));

    if (groupData.interactions) this.loadInteractions(groupData.interactions, group, groupId);
    if (groupData.tooltip) this.addTooltipQueue.push([groupData.tooltip, group, groupId]);

    return group;
  }

  loadComponents() {
    this.components = {};
    this.interactions = {};
    const components = this.props.components || {};
    const componentMeta = [
      { type: 'plots', id: 'plotId', createMethod: this.createPlot },
      { type: 'axes', id: 'axisId', createMethod: this.createAxis },
      { type: 'labels', id: 'labelId', createMethod: this.createLabel },
      { type: 'gridlines', id: 'gridlineId', createMethod: this.createGridline },
      { type: 'legends', id: 'legendId', createMethod: this.createLegend },
      { type: 'groups', id: 'groupId', createMethod: this.createGroup },
    ];
    componentMeta.forEach(({ type, id, createMethod }) => {
      const entities = components[type] || [];
      entities.forEach((data) => {
        this.components[data[id]] = createMethod.call(this, data);
      });
    });
  }

  attachClickInteraction(interactionData, component, componentId) {
    const interaction = new Interactions.Click();
    for (const action in interactionData) {
      switch (action) {
        case 'onClick':
          interaction.onClick(interactionData[action].bind(null, component, this));
          break;
        case 'onDoubleClick':
          interaction.onDoubleClick(interactionData[action].bind(null, component, this));
          break;
        default:
          throw `invalid event ${action} for Click Interaction.`;
      }
    }
    interaction.attachTo(component);
    const interactions = _.get(this.interactions, componentId, []);
    interactions.push(interaction);
    this.interactions[componentId] = interactions;
  }

  attachDragInteraction(interactionData, component, componentId) {
    const interaction = new Interactions.Drag();
    for (const action in interactionData) {
      switch (action) {
        case 'onDragStart':
          interaction.onDragStart(interactionData[action].bind(null, component, this));
          break;
        case 'onDrag':
          interaction.onDrag(interactionData[action].bind(null, component, this));
          break;
        case 'onDragEnd':
          interaction.onDragEnd(interactionData[action].bind(null, component, this));
          break;
        default:
          throw `invalid event ${action} for Drag Interaction.`;
      }
    }
    interaction.attachTo(component);
    const interactions = _.get(this.interactions, componentId, []);
    interactions.push(interaction);
    this.interactions[componentId] = interactions;
  }

  attachKeyInteraction(interactionData, component, componentId) {
    const interaction = new Interactions.Key();
    for (const action in interactionData) {
      switch (action) {
        case 'onKeyPress':
          interaction.onKeyPress(interactionData[action].bind(null, component, this));
          break;
        case 'onKeyRelease':
          interaction.onKeyRelease(interactionData[action].bind(null, component, this));
          break;
        default:
          throw `invalid event ${action} for Key Interaction.`;
      }
    }
    interaction.attachTo(component);
    const interactions = _.get(this.interactions, componentId, []);
    interactions.push(interaction);
    this.interactions[componentId] = interactions;
  }

  attachPanZoomInteraction(interactionData, component, componentId) {
    const interaction = new Interactions.PanZoom();
    for (const action in interactionData) {
      switch (action) {
        case 'xScales':
          interactionData[action].forEach((scaleId) => interaction.addXScale(this.getScale(scaleId)));
          break;
        case 'yScales':
          interactionData[action].forEach((scaleId) => interaction.addYScale(this.getScale(scaleId)));
          break;
        default:
          throw `invalid event ${action} for PanZoom Interaction.`;
      }
    }
    interaction.attachTo(component);
    const interactions = _.get(this.interactions, componentId, []);
    interactions.push(interaction);
    this.interactions[componentId] = interactions;
  }

  attachPointerInteraction(interactionData, component, componentId) {
    const interaction = new Interactions.Pointer();
    for (const action in interactionData) {
      switch (action) {
        case 'onPointerEnter':
          interaction.onPointerEnter(interactionData[action].bind(null, component, this));
          break;
        case 'onPointerExit':
          interaction.onPointerExit(interactionData[action].bind(null, component, this));
          break;
        case 'onPointerMove':
          interaction.onPointerMove(interactionData[action].bind(null, component, this));
          break;
        default:
          throw `invalid event ${action} for Pointer Interaction.`;
      }
    }
    interaction.attachTo(component);
    const interactions = _.get(this.interactions, componentId, []);
    interactions.push(interaction);
    this.interactions[componentId] = interactions;
  }

  loadInteractions(interactions, component, componentId) {
    for (const interaction in interactions) {
      switch (interaction) {
        case 'Click':
          this.attachClickInteraction(interactions[interaction], component);
          break;
        case 'Drag':
          this.attachDragInteraction(interactions[interaction], component);
          break;
        case 'Key':
          this.attachKeyInteraction(interactions[interaction], component);
          break;
        case 'PanZoom':
          this.attachPanZoomInteraction(interactions[interaction], component);
          break;
        case 'Pointer':
          this.attachPointerInteraction(interactions[interaction], component);
          break;
        default:
          throw `unrecognized interaction ${interaction}.`;
      }
    }
  }

  addTooltip(tooltipValue, component, componentId) {
    const selection = component.foreground().append('circle').attrs({
      r: 3,
      opacity: 0,
      id: `${componentId}_tooltip`,
    });

    const tooltip = new Tooltip(selection.node(), {
      container: this.targetRef.current,
      placement: 'auto',
      html: true,
      template: '<div class="tooltip bs-tooltip-auto" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    });

    const interaction = new Interactions.Pointer();
    interaction.onPointerMove((point) => {
      const selection = tooltip.reference;
      let closest;
      if (component instanceof Plots.Pie) closest = _.get(component.entitiesAt(point), 0);
      else closest = component.entityNearest(point);
      if (closest) {
        selection.setAttribute('cx', closest.position.x);
        selection.setAttribute('cy', closest.position.y);
        tooltip.updateTitleContent(tooltipValue(component, point, closest.datum, closest.dataset));
        tooltip.show();
      } else {
        tooltip.hide();
      }
    });
    interaction.onPointerExit((point) => {
      if (tooltip) tooltip.hide();
    });
    interaction.attachTo(component);
    this.tooltips[componentId] = { tooltip, interaction };
  }

  createLayout() {
    const { layout } = this.props;
    if (!Array.isArray(layout) || layout.length == 0 || !Array.isArray(layout[0])) {
      throw 'layout must be a 2D array.';
    }
    this.table = new Components.Table(
      layout.map((row) => row.map((col) => this.getComponent(col))),
    );
  }

  componentDidMount() {
    this.addTooltipQueue = [];
    this.tooltips = {};
    this.loadScales();
    this.loadDatasets();
    this.loadComponents();
    this.createLayout();
    this.table.renderTo(this.targetRef.current);
    this.addTooltipQueue.forEach((args) => this.addTooltip(...args));
  }

  updateScales(newScales, curScales) {
    const scalesDiff = {};
    if (!_.isEqual(newScales, curScales)) {
      const scalesMap = getCombinedMap(newScales, curScales, 'scaleId');
      for (const scaleId in scalesMap) {
        const { newId, curId } = scalesMap[scaleId];
        if (newId == undefined) {
          _.unset(this.scales, scaleId);
          scalesDiff[scaleId] = 'removed';
          continue;
        } if (curId == undefined) {
          this.scales[scaleId] = createScale(newScales[newId]);
          scalesDiff[scaleId] = 'new';
          continue;
        }
        const scale = this.scales[scaleId];
        const [newScale, curScale] = [newScales[newId], curScales[curId]];
        if (!_.isEqual(newScale, curScale)) {
          if (newScale.type !== curScale.type
            || (newScale.type == 'InterpolatedColor' && newScale.colorScale != curScale.colorScale)) {
            this.scales[scaleId] = createScale(newScales[newId]);
            scalesDiff[scaleId] = 'update';
            continue;
          }
          if (newScale.domain != curScale.domain) {
            if (newScale.domain == undefined) scale.autoDomain();
            else scale.domain(newScale.domain);
          }
          if (newScale.range != curScale.range) {
            if (newScale.range == undefined) scale.autoRange();
            else scale.range(newScale.range);
          }
        }
      }
    }
    return scalesDiff;
  }

  updateDatasets(newDatasets, curDatasets) {
    const datasetDiff = {};
    if (!_.isEqual(newDatasets, curDatasets)) {
      const datasetsMap = getCombinedMap(newDatasets, curDatasets, 'datasetId');
      for (const datasetId in datasetsMap) {
        const { newId, curId } = datasetsMap[datasetId];
        if (newId == undefined) {
          _.unset(this.datasets, datasetId);
          datasetDiff[datasetId] = 'removed';
        } else if (curId == undefined) {
          this.datasets[datasetId] = createDataset(newScales[newId]);
          datasetDiff[datasetId] = 'new';
        } else {
          const dataset = this.datasets[datasetId];
          const datasetData = newDatasets[newId];
          dataset.data(datasetData.data);
          dataset.metadata(_.omit(datasetData, 'data'));
        }
      }
    }
  }

  reloadTooltip(tooltipData = null, component, componentId) {
    const { tooltip, interaction } = _.get(this.tooltips, componentId, {});
    if (tooltip) {
      tooltip.dispose();
      interaction.detach();
    }
    if (tooltipData) {
      this.addTooltipQueue.push([tooltipData, component, componentId]);
    }
  }

  reloadInteractions(interactionsData = [], component, componentId) {
    const interactions = this.interactions[componentId] || [];
    interactions.forEach((interaction) => interaction.detach());
    this.interactions[componentId] = [];
    if (interactionsData.interactions) this.loadInteractions(interactionsData, component, componentId);
  }

  updatePlots(curPlots = [], newPlots = [], scalesDiff, componentsDiff) {
    const plotsMap = getCombinedMap(newPlots, curPlots, 'plotId');
    for (const plotId in plotsMap) {
      const { newId, curId } = plotsMap[plotId];
      if (newId == undefined) {
        _.unset(this.components, plotId);
        componentsDiff[plotId] = 'removed';
        continue;
      } if (curId == undefined || newPlots[newId].type !== curPlots[curId].type) {
        this.components[plotId] = createPlot(newPlots[newId]);
        componentsDiff[plotId] = 'new';
        continue;
      }
      const [newPlot, curPlot] = [newPlots[newId], curPlots[curId]];
      const plot = this.components[plotId];
      if (newPlot.type !== 'Pie') {
        if (!_.isEqual(newPlot.x, curPlot.x)) {
          plot.x(newPlot.x.value, this.getScale(newPlot.x.scale));
        } else if (curPlot.x.scale && _.has(scalesDiff, curPlot.x.scale)) {
          plot.x(curPlot.x.value, this.getScale(curPlot.x.scale));
        }
        if (!_.isEqual(newPlot.y, curPlot.y)) {
          plot.y(newPlot.y.value, this.getScale(newPlot.y.scale));
        } else if (curPlot.y.scale && _.has(scalesDiff, curPlot.y.scale)) {
          plot.y(curPlot.y.value, this.getScale(curPlot.y.scale));
        }
      } else if (!_.isEqual(newPlot.sectorValue, curPlot.sectorValue)) {
        plot.sectorValue(newPlot.sectorValue.value, this.getScale(newPlot.sectorValue.scale));
      } else if (curPlot.sectorValue.scale && _.has(scalesDiff, curPlot.sectorValue.scale)) {
        plot.sectorValue(curPlot.sectorValue.value, this.getScale(curPlot.sectorValue.scale));
      }
      const attrsMap = getCombinedMap(newPlot.attrs, curPlot.attrs, 'attr');
      for (const attr in attrsMap) {
        const { newId: nattrId, curId: cattrid } = attrsMap[attr];
        if (nattrId == undefined) {
          const oldScale = plot.attr(attr).scale;
          plot._attrBindings.remove(attr);
          plot._uninstallScaleForKey(oldScale, attr);
          plot._clearAttrToProjectorCache();
        } else {
          /* TODO: check if new and cur are different to improve performance */
          const attrData = newPlot.attrs[nattrId];
          plot.attr(attr, attrData.value, this.getScale(attrData.scale));
        }
      }
      if (!_.isEqual(newPlot.datasets, curPlot.datasets)) {
        const datasets = newPlot.datasets.map((id) => this.getDataset(id));
        plot.datasets(datasets);
      } if (newPlot.labelsEnabled != curPlot.labelsEnabled) {
        plot.labelsEnabled(newPlot.labelsEnabled); // TODO<#5>
      } if (newPlot.labelFormatter != curPlot.labelFormatter) {
        plot.labelFormatter(newPlot.labelFormatter); // TODO<#5>
      } if (!_.isEqual(newPlot.interactions, curPlot.interactions)) {
        // TODO: need to deep compare functions
        this.reloadInteractions(newPlot.interactions, plot, plotId);
      } if (!_.isEqual(newPlot.tooltip, curPlot.tooltip)) {
        this.reloadTooltip(newPlot.tooltip, plot, plotId);
      }
    }
    return componentsDiff;
  }

  updateAxes(curAxes = [], newAxes = [], scalesDiff, componentsDiff) {
    const axesMap = getCombinedMap(newAxes, curAxes, 'axisId');
    for (const axisId in axesMap) {
      const { newId, curId } = axesMap[axisId];
      if (newId == undefined) {
        _.unset(this.components, axisId);
        componentsDiff[axisId] = 'removed';
        continue;
      } if (curId == undefined || newAxes[newId].type != curAxes[curId].type) {
        this.components[axisId] = createAxis(newAxes[newId]);
        componentsDiff[axisId] = 'new';
        continue;
      }
      const axis = this.components[axisId];
      const newAxis = newAxes[newId]; const
        curAxis = curAxes[curId];
      if (newAxis.scale != curAxis.scale || _.has(scalesDiff, curAxis.scale)) {
        /* TODO<plottable> should add public method to reset scale on Plottable */
        axis.getScale().offUpdate(axis._rescaleCallback);
        axis._scale = axis.getScale(newAxis.scale);
        axis.getScale().onUpdate(axis._rescaleCallback);
      } if (newAxis.orientation != curAxis.orientation) {
        axis.orientation(newAxis.orientation); // TODO<#5>
      } if (newAxis.xAlignment != curAxis.xAlignment) {
        axis.xAlignment(newAxis.xAlignment); // TODO<#5>
      } if (newAxis.yAlignment != curAxis.yAlignment) {
        axis.yAlignment(newAxis.yAlignment); // TODO<#5>
      } if (!_.isEqual(newAxis.interactions, curAxis.interactions)) {
        // TODO: need to deep compare functions
        this.reloadInteractions(newAxis.interactions, axis, axisId);
      } if (!_.isEqual(newAxis.tooltip, curAxis.tooltip)) {
        this.reloadTooltip(newAxis.tooltip, axis, axisId);
      }
    }
    return componentsDiff;
  }

  updateLegends(curLegends = [], newLegends = [], scalesDiff, componentsDiff) {
    const legendsMap = getCombinedMap(newLegends, curLegends, 'legendId');
    for (const legendId in legendsMap) {
      const { newId, curId } = legendsMap[legendId];
      if (newId == undefined) {
        _.unset(this.components, legendId);
        componentsDiff[legendId] = 'removed';
        continue;
      } if (curId == undefined || newLegends[newId].type != curLegends[curId].type) {
        this.components[legendId] = createLegend(newLegends[newId]);
        componentsDiff[legendId] = 'new';
        continue;
      }
      const legend = this.components[legendId];
      const newLegend = newLegends[newId]; const
        curLegend = curLegends[curId];
      if (newLegends[newId].type == 'Regular') {
        if (newLegends.domain && newLegends.range) {
          if (!_.isEqual(newLegend.domain, curLegend.domain)) {
            legend.domain(newLegend.domain);
          } if (!_.isEqual(newLegend.range, curLegend.range)) {
            legend.range(newLegend.range);
          }
        } else {
          /* TODO<perf> check if plotsId updated, or plots updated or datasetUpdated */
          const { domain, range } = getColorDomainRangeFromPlots(newLegends.plotIds);
          legend.domain(domain).range(range);
        }
      } if (newLegend.xAlignment != curLegend.xAlignment) {
        legend.xAlignment(newLegend.xAlignment); // TODO<#5>
      } if (newLegend.yAlignment != curLegend.yAlignment) {
        legend.yAlignment(newLegend.yAlignment); // TODO<#5>
      } if (!_.isEqual(newLegend.interactions, curLegend.interactions)) {
        // TODO<perf>: need to deep compare functions
        this.reloadInteractions(newLegend.interactions, legend, legendId);
      } if (!_.isEqual(newLegend.tooltip, curLegend.tooltip)) {
        this.reloadTooltip(newLegend.tooltip, legend, legendId);
      }
    }
    return componentsDiff;
  }

  updateLabels(curLabels = [], newLabels = [], scalesDiff, componentsDiff) {
    const labelsMap = getCombinedMap(newLabels, curLabels, 'labelId');
    for (const labelId in labelsMap) {
      const { newId, curId } = labelsMap[labelId];
      if (newId == undefined) {
        _.unset(this.components, labelId);
        componentsDiff[labelId] = 'removed';
        continue;
      } if (curId == undefined || newLabels[newId].type != curLabels[curId].type) {
        this.components[labelId] = createLabel(newLabels[newId]);
        componentsDiff[labelId] = 'new';
        continue;
      }
      const label = this.components[labelId];
      const newLabel = newLabels[newId]; const
        curLabel = curLabels[curId];
      if (newLabel.xAlignment != curLabel.xAlignment) {
        label.xAlignment(newLabel.xAlignment); // TODO<#5>
      } if (newLabel.yAlignment != curLabel.yAlignment) {
        label.yAlignment(newLabel.yAlignment); // TODO<#5>
      } if (newLabel.padding != curLabel.padding) {
        label.padding(newLabel.padding); // TODO<#5>
      } if (!_.isEqual(newLabel.interactions, curLabel.interactions)) {
        // TODO: need to deep compare functions
        this.reloadInteractions(newLabel.interactions, label, labelId);
      } if (!_.isEqual(newLabel.tooltip, curLabel.tooltip)) {
        this.reloadTooltip(newLabel.tooltip, label, labelId);
      }
    }
    return componentsDiff;
  }

  updateGridlines(curGridlines = [], newGridlines = [], scalesDiff, componentsDiff) {
    const gridlinesMap = getCombinedMap(newGridlines, curGridlines, 'gridlineId');
    for (const gridlineId in gridlinesMap) {
      const { newId, curId } = gridlinesMap[gridlineId];
      if (newId == undefined) {
        _.unset(this.components, gridlineId);
        componentsDiff[gridlineId] = 'removed';
        continue;
      } if (curId == undefined) {
        this.components[gridlineId] = createGridline(newGridlines[newId]);
        componentsDiff[gridlineId] = 'new';
        continue;
      }
      const gridline = this.components[gridlineId];
      const newGridline = newGridlines[newId]; const
        curGridline = curGridlines[curId];
      if (newGridline.xScale !== curGridline.xScale || _.has(scalesDiff, curGridline.xScale)) {
        gridline.xScale = this.getScale(newGridline.xScale);
      } if (newGridline.yScale !== curGridline.yScale || _.has(scalesDiff, curGridline.yScale)) {
        gridline.yScale = this.getScale(newGridline.yScale);
      } if (!_.isEqual(newGridline.interactions, curGridline.interactions)) {
        // TODO: need to deep compare functions
        this.reloadInteractions(newGridline.interactions, gridline, gridlineId);
      } if (!_.isEqual(newGridline.tooltip, curGridline.tooltip)) {
        this.reloadTooltip(newGridline.tooltip, gridline, gridlineId);
      }
    }
    return componentsDiff;
  }

  updateGroups(curGroups = [], newGroups = [], scalesDiff, componentsDiff) {
    const groupsMap = getCombinedMap(newGroups, curGroups, 'groupId');
    for (const groupId in groupsMap) {
      // update componentsDiff in first pass, since a group may refer to another group
      const { newId, curId } = groupsMap[groupId];
      if (newId == undefined) {
        _.unset(this.components, groupId);
        componentsDiff[groupId] = 'removed';
      } else if (curId == undefined || newGroups[newId].type != curGroups[curId].type) {
        this.components[groupId] = createGroup(newGroups[newId]);
        componentsDiff[groupId] = 'new';
      }
    }
    for (const groupId in groupsMap) {
      const { newId, curId } = groupsMap[groupId];
      if (componentsDiff[groupId]) continue;

      const group = this.components[groupId];
      const newGroup = newGroups[newId]; const
        curGroup = curGroups[curId];

      group.components().forEach((component) => group.remove());
      newGroup.components.forEach((componentId) => group.append(this.getComponent(componentId)));

      if (!_.isEqual(newGroup.interactions, curGroup.interactions)) {
        // TODO: need to deep compare functions
        this.reloadInteractions(newGroup.interactions, group, groupId);
      } if (!_.isEqual(newGroup.tooltip, curGroup.tooltip)) {
        this.reloadTooltip(newGroup.tooltip, group, groupId);
      }
    }
    return componentsDiff;
  }

  updateComponents(prevComps, curComps, scalesDiff) {
    const componentsDiff = {};
    this.updatePlots(curComps.plots, prevComps.plots, scalesDiff, componentsDiff);
    this.updateAxes(curComps.axes, prevComps.axes, scalesDiff, componentsDiff);
    this.updateLegends(curComps.legends, prevComps.legends, scalesDiff, componentsDiff);
    this.updateLabels(curComps.labels, prevComps.labels, scalesDiff, componentsDiff);
    this.updateGridlines(curComps.gridlines, prevComps.gridlines, scalesDiff, componentsDiff);
    this.updateGroups(curComps.groups, prevComps.groups, scalesDiff, componentsDiff);
    return componentsDiff;
  }

  updateLayout(newLayout, curLayout, componentsDiff) {
    const newDim = newLayout.map((row) => row.length);
    const curDim = curLayout.map((row) => row.length);
    if (!_.isEqual(newDim, curDim)) {
      this.createLayout();
      return;
    }
    curLayout.forEach((row, i) => row.forEach((curCompId, j) => {
      const newCompId = newLayout[i][j];
      if (!curCompId == newCompId || _.has(componentsDiff, curCompId)) {
        const oldComponent = this.table.componentAt(i, j);
        this.table.remove(oldComponent);
        this.table.add(this.getComponent(newCompId), i, j);
      }
    }));
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props !== prevProps) {
      this.table.detach();
      this.addTooltipQueue = [];
      const scalesDiff = this.updateScales(this.props.scales, prevProps.scales);
      this.updateDatasets(this.props.datasets, prevProps.datasets);
      const componentsDiff = this.updateComponents(
        this.props.components, prevProps.components, scalesDiff,
      );
      this.updateLayout(this.props.layout, prevProps.layout, componentsDiff);
      this.table.renderTo(this.targetRef.current);
      this.addTooltipQueue.forEach((args) => this.addTooltip(...args));
    }
  }

  /*
    TODO: detach plots/eventlistener
    componentWillUnmount(){

    }
    */


  /*
    TODO: add width/height as props
    shouldComponentUpdate(nextProps, nextState){
        return false;
    }
    */

  render() {
    return (
      <div className="chart_warpper">
        <div ref={this.targetRef} style={this.props.config} />
      </div>
    );
  }
}

PChart.defaultProps = {
  config: {
    width: '300px',
    height: '300px',
  },
  layout: {},
  scales: [],
  components: [],
  datasets: [],
};
/*
props defintions:
{
    layout: [['component1Id','component2Id', 'component3Id']],
    scales: [{
        scaleId: 'string',
        type: 'Linear | Log | ModifiedLog | Time | Category | Color | '
              'InterpolatedColor',
        colorScale: 'linear| log | sqrt | pow', // for InterpolatedColor
        domain: [],
        range: [], // | REDS, BLUES, POSNEG for InterpolatedColor
    }...],
    datasets: [{
        datasetId: ''
        label: '',
        color: ''
        data: [],
    }...],
    components: {
        plots: [{
            plotId: 'string',
            type: 'Area | Bar | ClusteredBar | Line | Pie | Rectangle | '
                  'Scatter | Segment | StackedArea | StackedBar | Waterfall',
            x: {
                value: 'any | function',
                scale: 'null | scaleId'
            },
            y: {
                value: 'any | function',
                scale: 'null | scaleId'
            },
            sectorValue: {
                value: 'any | function',
                scale: 'null | scaleId'
            },
            attrs: [{
                attr: 'string',
                value: 'any | function',
                scale: 'null | scaleId'
            }...],
            labelsEnabled: boolean,
            labelFormatter: (value) => 'formatted string',
            datasets: ['datasetId'...],
            interactions: {
                Click: {
                    onClick: (component, chart, point, event) => {},
                    onDoubleClick :(component, point, event) => {}
                }
                Drag: {
                    onDrag: (component, chart, start, end) => {},
                    onDragEnd: (component, chart, start, end) => {},
                    onDragStart: (component, chart, start, end) => {},
                }
                Key: {
                    onKeyPress: (component, chart, keyCode) => {},
                    onKeyRelease: (component, chart, keyCode) => {},
                }
                PanZoom: {
                    xScales: ['scaleId'...],
                    yScales: ['scaleId'...]
                },
                Pointer: {
                    onPointerEnter: (component, chart, point) => {},
                    onPointerExit: (component, chart, point) => {},
                    onPointerMove: (component, chart, point) => {},
                },
            },
            tooltip: (component, point, data) => {}`
        }...],
        axes: [{
            axisId: 'string',
            type: 'Category | Numeric | Time',
            scale: 'scaleId',
            orientation: 'bottom | left | right | top',
            xAlignment: 'left | center | right',
            yAlignment: 'top | center | bottom',
            interaction: {...},
            tooltip: (component, point, data) => {}`
        }...],
        legends: [{
            legendId: 'string',
            type: 'Regular | InterpolatedColor',
            plotIds: ['plotId'..],
            colorScaleId: 'scaleId',
            domain: [],
            range: [],
            xAlignment: 'left | center | right',
            yAlignment: 'top | center | bottom',
            interaction: {...},
            tooltip: (component, point, data) => {}
        }...],
        labels: [{
            labelId: 'string',
            type: 'Axis | Regular | Title',
            angle: 'number',
            padding: 'number',
            text: 'string',
            xAlignment: 'left | center | right',
            yAlignment: 'top | center | bottom',
            interaction: {...},
            tooltip: (component, point, data) => {}`
        }...],
        gridlines: [{
            gridlineId: 'string',
            xScale: 'scaleId',
            yScale: 'scaleId',
            interaction: {...},
            tooltip: (component, point, data) => {}`
        }...],
        groups: [{
            groupId: 'string',
            type: 'Regular | Plot',
            components: ['componentId'...],
            interaction: {...},
            tooltip: (component, point, data) => {}`
        }]

    }
}
E.g.

let layout = [
    ['yAxis', 'group', 'legend'],
    [null, 'xAxis', null]];
let scales = [{
    scaleId: 'xScale',
    type: 'Linear'
}, {
    scaleId: 'yScale',
    type: 'Linear'
}];
let datasets = [{
    datasetId: 'dataset1',
    label: 'set 1',
    color: 'RED',
    data: [
      { "x": 0, "y": 1 },
      { "x": 1, "y": 2 },
      { "x": 2, "y": 4 },
      { "x": 3, "y": 8 }
]}, {
    datasetId: 'dataset2',
    label: 'set 2',
    color: 'BLUE',
    data: [
      { "x": 0, "y": 5 },
      { "x": 1, "y": 1 },
      { "x": 2, "y": 6 },
      { "x": 3, "y": 9 }
]},{
    datasetId: 'dataset3',
    label: 'target',
    color: 'GREEN',
    data: [
      { "x": 0},
      { "x": 1},
      { "x": 2},
      { "x": 3}
    ]
}]
let components = {
    plots: [{
        plotId: 'plot',
        type: 'Line',
        x: {
            value: (ds) => ds.x,
            scale: 'xScale'
        },
        y: {
            value: (ds) => ds.y,
            scale: 'yScale'
        },
        datasets: ['dataset1', 'dataset2']},
        {
        plotId: 'plot2',
        type: 'Line',
        x: {
            value: (ds) => ds.x,
            scale: 'xScale'
        },
        y: {
            value: 4,
            scale: 'yScale'
        },
        datasets: ['dataset3']
    }],
    axes: [{
        axisId: 'xAxis',
        type: 'Numeric',
        scale: 'xScale',
        orientation: 'bottom',
        interactions: {
            PanZoom: {
                xScales: ['xScale']
            }
        }
    },{
        axisId: 'yAxis',
        type: 'Numeric',
        scale: 'yScale',
        orientation: 'left',
        interactions: {
            PanZoom: {
                yScales: ['yScale']
            }
        }
    }],
    groups: [{
        groupId: 'group',
        type: 'Plot',
        components: ['plot', 'plot2'],
        interactions: {
            Pointer: {
                onPointerMove: (component, chart, point) => {
                    console.log(component.entityNearest(point));
                }
            }
        },
        tooltip: (component, point, data) => `(${data.datum.x},${data.datum.y})`
    }],
    legends: [{
        legendId: 'legend',
        type: 'Regular',
        plotIds: ['plot', 'plot2'],
    }]
};
<PChart layout={layout}, scales={scales}, components={components} datasets={datasets}/>
*/
