/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', './DomUtilsMixin' ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var DomUtilsMixin = require('./DomUtilsMixin');
    
    var PopupPanel = React.createClass({
         statics : {
            Container : React.createClass({
                 componentDidMount : function(){
                     if (this.props.app.popupContainer) {
                         throw new Error('A popup container ' + //
                                 'is already defined');
                     }
                    this.props.app.popupContainer = this;
                },
                componentWillUnmount : function(){
                    this.props.app.popupContainer = null;
                },
                showPopup : function(popup){
                    this.setState(this._newState({popup : popup}));
                },
                _newState : function(options){
                    var state = _.extend({}, this.state, options);
                    return state;
                },
                closePopup : function(){
                    this.setState(this._newState({
                        popup : null
                    }));
                },
                getInitialState : function(){
                    return this._newState();
                },
                render : function(){
                    var popup = this.state.popup;
                    var className = 'zone-dialogs';
                    if (popup){
                        className += ' visible';
                    }
                    return React.DOM.div({className: className}, popup);
                }
            }),
            closePopup : function(options){
                var app = options.app;
                var container = app.popupContainer;
                container.closePopup();
            },
            openPopup : function(options, content){
                var app = options.app;
                var container = app.popupContainer;
                var args = _.toArray(arguments);
                var panel = PopupPanel.apply(this, args);
                container.showPopup(panel);
            },
         },
         mixins : [DomUtilsMixin],

        componentDidMount : function(){
            this._updatePopupHeight = _.bind(this._updatePopupHeight, this);
            this._addResizeListener(this._updatePopupHeight);
            this._updatePopupHeight();
        },
        componentDidUpdate : function(){
            this._updatePopupHeight();
        },
        componentWillUnmount : function(){
            this._removeResizeListener(this._updatePopupHeight);
        },
        _updatePopupHeight : function(){
            var container = this.refs.container;
            var innerBorder = this.refs.innerBorder;
            var outerBorder = this.refs.outerBorder;
            if (!container || !innerBorder || !outerBorder){
                return ; 
            }
            var containerNode = container.getDOMNode();
            var innerPosition = 
                this._getPosition(innerBorder.getDOMNode(), containerNode);
            var outerPosition = 
                this._getPosition(outerBorder.getDOMNode(), containerNode);
            var containerHeight = this._getOuterHeight(containerNode);
            var delta = outerPosition.top + innerPosition.top  * 2;
            var height = containerHeight - delta; 
            height = Math.max(height, 0);
            if (!isNaN(height) && this.state.maxHeight !== height){
                this.setState(this._newState({
                    maxHeight: height
                }));
            }
        },
        _newState : function(options){
            var state = _.extend({}, this.state, options);
            return state;
        },
        getInitialState : function(){
            return this._newState();
        },
         _handleClose : function(ev){
             ev.stopPropagation();
             ev.preventDefault();
             var onClose = this.props.onClose;
             var close = true;
             if (_.isFunction(onClose)){
                 var result = onClose(ev);
                 close = !(result === false);
             }
             if (close){
                 PopupPanel.closePopup({app : this.props.app});
             }
         },
        
        render : function(){
            var style = {
                maxHeight: this.state.maxHeight
            };
            
            var className = this.props.className||'';
            className = "modal-container " + className;
            return (
            <div className="modals" ref="container">
                <div className="modal-bg" onClick={this._handleClose}></div>
                <div className={className}>
                    <div className="modal-border" ref="outerBorder">
                        <div className="modal-close" onClick={this._handleClose}></div>
                        <div className="modal-inner" 
                            onClick={function(ev){ev.stopPropagation();}}>
                            <div className="modal-content"
                                ref="innerBorder"
                                style={style}>
                                <div className="align-center">
                                    {this.props.children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            );
        }
    });
   
    return PopupPanel;
   
});
 