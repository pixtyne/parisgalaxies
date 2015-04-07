/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react', 'mosaic-core', 'mosaic-commons',
        './AppViewMixin', 'jsx!./PopupPanel',
        'text!../../content/about.html', 'text!../../content/embed.html',
        'text!../../content/contact.html',
        './AppDialogsMixin'],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');
    var Mosaic = require('mosaic-commons');
    var AppViewMixin = require('./AppViewMixin');
    var PopupPanel = require('jsx!./PopupPanel');
    var AppDialogsMixin = require('./AppDialogsMixin');

    
    var MainMenuPanel = React.createClass({
        displayName : 'MainMenuPanel',
        mixins : [AppDialogsMixin],
        render : function() {
            var br = <br />;
            var state = this.state;
            var activePopup = '';
            if (state) {
                activePopup = state.activePopup;
            }
            return (
                <ul>
                    <li>
                        <a href="#" className={'a-propos' + (activePopup == 'a-propos' ? ' active' : '')} onClick={this.onClick.bind(this, 'about')}>
                        <span className="link-label a-propos">À propos</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" className={'engagez-vous' + (activePopup == 'engagez-vous' ? ' active' : '')} onClick={this.onClick.bind(this, 'embed')}>
                            <span className="link-label">Insérer carte{br}Embed map</span>
                        </a>
                    </li>
                    <li>
                        <a href="#" className={'contact' + (activePopup == 'contact' ? ' active' : '')} onClick={this.onClick.bind(this, 'contact')}>
                            <span className="link-label">Proposer un lieu{br}Submit an address</span>
                        </a>
                    </li>
                </ul>
            );
        },
        onClick: function(index) {
            this._openPopup(index);
            this.setState({activePopup: index});
        }
    });
    return MainMenuPanel;
});
