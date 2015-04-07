/**
 * @jsx React.DOM
 */
define(
// Dependencies
[ 'require', 'underscore', 'react'   ],
// Module
function(require) {
    'use strict';
    var _ = require('underscore');
    var React = require('react');

    return React.createClass({
        displayName : 'OldBrowserNotification',
        render : function(){
            return (
                <div className="cci-preference-commerce cci-big-screen">
                <div className="zone-dialogs visible">
                    <div className="modals">
                        <div className="modal-bg"></div>
                        <div className="modal-container modal-old-browser">
                            <div className="modal-border">
                                <div className="modal-inner">
                                    <div className="modal-content" style={{maxHeight: '354px', maxWidth: '554px'}}>
                                        <div className="align-center">
                                        
                                            <div className="modal-welcome">
                                                <div className="dialog welcome">
                                                    <h1>Navigateur non supporté</h1>
                                                    <p style={{padding:'1em'}}>
                                                        Le navigateur utilisé n'est pas supporté par ce site. Nous vous invitons à utiliser l'un des navigateurs suivants dans une version récente : 
                                                    </p>
                                                    <ul>
                                                        <li><a href="https://www.mozilla.org/fr/firefox/new/" target="_blank">Firefox</a></li>
                                                        <li><a href="https://www.google.fr/chrome/browser/" target="_blank">Google Chrome</a></li>
                                                        <li><a href="http://windows.microsoft.com/fr-fr/internet-explorer/download-ie" target="_blank">Internet Explorer</a></li>
                                                        <li><a href="http://www.opera.com/fr" target="_blank">Opera</a></li>
                                                    </ul>
                                                    <p></p>
                                                    <p></p>
                                                    <p></p>
                                                </div>
                                            </div>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                </div>
            );
        },
    });
   
   
});
 