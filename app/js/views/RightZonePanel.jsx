/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', 
  'jsx!./SearchResultsPanel', 'jsx!./SearchBoxPanel', 
  'jsx!./MapPanel', 'jsx!./EntityDetailsPanel', 
  'jsx!./MapControlsPanel', 'jsx!./MapLegendPanel',
  './AppViewMixin', './DomUtilsMixin'  ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var AppViewMixin = require('./AppViewMixin');
    var SearchBoxPanel = require('jsx!./SearchBoxPanel');
    var SearchResultsPanel = require('jsx!./SearchResultsPanel');
    var EntityDetailsPanel = require('jsx!./EntityDetailsPanel');
    var MapPanel = require('jsx!./MapPanel');
    var DomUtilsMixin = require('./DomUtilsMixin');
    var MapControlsPanel = require('jsx!./MapControlsPanel');
    var MapLegendPanel = require('jsx!./MapLegendPanel');

    
    return React.createClass({
        displayName : 'RightZonePanel',
        mixins: [DomUtilsMixin],
        _newState : function(options){
            return _.extend({
                expanded : true,
            }, this.state, options);
        },
        getInitialState : function(){
            return this._newState();
        },
        componentWillMount : function() {
            this.props.app.nav.addChangeListener(this._onSelectionUpdate);
            this.props.app.sites.addChangeListener(this._onSearchUpdate);
            this._addResizeListener(this._updateLayout);
        },
        componentDidMount : function(){
            this._updateLayout();
        },
        componentWillUnmount : function() {
            this._removeResizeListener(this._updateLayout);
            this.props.app.nav.removeChangeListener(this._onSelectionUpdate);
            this.props.app.sites.removeChangeListener(this._onSearchUpdate);
        },
        componentDidUpdate : function(){
            this._updateLayout();
        },
        _updateLayout : function(){
            var parentNode = this.getDOMNode();
            var searchBoxNode = this.refs.searchBox.getDOMNode();
            var height = this._calculateHeight(parentNode, searchBoxNode);
            var list = this.refs.resultList;
            var detailsPanel = this.refs.detailsPanel;
            
            var searchControl = this.refs.searchControl;
            var controlNode = searchControl.getDOMNode();
            var controlHeight = this._getOuterHeight(controlNode);
            var searchBoxHeight = this._getOuterHeight(searchBoxNode);
            
            if (list || detailsPanel) {
                var h = Math.max(0, height - controlHeight);
                if (list){
                    list.setHeight(h);
                }
                if (detailsPanel){
                    h -= controlHeight;
                    detailsPanel.setViewportParams(h, searchBoxHeight);
                }
            }
            
            var searchPanel = this.refs.searchPanel;
            var searchPanelPos = this._getPosition(searchPanel.getDOMNode());
            
            var mapPanel = this.refs.mapPanel;
            var mapPanelNode = mapPanel.getDOMNode();
            var mapPanelPos = this._getPosition(mapPanelNode);
            //var left = (searchPanelPos.left - mapPanelPos.left)  * 0.5;
            var mapPanelWidth = this._getOuterWidth(mapPanelNode);
            var searchPanelWidth = this._getOuterWidth(searchPanel.getDOMNode());
            
            var left = (mapPanelWidth + searchPanelWidth ) * 0.5   ;
            console.log('>> LEFT', left);
            var top = mapPanelNode.offsetHeight * 0.5;
            var ui = this.props.app.ui;
            
            if (ui.isMobileMode()) { 
                left = mapPanelNode.offsetWidth * 0.5;
                top = (mapPanelNode.offsetHeight - searchBoxHeight) * 0.5;
                top = Math.max(10, top);
            }
            if (!isNaN(left) && !isNaN(top)) {
                mapPanel.setCenterPosition({
                    left : left,
                    top : top
                });
                mapPanel.setViewport([[0, 0], [left * 2, top * 2]]);
                mapPanel.setFocusPosition({
                    left : left,
                    top : top * 0.6
                });
            }
        },
        _onSearchUpdate : function() {
            var nav = this.props.app.nav;
            var searchCriteria = nav.getSearchCriteria();
//            if (searchCriteria.q || searchCriteria.sectors || searchCriteria.activities) {
//                //this._setExpandedState(this.state.expanded);
//                this._setExpandedState(true);
//            } else {
//                this._setExpandedState(false);
//            }
            this._setExpandedState(this.state.expanded);
        },
        _onSelectionUpdate : function(){
            var ui = this.props.app.ui;
            var nav = this.props.app.nav;
            if (ui.isMobileMode()) {
                var siteId = nav.getSelectedSiteId();
                if (siteId) {
                    this._setExpandedState(false);
                }
            }
        },
        _setExpandedState : function(expanded){
            this.setState(this._newState({
                expanded : expanded
            }));
        },
        _toggleExpandedView : function(ev){
            this._setExpandedState(!this.state.expanded);
            ev.stopPropagation();
        },

        _renderSearchResults : function(){
            var className = 'search-results';
            var store = this.props.app.sites;
            var resultsNumber = store.getNumberOfSites();
            if (!this.state.expanded || resultsNumber == 0) {
                className += ' hidden';
            }
            return (
               <div className={className}>
                   <SearchResultsPanel ref="resultList" app={this.props.app} />
               </div>
            )
        },
        
        _renderControlPanel : function(){
            var that = this;
            var store = this.props.app.sites;
            var resultsNumber = store.getNumberOfSites();
            var toggleLabel;
            var results;
            if (!resultsNumber) {
                toggleLabel = (<span className="label">&nbsp;</span>);
                results = 'Aucun résultat';
            } else {
                var toggleLabel = 'Ouvrir la liste';
                if (this.state.expanded){
                    toggleLabel = 'Fermer la liste';
                };
                results = resultsNumber > 1 ? 
                    resultsNumber + ' résultats' : '1 résultat';
                toggleLabel = (<a href="#"
                    className="label"
                    onClick={this._toggleExpandedView}>{toggleLabel}</a>);
            }
            return (
                <div ref="searchControl" className="search-control" onClick={this._toggleExpandedView}>
                    <div className="list-toggle">
                        <span className='results-info'>{results}</span>
                        {toggleLabel}
                    </div>
                </div>
            );
        },
        render : function(){
            var app = this.props.app;
            var className = 'zone-right';
            if (this.state.expanded){
                className += ' list-open';
            }
            return (
                <div className={className}>
                    <EntityDetailsPanel app={app} ref="detailsPanel"/>
                    <div className="search-panel" ref="searchPanel">
                        <SearchBoxPanel ref="searchBox" app={app} />
                        {this._renderSearchResults()}
                        {this._renderControlPanel()}
                    </div>
                    <MapPanel app={app} ref="mapPanel"/>
                    <MapControlsPanel app={app} />
                    <MapLegendPanel app={app} />
                </div>
            );
        },
    });
   
});
 
