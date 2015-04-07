var Fs = require('fs');
var Program = require('commander');
var Yaml = require('js-yaml');
var _ = require('underscore');

function Config(configFile) {
    this.props = Yaml.safeLoad(Fs.readFileSync(configFile), {
        encoding : 'utf-8'
    });
}

Config.prototype.getDbUrl = function() {

    var dbConfig = this.props.postgres;
    var tmpl = _.template('postgres://<%=user%>:<%=password%>@<%=host%>/<%=dbname%>');
    return tmpl({
        dbname : dbConfig.dbname,
        user : dbConfig.user,
        password : dbConfig.password,
        host : dbConfig.host
    });    

};

Config.prototype.getProperties = function() {
    return this.props;
    
}

module.exports = Config;
